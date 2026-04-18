'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, AlertTriangle, CheckCircle, Clock, Paperclip, Check, Plus, X, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { dbAddTransaction, dbUpdateTransaction } from '@/lib/supabase/db';

interface Transaction {
  id: string;
  date: string;
  entity: string;
  project_name?: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  invoice_id?: string;
  description?: string;
  is_reconciled: boolean;
  is_flagged?: boolean;
}

function exportCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Entity', 'Project', 'Type', 'Amount', 'Status', 'Invoice/PO', 'Reconciled'];
  const rows = transactions.map(t => [
    t.date, t.entity, t.project_name ?? '', t.type,
    t.amount, t.status, t.invoice_id ?? '', t.is_reconciled ? 'Yes' : 'No',
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zenn-ledger-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportPDF(transactions: Transaction[]) {
  const now = new Date().toLocaleDateString('en-CA');
  const totalIn = transactions.filter(t => t.type === 'incoming').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'outgoing').reduce((s, t) => s + t.amount, 0);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Zenn Studios – Financial Report ${now}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#111}h1{font-size:20px;border-bottom:2px solid #b6332e;padding-bottom:8px;color:#b6332e}h2{font-size:14px;margin-top:24px;color:#333}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}th{background:#f5f5f5;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#666}td{padding:8px 10px;border-bottom:1px solid #eee}.kpi{display:inline-block;margin:0 16px 16px 0;background:#f7f7f7;border-radius:8px;padding:12px 18px}.kpi-val{font-size:22px;font-weight:900;color:#b6332e}.kpi-lbl{font-size:10px;color:#888;text-transform:uppercase}footer{margin-top:40px;font-size:10px;color:#aaa}</style></head><body>
<h1>🏦 Zenn Studios — Master Financial Report</h1>
<p style="color:#888;font-size:12px">Generated: ${now} · Confidential</p>
<h2>Summary</h2>
<div><div class="kpi"><div class="kpi-val">$${totalIn.toLocaleString()}</div><div class="kpi-lbl">Total Incoming</div></div><div class="kpi"><div class="kpi-val">$${totalOut.toLocaleString()}</div><div class="kpi-lbl">Total Outgoing</div></div><div class="kpi"><div class="kpi-val">$${(totalIn - totalOut).toLocaleString()}</div><div class="kpi-lbl">Net</div></div></div>
<h2>All Transactions</h2>
<table><tr><th>Date</th><th>Entity</th><th>Project</th><th>Type</th><th>Amount</th><th>Status</th></tr>${transactions.map(t => `<tr><td>${t.date}</td><td>${t.entity}</td><td>${t.project_name ?? ''}</td><td style="color:${t.type === 'incoming' ? '#10b981' : '#f59e0b'}">${t.type}</td><td style="font-weight:700">${t.type === 'incoming' ? '+' : '-'}$${t.amount.toLocaleString()}</td><td>${t.status}</td></tr>`).join('')}</table>
<footer>© ${new Date().getFullYear()} Zenn Studios — Internal Use Only</footer></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) win.addEventListener('load', () => setTimeout(() => win.print(), 500));
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

const STATUS_CONFIG = {
  paid: { label: 'Paid', icon: CheckCircle, color: '#10b981' },
  pending: { label: 'Pending', icon: Clock, color: '#888' },
  overdue: { label: 'Overdue', icon: AlertTriangle, color: '#b6332e' },
  cancelled: { label: 'Cancelled', icon: CheckCircle, color: '#444' },
};

const EMPTY_FORM = {
  entity: '', project_name: '', type: 'incoming' as 'incoming' | 'outgoing',
  amount: '', status: 'pending' as Transaction['status'], description: '', invoice_id: '',
  date: new Date().toISOString().split('T')[0],
};

export default function MasterLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [drawerTxn, setDrawerTxn] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [csvDone, setCsvDone] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('os_transactions')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) setTransactions(data as Transaction[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const filtered = transactions.filter(t => {
    const matchSearch = t.entity.toLowerCase().includes(search.toLowerCase()) ||
      (t.project_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  const totalOutstanding = transactions.filter(t => (t.status === 'pending' || t.status === 'overdue') && t.type === 'incoming').reduce((s, t) => s + t.amount, 0);
  const totalLiabilities = transactions.filter(t => t.status === 'pending' && t.type === 'outgoing').reduce((s, t) => s + t.amount, 0);
  const liquidity = totalOutstanding > 0 ? ((totalOutstanding - totalLiabilities) / totalOutstanding * 100).toFixed(0) : '100';
  const grossRevenue = transactions.filter(t => t.type === 'incoming' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);

  const handleReconcile = async (txn: Transaction) => {
    await dbUpdateTransaction(txn.id, { is_reconciled: !txn.is_reconciled });
    setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, is_reconciled: !t.is_reconciled } : t));
  };

  const handleAddTransaction = async () => {
    if (!form.entity || !form.amount) return;
    setSaving(true);
    try {
      const row = await dbAddTransaction({
        entity: form.entity,
        project_name: form.project_name || null,
        type: form.type,
        amount: Number(form.amount),
        status: form.status,
        description: form.description || null,
        invoice_id: form.invoice_id || null,
        date: form.date,
        is_reconciled: false,
      });
      setTransactions(prev => [row as unknown as Transaction, ...prev]);
      setShowAddModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Add transaction error:', err);
      alert('Failed to add transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Master Financial Ledger</h1>
          <p className="text-xs text-[#555] mt-0.5">
            {loading ? 'Loading...' : `${transactions.length} transactions · Single source of truth for agency finances`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { exportCSV(filtered); setCsvDone(true); setTimeout(() => setCsvDone(false), 2500); }} className="btn-secondary text-xs">
            {csvDone ? <><Check className="w-3.5 h-3.5" /> Downloaded</> : <><Download className="w-3.5 h-3.5" /> Export CSV</>}
          </button>
          <button onClick={() => { exportPDF(filtered); setPdfDone(true); setTimeout(() => setPdfDone(false), 2500); }} className="btn-ghost text-xs">
            {pdfDone ? <><Check className="w-3.5 h-3.5" /> Opened</> : <><Download className="w-3.5 h-3.5" /> PDF Report</>}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-[rgba(182,51,46,0.15)]">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="section-label mb-2">Outstanding Receivables</p>
            <p className="text-2xl font-black text-[#eee]">${totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-[#555] mt-1">Unpaid client invoices</p>
          </div>
          <div>
            <p className="section-label mb-2">Total Liabilities</p>
            <p className="text-2xl font-black text-[#f59e0b]">${totalLiabilities.toLocaleString()}</p>
            <p className="text-xs text-[#555] mt-1">Pending affiliate payouts</p>
          </div>
          <div>
            <p className="section-label mb-2">Liquidity Ratio</p>
            <p className="text-2xl font-black text-[#10b981]">{liquidity}%</p>
            <div className="mt-2 progress-bar">
              <div className="progress-fill !bg-[#10b981]" style={{ width: `${Math.min(Number(liquidity), 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Tax Reserve (30% of Gross Revenue)</p>
            <p className="text-xs font-bold text-[#eee]">${Math.round(grossRevenue * 0.3).toLocaleString()} reserved</p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill !bg-[#3b82f6]" style={{ width: '30%' }} />
          </div>
          <p className="text-[10px] text-[#444] mt-1">Non-spendable. Tax liability estimate for current fiscal period.</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
            <input
              type="text"
              placeholder="Search entity or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="os-input pl-9 text-xs"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'incoming', 'outgoing'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${filter === f ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border border-[rgba(182,51,46,0.3)]' : 'text-[#555] hover:text-[#888]'}`}
              >
                {f}
              </button>
            ))}
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#444]" />}
        </div>

        <div className="overflow-x-auto">
          {!loading && filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs text-[#555]">No transactions found. Add your first transaction using the button above.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <th className="text-left px-4 py-3 section-label">Reconciled</th>
                  <th className="text-left px-4 py-3 section-label">Date</th>
                  <th className="text-left px-4 py-3 section-label">Entity</th>
                  <th className="text-left px-4 py-3 section-label">Project</th>
                  <th className="text-left px-4 py-3 section-label">Type</th>
                  <th className="text-right px-4 py-3 section-label">Amount</th>
                  <th className="text-left px-4 py-3 section-label">Status</th>
                  <th className="text-left px-4 py-3 section-label">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(txn => {
                  const status = STATUS_CONFIG[txn.status];
                  return (
                    <tr
                      key={txn.id}
                      className={`table-row-hover border-b border-[rgba(255,255,255,0.03)] last:border-0 ${txn.is_flagged ? 'bg-[rgba(182,51,46,0.03)]' : ''} ${txn.is_reconciled ? 'border-l-2 border-l-[#b6332e]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={txn.is_reconciled}
                          onChange={() => handleReconcile(txn)}
                          className="accent-[#b6332e] w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-[#666] font-mono whitespace-nowrap">{txn.date}</td>
                      <td className="px-4 py-3 text-xs text-[#ddd] font-semibold">{txn.entity}</td>
                      <td className="px-4 py-3 text-xs text-[#666] whitespace-nowrap">{txn.project_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${txn.type === 'incoming' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                          {txn.type === 'incoming' ? '↑ In' : '↓ Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold ${txn.type === 'incoming' ? 'text-[#10b981]' : 'text-[#eee]'}`}>
                          {txn.type === 'incoming' ? '+' : '-'}${txn.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: status.color, background: `${status.color}18` }}>{status.label}</span>
                          {txn.is_flagged && <span title="Margin discrepancy"><AlertTriangle className="w-3 h-3 text-[#b6332e]" /></span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDrawerTxn(txn)}
                          className="text-[#444] hover:text-[#b6332e] transition-colors"
                          title="View details"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#eee]">Add Transaction</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="section-label mb-1.5 block">Entity / Name *</label>
                  <input type="text" className="os-input" value={form.entity} onChange={e => setForm(f => ({ ...f, entity: e.target.value }))} placeholder="e.g. Apex Films Inc." autoFocus />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Type</label>
                  <select className="os-input cursor-pointer" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'incoming' | 'outgoing' }))}>
                    <option value="incoming">Incoming</option>
                    <option value="outgoing">Outgoing</option>
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Amount ($) *</label>
                  <input type="number" className="os-input" min={0} step={100} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Date</label>
                  <input type="date" className="os-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Status</label>
                  <select className="os-input cursor-pointer" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Transaction['status'] }))}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Project</label>
                  <input type="text" className="os-input" value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} placeholder="Project name" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Invoice / PO #</label>
                  <input type="text" className="os-input" value={form.invoice_id} onChange={e => setForm(f => ({ ...f, invoice_id: e.target.value }))} placeholder="INV-001" />
                </div>
                <div className="col-span-2">
                  <label className="section-label mb-1.5 block">Description</label>
                  <textarea className="os-input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional memo..." />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={handleAddTransaction} disabled={!form.entity || !form.amount || saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> Add Transaction</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side Drawer */}
      <AnimatePresence>
        {drawerTxn && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerTxn(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="w-96 bg-[#050505] border-l border-[rgba(255,255,255,0.06)] p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#eee]">Transaction Detail</h3>
                <button onClick={() => setDrawerTxn(null)} className="text-[#444] hover:text-white text-xl leading-none">×</button>
              </div>
              <div className="space-y-4">
                <div className="kpi-card">
                  <p className="section-label mb-1">Amount</p>
                  <p className="text-3xl font-black text-[#eee]">${drawerTxn.amount.toLocaleString()}</p>
                  <p className={`text-xs mt-1 font-semibold ${drawerTxn.type === 'incoming' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                    {drawerTxn.type === 'incoming' ? '↑ Receivable' : '↓ Payable'}
                  </p>
                </div>
                {[
                  { label: 'Entity', value: drawerTxn.entity },
                  { label: 'Project', value: drawerTxn.project_name ?? 'N/A' },
                  { label: 'Description', value: drawerTxn.description ?? 'N/A' },
                  { label: 'Date', value: drawerTxn.date },
                  { label: 'Invoice/PO', value: drawerTxn.invoice_id ?? 'N/A' },
                  { label: 'Status', value: drawerTxn.status },
                  { label: 'Reconciled', value: drawerTxn.is_reconciled ? 'Yes' : 'No' },
                ].map(row => (
                  <div key={row.label}>
                    <p className="section-label mb-1">{row.label}</p>
                    <p className="text-sm text-[#ccc] capitalize">{row.value}</p>
                  </div>
                ))}
                {drawerTxn.is_flagged && (
                  <div className="flex gap-2 bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.2)] rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-[#b6332e] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#b6332e]">Amount exceeds original Estimate Builder margin. Potential profit-margin erosion detected.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
