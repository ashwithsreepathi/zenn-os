'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Send, Download, CheckCircle, Eye, FileText, Copy, ChevronRight, Edit3, Clock } from 'lucide-react';
import { useStore, QUOTE_TEMPLATES } from '@/lib/store';
import type { Quote, QuoteLineItem } from '@/lib/store';

const CATEGORY_COLOR: Record<QuoteLineItem['category'], string> = {
  design: '#8b5cf6',
  development: '#3b82f6',
  video: '#f59e0b',
  strategy: '#10b981',
  retainer: '#b6332e',
  other: '#555',
};

const STATUS_CONFIG: Record<Quote['status'], { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#555' },
  sent: { label: 'Sent', color: '#3b82f6' },
  viewed: { label: 'Viewed', color: '#f59e0b' },
  accepted: { label: 'Accepted', color: '#10b981' },
  rejected: { label: 'Rejected', color: '#b6332e' },
  expired: { label: 'Expired', color: '#444' },
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function QuotePreview({ quote }: { quote: Partial<Quote> }) {
  const subtotal = (quote.lineItems ?? []).reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const discountAmt = subtotal * ((quote.discount ?? 0) / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = afterDiscount * ((quote.tax ?? 0) / 100);
  const total = afterDiscount + taxAmt;
  const today = new Date().toLocaleDateString('en-CA');

  return (
    <div className="bg-[#050505] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden font-mono text-xs">
      {/* Quote Header */}
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#b6332e] flex items-center justify-center">
                <span className="text-white font-black text-sm">Z</span>
              </div>
              <span className="font-black text-sm text-white tracking-tight">ZENN STUDIOS</span>
            </div>
            <p className="text-[#444] text-[10px]">hello@zennstudios.ca</p>
            <p className="text-[#444] text-[10px]">zennstudios.ca</p>
          </div>
          <div className="text-right">
            <p className="text-[#b6332e] font-black text-lg mb-1">QUOTATION</p>
            <p className="text-[#444] text-[10px]">Date: {today}</p>
            <p className="text-[#444] text-[10px]">Valid Until: {quote.validUntil ?? '—'}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">Prepared For</p>
            <p className="text-[#eee] font-bold">{quote.clientName || '[ Client Name ]'}</p>
            {quote.clientCompany && <p className="text-[#666]">{quote.clientCompany}</p>}
            {quote.clientEmail && <p className="text-[#666]">{quote.clientEmail}</p>}
          </div>
          <div>
            <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">Project</p>
            <p className="text-[#eee]">{quote.projectType || '[ Project Type ]'}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.05)]">
              <th className="text-left py-2 text-[10px] text-[#444] uppercase tracking-wider">Description</th>
              <th className="text-center py-2 text-[10px] text-[#444] uppercase tracking-wider">Qty</th>
              <th className="text-right py-2 text-[10px] text-[#444] uppercase tracking-wider">Unit</th>
              <th className="text-right py-2 text-[10px] text-[#444] uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
            {(quote.lineItems ?? []).map((li) => (
              <tr key={li.id}>
                <td className="py-2.5 text-[#ccc]">
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-2 align-middle" style={{ background: CATEGORY_COLOR[li.category] }} />
                  {li.description}
                </td>
                <td className="py-2.5 text-center text-[#888]">{li.qty}</td>
                <td className="py-2.5 text-right text-[#888]">${li.unitPrice.toLocaleString()}</td>
                <td className="py-2.5 text-right font-bold text-[#eee]">${(li.qty * li.unitPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 border-t border-[rgba(255,255,255,0.05)] pt-4 space-y-1.5 text-right">
          <div className="flex justify-between text-[#555]">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          {(quote.discount ?? 0) > 0 && (
            <div className="flex justify-between text-[#10b981]">
              <span>Discount ({quote.discount}%)</span>
              <span>-${discountAmt.toLocaleString()}</span>
            </div>
          )}
          {(quote.tax ?? 0) > 0 && (
            <div className="flex justify-between text-[#888]">
              <span>Tax ({quote.tax}%)</span>
              <span>+${taxAmt.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <span>TOTAL CAD</span>
            <span className="text-[#b6332e]">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">Terms & Notes</p>
            <p className="text-[#555] text-[10px] leading-relaxed">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotationMaker() {
  const { quotes, addQuote, updateQuote, deleteQuote } = useStore();
  const [activeTab, setActiveTab] = useState<'builder' | 'library'>('library');
  const [editingQuote, setEditingQuote] = useState<Partial<Quote> & { lineItems: QuoteLineItem[] }>({
    clientName: '', clientEmail: '', clientCompany: '', projectType: '', notes: '',
    lineItems: [], discount: 0, tax: 13, validUntil: '',
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTemplate = (tplId: string) => {
    const tpl = QUOTE_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    const inDate = new Date();
    inDate.setDate(inDate.getDate() + 30);
    setEditingQuote(q => ({
      ...q,
      projectType: tpl.projectType,
      notes: tpl.notes,
      templateId: tpl.id,
      validUntil: inDate.toISOString().split('T')[0],
      lineItems: tpl.lineItems.map(li => ({ ...li, id: generateId() })),
    }));
    setActiveTab('builder');
  };

  const addLineItem = () => {
    setEditingQuote(q => ({
      ...q,
      lineItems: [...q.lineItems, { id: generateId(), description: '', qty: 1, unitPrice: 0, category: 'other' }],
    }));
  };

  const updateLineItem = (id: string, updates: Partial<QuoteLineItem>) => {
    setEditingQuote(q => ({
      ...q,
      lineItems: q.lineItems.map(li => li.id === id ? { ...li, ...updates } : li),
    }));
  };

  const removeLineItem = (id: string) => {
    setEditingQuote(q => ({ ...q, lineItems: q.lineItems.filter(li => li.id !== id) }));
  };

  const saveQuote = async () => {
    if (!editingQuote.clientName) return;
    setSaving(true);
    await addQuote(editingQuote as Omit<Quote, 'id' | 'createdAt' | 'status'>);
    setEditingQuote({ clientName: '', clientEmail: '', clientCompany: '', projectType: '', notes: '', lineItems: [], discount: 0, tax: 13, validUntil: '' });
    setSaving(false);
    setActiveTab('library');
  };

  const handleSend = async (id: string) => {
    await updateQuote(id, { status: 'sent', sentAt: new Date().toISOString() });
  };

  const subtotal = editingQuote.lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const total = subtotal * (1 - (editingQuote.discount ?? 0) / 100) * (1 + (editingQuote.tax ?? 0) / 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Quotation Maker</h1>
          <p className="text-xs text-[#555] mt-0.5">Generate, send &amp; track client quotes — 4 templates included</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('builder'); setEditingQuote({ clientName: '', clientEmail: '', clientCompany: '', projectType: '', notes: '', lineItems: [], discount: 0, tax: 13, validUntil: '' }); }}
            className="btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Quote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0a0a0a] rounded-xl p-1 w-fit border border-[rgba(255,255,255,0.05)]">
        {(['library', 'builder'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs px-4 py-1.5 rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-[rgba(255,255,255,0.08)] text-[#eee]' : 'text-[#555] hover:text-[#888]'}`}
          >
            {tab === 'library' ? '📋 Quote Library' : '✏️ Builder'}
          </button>
        ))}
      </div>

      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Templates */}
          <div>
            <h2 className="text-sm font-bold text-[#eee] mb-3">Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {QUOTE_TEMPLATES.map((tpl) => (
                <motion.div key={tpl.id} whileHover={{ scale: 1.02 }} className="glass-panel rounded-2xl p-5 cursor-pointer glass-panel-hover" onClick={() => loadTemplate(tpl.id)}>
                  <div className="w-8 h-8 rounded-xl bg-[rgba(182,51,46,0.15)] flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4 text-[#b6332e]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#eee] mb-1">{tpl.name}</h3>
                  <p className="text-[10px] text-[#555] mb-3 leading-relaxed">{tpl.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#444]">{tpl.lineItems.length} line items</span>
                    <span className="text-[10px] text-[#3b82f6]">{tpl.estimatedDays}d est.</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-[#b6332e] flex items-center gap-1">
                    Use Template <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quote History */}
          <div>
            <h2 className="text-sm font-bold text-[#eee] mb-3">Quote History ({quotes.length})</h2>
            {quotes.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center">
                <FileText className="w-8 h-8 text-[#333] mx-auto mb-3" />
                <p className="text-xs text-[#555]">No quotes yet. Use a template or create from scratch.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-[rgba(255,255,255,0.05)]">
                    <tr>
                      <th className="text-left px-5 py-3 section-label">Client</th>
                      <th className="text-left px-5 py-3 section-label">Project</th>
                      <th className="text-left px-5 py-3 section-label">Status</th>
                      <th className="text-right px-5 py-3 section-label">Total</th>
                      <th className="px-5 py-3 section-label">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {quotes.map(q => {
                      const sub = q.lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
                      const tot = sub * (1 - (q.discount ?? 0) / 100) * (1 + (q.tax ?? 0) / 100);
                      const sc = STATUS_CONFIG[q.status];
                      return (
                        <tr key={q.id} className="table-row-hover">
                          <td className="px-5 py-3">
                            <p className="text-xs font-bold text-[#eee]">{q.clientName}</p>
                            <p className="text-[10px] text-[#555]">{q.clientEmail}</p>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#888]">{q.projectType}</td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold" style={{ color: sc.color }}>{sc.label}</span>
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-black text-[#eee]">${Math.round(tot).toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              {q.status === 'draft' && (
                                <button onClick={() => handleSend(q.id)} className="btn-primary text-[9px] py-1 px-2">
                                  <Send className="w-3 h-3" /> Send
                                </button>
                              )}
                              <button onClick={() => { setEditingQuote({ ...q, lineItems: q.lineItems ?? [] }); setActiveTab('builder'); }} className="btn-ghost text-[9px] py-1 px-2">
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button onClick={() => deleteQuote(q.id)} className="text-[#333] hover:text-[#b6332e] transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="space-y-5">
            {/* Client Info */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-[#eee]">Client Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label mb-1.5 block">Client Name *</label>
                  <input type="text" className="os-input" value={editingQuote.clientName} onChange={e => setEditingQuote(q => ({ ...q, clientName: e.target.value }))} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Company</label>
                  <input type="text" className="os-input" value={editingQuote.clientCompany} onChange={e => setEditingQuote(q => ({ ...q, clientCompany: e.target.value }))} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Email</label>
                  <input type="email" className="os-input" value={editingQuote.clientEmail} onChange={e => setEditingQuote(q => ({ ...q, clientEmail: e.target.value }))} placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Project Type</label>
                  <input type="text" className="os-input" value={editingQuote.projectType} onChange={e => setEditingQuote(q => ({ ...q, projectType: e.target.value }))} placeholder="Web Platform" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Valid Until</label>
                  <input type="date" className="os-input" value={editingQuote.validUntil} onChange={e => setEditingQuote(q => ({ ...q, validUntil: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#eee]">Line Items</h2>
                <button onClick={addLineItem} className="btn-ghost text-xs">
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>
              {editingQuote.lineItems.length === 0 && (
                <p className="text-xs text-[#444] py-2">No items yet. Add line items or load a template.</p>
              )}
              {editingQuote.lineItems.map(li => (
                <div key={li.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input type="text" className="os-input text-xs" placeholder="Description" value={li.description} onChange={e => updateLineItem(li.id, { description: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <select className="os-input text-xs cursor-pointer" value={li.category} onChange={e => updateLineItem(li.id, { category: e.target.value as QuoteLineItem['category'] })}>
                      {(['design', 'development', 'video', 'strategy', 'retainer', 'other'] as const).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input type="number" className="os-input text-xs text-center" min={1} value={li.qty} onChange={e => updateLineItem(li.id, { qty: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-3">
                    <input type="number" className="os-input text-xs" min={0} step={50} placeholder="Price" value={li.unitPrice || ''} onChange={e => updateLineItem(li.id, { unitPrice: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeLineItem(li.id)} className="text-[#333] hover:text-[#b6332e] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Discount + Tax */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                <div>
                  <label className="section-label mb-1 block">Discount (%)</label>
                  <input type="number" className="os-input text-xs" min={0} max={100} value={editingQuote.discount ?? 0} onChange={e => setEditingQuote(q => ({ ...q, discount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="section-label mb-1 block">Tax (%)</label>
                  <input type="number" className="os-input text-xs" min={0} max={100} value={editingQuote.tax ?? 13} onChange={e => setEditingQuote(q => ({ ...q, tax: Number(e.target.value) }))} />
                </div>
              </div>

              {/* Running Total */}
              <div className="bg-[#0a0a0a] rounded-xl px-4 py-3 border border-[rgba(182,51,46,0.2)] flex items-center justify-between">
                <span className="text-xs text-[#555]">Quote Total</span>
                <span className="text-lg font-black text-[#b6332e]">${Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="glass-panel rounded-2xl p-5 space-y-2">
              <h2 className="text-sm font-bold text-[#eee]">Terms &amp; Notes</h2>
              <textarea className="os-input resize-none" rows={4} value={editingQuote.notes} onChange={e => setEditingQuote(q => ({ ...q, notes: e.target.value }))} placeholder="Payment terms, deliverable notes, IP policy..." />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setPreview(p => !p)} className="btn-secondary flex-1 justify-center text-xs">
                <Eye className="w-3.5 h-3.5" /> {preview ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={saveQuote}
                disabled={saving || !editingQuote.clientName}
                className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
              >
                {saving ? 'Saving...' : <><Download className="w-3.5 h-3.5" /> Save Quote</>}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#eee]">Live Preview</h2>
            <QuotePreview quote={editingQuote} />
          </div>
        </div>
      )}
    </div>
  );
}
