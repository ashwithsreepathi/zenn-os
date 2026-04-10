'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, ChevronRight, AlertTriangle, CheckCircle, Clock, Paperclip } from 'lucide-react';
import { mockTransactions, mockKPIs } from '@/lib/mock-data';
import type { Transaction } from '@/lib/types';

const STATUS_CONFIG = {
  paid: { label: 'Paid', class: 'badge-success', icon: CheckCircle },
  pending: { label: 'Pending', class: 'badge-neutral', icon: Clock },
  overdue: { label: 'Overdue', class: 'badge-brand', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', class: 'badge-neutral', icon: CheckCircle },
};

function HeatmapCell({ day, value }: { day: number; value: 'in' | 'out' | 'both' | null }) {
  const bg =
    value === 'in' ? 'bg-white/20' :
    value === 'out' ? 'bg-[#b6332e]/40' :
    value === 'both' ? 'bg-[#b6332e]/70' :
    'bg-[#0a0a0a]';
  return (
    <div className={`aspect-square rounded-sm ${bg} border border-[rgba(255,255,255,0.04)] flex items-center justify-center`}>
      <span className="text-[9px] text-[#444]">{day}</span>
    </div>
  );
}

export default function MasterLedger() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [reconciling, setReconciling] = useState<Record<string, boolean>>({});
  const [drawerTxn, setDrawerTxn] = useState<Transaction | null>(null);

  const filtered = mockTransactions.filter(t => {
    const matchSearch = t.entity.toLowerCase().includes(search.toLowerCase()) || t.projectName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  const totalOutstanding = mockTransactions.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((s, t) => s + (t.type === 'incoming' ? t.amount : 0), 0);
  const totalLiabilities = mockTransactions.filter(t => t.status === 'pending' && t.type === 'outgoing').reduce((s, t) => s + t.amount, 0);
  const liquidity = totalOutstanding > 0 ? ((totalOutstanding - totalLiabilities) / totalOutstanding * 100).toFixed(0) : '0';

  // Mock heatmap data for April
  const heatmapData: Record<number, 'in' | 'out' | 'both' | null> = {
    1: 'in', 3: 'out', 5: 'both', 6: 'in', 8: 'out', 10: 'in',
    13: 'both', 15: 'in', 18: 'out', 20: 'in', 22: 'both',
    25: 'out', 28: 'in', 30: 'in',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Master Financial Ledger</h1>
          <p className="text-xs text-[#555] mt-0.5">Single source of truth for agency finances</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Export CSV</button>
          <button className="btn-ghost text-xs"><Download className="w-3.5 h-3.5" /> PDF Report</button>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-[rgba(182,51,46,0.15)]">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="section-label mb-2">Total Outstanding Receivables</p>
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
              <div className="progress-fill !bg-[#10b981]" style={{ width: `${liquidity}%` }} />
            </div>
          </div>
        </div>

        {/* Tax-Jar Reserve */}
        <div className="mt-5 pt-5 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Tax Reserve (30% of Gross)</p>
            <p className="text-xs font-bold text-[#eee]">${Math.round(mockKPIs.grossRevenue * 0.3).toLocaleString()} reserved</p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill !bg-[#3b82f6]" style={{ width: '30%' }} />
          </div>
          <p className="text-[10px] text-[#444] mt-1">Non-spendable. Tax liability estimate for current fiscal period.</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#eee]">April 2026 — Cash Flow Heatmap</h2>
          <div className="flex items-center gap-4 text-xs text-[#555]">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white/20" /> Incoming</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#b6332e]/40" /> Outgoing</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#b6332e]/70" /> Both</div>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(30,_1fr)] gap-1">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
            <HeatmapCell key={day} day={day} value={heatmapData[day] ?? null} />
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Table Controls */}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                <th className="text-left px-4 py-3 section-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => {
                const status = STATUS_CONFIG[txn.status];
                const isReconciled = reconciling[txn.id] ?? txn.isReconciled;
                return (
                  <tr
                    key={txn.id}
                    className={`table-row-hover border-b border-[rgba(255,255,255,0.03)] last:border-0 ${txn.isFlagged ? 'bg-[rgba(182,51,46,0.03)]' : ''} ${isReconciled ? 'border-l-2 border-l-[#b6332e]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isReconciled}
                        onChange={() => setReconciling(prev => ({ ...prev, [txn.id]: !isReconciled }))}
                        className="accent-[#b6332e] w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#666] font-mono whitespace-nowrap">{txn.date}</td>
                    <td className="px-4 py-3 text-xs text-[#ddd] font-semibold">{txn.entity}</td>
                    <td className="px-4 py-3 text-xs text-[#666] whitespace-nowrap">{txn.projectName}</td>
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
                        <span className={status.class}>{status.label}</span>
                        {txn.isFlagged && <span title="Margin discrepancy detected"><AlertTriangle className="w-3 h-3 text-[#b6332e]" /></span>}
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
        </div>
      </div>

      {/* Side Drawer */}
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
                { label: 'Project', value: drawerTxn.projectName },
                { label: 'Description', value: drawerTxn.description },
                { label: 'Date', value: drawerTxn.date },
                { label: 'Invoice/PO', value: drawerTxn.invoiceId ?? 'N/A' },
                { label: 'Status', value: drawerTxn.status },
              ].map(row => (
                <div key={row.label}>
                  <p className="section-label mb-1">{row.label}</p>
                  <p className="text-sm text-[#ccc] capitalize">{row.value}</p>
                </div>
              ))}
              {drawerTxn.isFlagged && (
                <div className="flex gap-2 bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.2)] rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-[#b6332e] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#b6332e]">Amount exceeds original Estimate Builder margin. Potential profit-margin erosion detected.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
