/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Send, Download, CheckCircle, Eye, FileText, Copy, ChevronRight, Edit3, Clock } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface QuoteLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  category: 'design' | 'development' | 'video' | 'strategy' | 'retainer' | 'other';
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  projectType: string;
  lineItems: QuoteLineItem[];
  notes: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  templateId?: string;
  createdAt: string;
  sentAt?: string;
  discount?: number;
  tax?: number;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  projectType: string;
  lineItems: Omit<QuoteLineItem, 'id'>[];
  notes: string;
  estimatedDays: number;
}

export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tpl_brand',
    name: 'Brand Identity Package',
    description: 'Logo, brand guidelines, color system, typography',
    projectType: 'Branding',
    estimatedDays: 21,
    notes: 'All source files (AI, PDF, PNG) delivered upon final payment. IP transfers upon full settlement.',
    lineItems: [
      { description: 'Brand Discovery Workshop (2 sessions)', qty: 1, unitPrice: 1500, category: 'strategy' },
      { description: 'Logo Design (3 concepts + revisions)', qty: 1, unitPrice: 3500, category: 'design' },
      { description: 'Brand Guidelines Document', qty: 1, unitPrice: 1200, category: 'design' },
      { description: 'Color System + Typography Spec', qty: 1, unitPrice: 800, category: 'design' },
      { description: 'Business Card + Letterhead Design', qty: 1, unitPrice: 600, category: 'design' },
      { description: 'Social Media Kit (6 templates)', qty: 1, unitPrice: 900, category: 'design' },
    ],
  },
  {
    id: 'tpl_web',
    name: 'Web Platform Build',
    description: 'Custom web app or multi-page marketing site',
    projectType: 'Web Development',
    estimatedDays: 60,
    notes: 'Built on Next.js + Tailwind. Performance-first, CMS-ready. 30-day post-launch support included.',
    lineItems: [
      { description: 'Discovery & Architecture Planning', qty: 1, unitPrice: 2500, category: 'strategy' },
      { description: 'UI/UX Design System (Figma)', qty: 1, unitPrice: 4000, category: 'design' },
      { description: 'Frontend Development (per page)', qty: 8, unitPrice: 800, category: 'development' },
      { description: 'CMS Integration (Sanity/Contentful)', qty: 1, unitPrice: 2000, category: 'development' },
      { description: 'Backend/API Integration', qty: 1, unitPrice: 3500, category: 'development' },
      { description: 'QA, Performance Audit & Launch', qty: 1, unitPrice: 1500, category: 'development' },
    ],
  },
  {
    id: 'tpl_video',
    name: 'Video Campaign Package',
    description: 'Hero video, social cuts, raw footage archival',
    projectType: 'Video Production',
    estimatedDays: 28,
    notes: 'All footage archived in 4K ProRes. Includes 3 rounds of revisions. Usage rights transferred upon final payment.',
    lineItems: [
      { description: 'Pre-Production & Storyboard', qty: 1, unitPrice: 1500, category: 'strategy' },
      { description: 'Shoot Day (Full Crew)', qty: 2, unitPrice: 3500, category: 'video' },
      { description: 'Primary Edit (Hero 60–90s)', qty: 1, unitPrice: 2500, category: 'video' },
      { description: 'Color Grade & Grade Master', qty: 1, unitPrice: 1200, category: 'video' },
      { description: 'Sound Design & Mix', qty: 1, unitPrice: 900, category: 'video' },
      { description: 'Social Cuts (3x :30 + 3x :15)', qty: 1, unitPrice: 1800, category: 'video' },
    ],
  },
  {
    id: 'tpl_retainer',
    name: 'Monthly Retainer',
    description: 'Ongoing social content, ads, and brand support',
    projectType: 'Retainer',
    estimatedDays: 30,
    notes: 'Month-to-month. 30-day notice required for cancellation. Hours do not roll over.',
    lineItems: [
      { description: 'Social Media Content (12 posts/mo)', qty: 1, unitPrice: 1800, category: 'retainer' },
      { description: 'Ad Creative (4 sets/mo)', qty: 1, unitPrice: 1200, category: 'retainer' },
      { description: 'Monthly Strategy Call', qty: 1, unitPrice: 300, category: 'strategy' },
      { description: 'Performance Report + Analytics', qty: 1, unitPrice: 200, category: 'strategy' },
    ],
  },
];

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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'library'>('library');
  const [editingQuote, setEditingQuote] = useState<Partial<Quote> & { lineItems: QuoteLineItem[] }>({
    clientName: '', clientEmail: '', clientCompany: '', projectType: '', notes: '',
    lineItems: [], discount: 0, tax: 13, validUntil: '',
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  

  const loadQuotes = async () => {
    const { data } = await supabase.from('os_quotes').select('*').order('created_at', { ascending: false });
    if (data) {
      setQuotes(data.map(q => ({
        id: q.id,
        clientName: q.client_name,
        clientEmail: q.client_email,
        clientCompany: q.client_company,
        projectType: q.project_type,
        lineItems: q.line_items || [],
        notes: q.notes,
        validUntil: q.valid_until,
        status: q.status,
        templateId: q.template_id,
        createdAt: q.created_at,
        sentAt: q.sent_at,
        discount: q.discount,
        tax: q.tax
      } as any)));
    }
  }
  useEffect(() => { loadQuotes(); }, []);

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
    
    const dbPayload = {
      client_name: editingQuote.clientName,
      client_email: editingQuote.clientEmail || null,
      client_company: editingQuote.clientCompany || null,
      project_type: editingQuote.projectType || null,
      line_items: editingQuote.lineItems,
      notes: editingQuote.notes || null,
      valid_until: editingQuote.validUntil || null,
      status: editingQuote.status || 'draft',
      template_id: editingQuote.templateId || null,
      discount: editingQuote.discount || 0,
      tax: editingQuote.tax || 13
    } as any;

    if (editingQuote.id) {
      await supabase.from('os_quotes').update(dbPayload).eq('id', editingQuote.id);
    } else {
      await supabase.from('os_quotes').insert(dbPayload);
    }
    
    await loadQuotes();
    setEditingQuote({ clientName: '', clientEmail: '', clientCompany: '', projectType: '', notes: '', lineItems: [], discount: 0, tax: 13, validUntil: '' });
    setSaving(false);
    setActiveTab('library');
  };

  const handleSend = async (id: string) => {
    await supabase.from('os_quotes').update({ status: 'sent', sent_at: new Date().toISOString() } as any).eq('id', id);
    await loadQuotes();
  };

  const deleteQuote = async (id: string) => {
    await supabase.from('os_quotes').delete().eq('id', id);
    await loadQuotes();
  };

  const downloadQuotePDF = () => {
    const sub = editingQuote.lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
    const discAmt = sub * ((editingQuote.discount ?? 0) / 100);
    const afterDisc = sub - discAmt;
    const taxAmt = afterDisc * ((editingQuote.tax ?? 0) / 100);
    const tot = afterDisc + taxAmt;
    const today = new Date().toLocaleDateString('en-CA');
    const rows = editingQuote.lineItems.map(li =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#333">${li.description}</td>
       <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;color:#666">${li.qty}</td>
       <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#666">$${li.unitPrice.toLocaleString()}</td>
       <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700">$${(li.qty * li.unitPrice).toLocaleString()}</td></tr>`
    ).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Quotation – ${editingQuote.clientName || 'Client'}</title>
<style>body{font-family:Arial,sans-serif;max-width:780px;margin:0 auto;padding:48px;color:#111;font-size:13px}h1{color:#b6332e;font-size:22px;font-weight:900;letter-spacing:.05em;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:16px}th{text-align:left;padding:8px 0;border-bottom:2px solid #b6332e;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#777}.total-row td{padding:6px 0;}.grand{font-size:18px;font-weight:900;color:#b6332e}footer{margin-top:40px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:16px}</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
  <div><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="width:28px;height:28px;background:#b6332e;border-radius:6px;display:flex;align-items:center;justify-content:center"><span style="color:white;font-weight:900;font-size:14px">Z</span></div><span style="font-weight:900;font-size:16px;letter-spacing:.05em">ZENN STUDIOS</span></div><p style="color:#888;font-size:11px;margin:2px 0">hello@zennstudios.ca</p><p style="color:#888;font-size:11px;margin:2px 0">zennstudios.ca</p></div>
  <div style="text-align:right"><h1>QUOTATION</h1><p style="color:#888;font-size:11px;margin:2px 0">Date: ${today}</p><p style="color:#888;font-size:11px;margin:2px 0">Valid Until: ${editingQuote.validUntil || '—'}</p></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;background:#f9f9f9;padding:16px;border-radius:8px">
  <div><p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px">Prepared For</p><p style="font-weight:700;margin:0">${editingQuote.clientName || '—'}</p>${editingQuote.clientCompany ? `<p style="color:#666;margin:2px 0">${editingQuote.clientCompany}</p>` : ''}${editingQuote.clientEmail ? `<p style="color:#666;margin:2px 0">${editingQuote.clientEmail}</p>` : ''}</div>
  <div><p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px">Project</p><p style="margin:0">${editingQuote.projectType || '—'}</p></div>
</div>
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table>
<table style="margin-top:16px;width:300px;margin-left:auto"><tbody class="total-row">${editingQuote.discount ? `<tr><td style="color:#888">Subtotal</td><td style="text-align:right">$${sub.toLocaleString()}</td></tr><tr><td style="color:#888">Discount (${editingQuote.discount}%)</td><td style="text-align:right;color:#b6332e">−$${discAmt.toLocaleString(undefined, {maximumFractionDigits:0})}</td></tr>` : ''}<tr><td style="color:#888">Tax (${editingQuote.tax ?? 13}%)</td><td style="text-align:right">$${taxAmt.toLocaleString(undefined, {maximumFractionDigits:0})}</td></tr><tr><td class="grand">Total</td><td class="grand" style="text-align:right">$${Math.round(tot).toLocaleString()}</td></tr></tbody></table>
${editingQuote.notes ? `<div style="margin-top:24px;background:#f9f9f9;border-radius:8px;padding:16px"><p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px">Terms &amp; Notes</p><p style="color:#555;font-size:12px;line-height:1.6;margin:0">${editingQuote.notes}</p></div>` : ''}
<footer>© ${new Date().getFullYear()} Zenn Studios Inc. · All figures in CAD unless stated otherwise</footer></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.addEventListener('load', () => setTimeout(() => win.print(), 500));
    setTimeout(() => URL.revokeObjectURL(url), 5000);
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
                onClick={downloadQuotePDF}
                disabled={!editingQuote.clientName || editingQuote.lineItems.length === 0}
                className="btn-ghost flex-1 justify-center text-xs disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={saveQuote}
                disabled={saving || !editingQuote.clientName}
                className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
              >
                {saving ? 'Saving...' : <><CheckCircle className="w-3.5 h-3.5" /> Save</>}
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
