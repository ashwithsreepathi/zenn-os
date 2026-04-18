'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ChevronRight, CheckCircle, AlertCircle, Mail, Building2, ExternalLink, MessageSquare, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { dbAddEnquiry, dbUpdateEnquiry, dbAddLead } from '@/lib/supabase/db';
import Link from 'next/link';


const STATUS_CONFIG: Record<Enquiry['status'], { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  read: { label: 'Read', color: '#888', bg: 'rgba(255,255,255,0.05)' },
  responded: { label: 'Responded', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  converted: { label: 'Converted', color: '#b6332e', bg: 'rgba(182,51,46,0.1)' },
  spam: { label: 'Spam', color: '#444', bg: 'rgba(255,255,255,0.02)' },
};

const SOURCE_EMOJI: Record<string, string> = {
  'Referral': '🔗',
  'Instagram': '📸',
  'SEO': '🔍',
  'Direct': '📧',
  'LinkedIn': '💼',
  'Cold Outreach': '📨',
};

type EnquiryStatus = 'new' | 'read' | 'responded' | 'converted' | 'spam';
interface Enquiry {
  id: string; name: string; email: string; company?: string;
  project_type?: string; budget?: string; message?: string;
  source?: string; status: EnquiryStatus; created_at: string;
}

function NewEnquiryModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', company: '', projectType: '', budget: '', message: '', source: 'Direct',
  });

  const handleSave = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSaving(true);
    try {
      await dbAddEnquiry({
        name: form.name, email: form.email, company: form.company || null,
        project_type: form.projectType || null, budget: form.budget || null,
        message: form.message, source: form.source.toLowerCase(),
      });
      setDone(true);
      onAdded();
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error('Add enquiry error:', err);
      alert('Failed to add enquiry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#eee]">Add Manual Enquiry</h2>
          <button onClick={onClose} className="text-[#444] hover:text-white text-xl">×</button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-[#10b981] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#eee]">Enquiry Added</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label mb-1.5 block">Name *</label>
                <input type="text" className="os-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contact name" />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Email *</label>
                <input type="email" className="os-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@company.com" />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Company</label>
                <input type="text" className="os-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Source</label>
                <select className="os-input cursor-pointer" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                  {['Direct', 'Referral', 'Instagram', 'SEO', 'LinkedIn', 'Cold Outreach'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Project Type</label>
                <input type="text" className="os-input" value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))} placeholder="Brand, Web, Video..." />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Budget Range</label>
                <select className="os-input cursor-pointer" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}>
                  <option value="">Select range...</option>
                  {['Under $5,000', '$5,000 – $10,000', '$10,000 – $25,000', '$25,000 – $50,000', '$50,000 – $100,000', '$100,000+'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="section-label mb-1.5 block">Message *</label>
              <textarea className="os-input resize-none" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What did they say?" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.email || !form.message}
                className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
              >
                {saving ? 'Adding...' : 'Add Enquiry'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function EnquiryDetail({ enquiry, onRefresh, onClose }: { enquiry: Enquiry; onRefresh: () => void; onClose: () => void }) {
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);

  const handleStatus = async (status: EnquiryStatus) => {
    await dbUpdateEnquiry(enquiry.id, { status });
    onRefresh();
  };

  const convertToLead = async () => {
    setConverting(true);
    try {
      await dbAddLead({
        company_name: enquiry.company ?? '',
        contact_name: enquiry.name,
        email: enquiry.email,
        project_type: enquiry.project_type ?? '',
        estimated_budget: 0,
        source: 'direct',
        stage: 'new',
        score: 70,
        temperature: 'warm',
        notes: enquiry.message ?? '',
      });
      await dbUpdateEnquiry(enquiry.id, { status: 'converted' });
      onRefresh();
      setConverting(false);
      setConverted(true);
    } catch (err) {
      console.error(err);
      setConverting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      <div className="bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.05)] px-5 py-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#eee]">{enquiry.name}</h3>
        <button onClick={onClose} className="text-[#444] hover:text-white text-xl">×</button>
      </div>
      <div className="p-5 space-y-4">
        {/* Contact */}
        <div className="space-y-2 text-xs">
          {[
            { label: 'Email', value: enquiry.email, icon: Mail },
            { label: 'Company', value: enquiry.company ?? 'N/A', icon: Building2 },
            { label: 'Source', value: `${SOURCE_EMOJI[enquiry.source ?? ''] ?? '📨'} ${enquiry.source}`, icon: null },
            { label: 'Budget', value: enquiry.budget || 'Not specified', icon: null },
            { label: 'Project', value: enquiry.project_type || 'Not specified', icon: null },
            { label: 'Received', value: new Date(enquiry.created_at).toLocaleDateString('en-CA'), icon: null },
          ].map(r => (
            <div key={r.label} className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-2">
              <span className="text-[#444]">{r.label}</span>
              <span className="text-[#ccc] text-right">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Message */}
        <div>
          <p className="section-label mb-2">Message</p>
          <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[rgba(255,255,255,0.04)]">
            <p className="text-xs text-[#aaa] leading-relaxed">"{enquiry.message ?? ''}"</p>
          </div>
        </div>

        {/* Status Buttons */}
        <div>
          <p className="section-label mb-2">Change Status</p>
          <div className="flex flex-wrap gap-2">
            {(['read', 'responded', 'spam'] as const).map(s => (
              <button key={s} onClick={() => handleStatus(s)} className={`text-[10px] px-3 py-1.5 rounded-lg capitalize border transition-all ${enquiry.status === s ? 'border-current opacity-100' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`} style={{ color: STATUS_CONFIG[s].color }}>
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Convert to Lead */}
        {enquiry.status !== 'converted' && !converted && (
          <button
            onClick={convertToLead}
            disabled={converting}
            className="w-full btn-primary justify-center text-xs"
          >
            {converting ? 'Converting...' : <><ArrowRight className="w-3.5 h-3.5" /> Convert to Lead</>}
          </button>
        )}
        {(enquiry.status === 'converted' || converted) && (
          <div className="flex items-center gap-2 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl px-4 py-3 text-xs text-[#10b981]">
            <CheckCircle className="w-4 h-4" /> Converted to Lead — view in CRM
          </div>
        )}

        <Link href="/admin/quotation" className="w-full btn-secondary justify-center text-xs block text-center">
          📄 Create Quote for {enquiry.name.split(' ')[0]}
        </Link>
      </div>
    </motion.div>
  );
}

export default function InquiryInbox() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('os_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setEnquiries(data as Enquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadEnquiries(); }, [loadEnquiries]);

  const newCount = enquiries.filter(e => e.status === 'new').length;

  const filtered = enquiries.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.company ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Inquiry Inbox</h1>
          <p className="text-xs text-[#555] mt-0.5">
            {loading ? 'Loading...' : newCount > 0 ? <span className="text-[#3b82f6]">{newCount} unread</span> : 'All caught up'} · {enquiries.length} total enquiries
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/enquiry" target="_blank" className="btn-secondary text-xs">
            <ExternalLink className="w-3.5 h-3.5" /> Public Form ↗
          </Link>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Manual
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input type="text" placeholder="Search name, email, company..." className="os-input pl-9 text-xs w-64" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(['all', 'new', 'read', 'responded', 'converted', 'spam'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${statusFilter === s ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border border-[rgba(182,51,46,0.3)]' : 'border border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
            >
              {s}
              {s === 'new' && newCount > 0 && <span className="ml-1 text-[9px] bg-[#3b82f6] text-white px-1 rounded-full">{newCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* List */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-8 h-8 text-[#333] mx-auto mb-3" />
              <p className="text-xs text-[#555]">No enquiries matching filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filtered.map((e, i) => {
                const sc = STATUS_CONFIG[e.status];
                const isSelected = selected?.id === e.id;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setSelected(isSelected ? null : e);
                      if (!isSelected && e.status === 'new') {
                        dbUpdateEnquiry(e.id, { status: 'read' }).then(loadEnquiries);
                      }
                    }}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-4 ${isSelected ? 'bg-[rgba(182,51,46,0.05)]' : 'hover:bg-[#111]'} ${e.status === 'new' ? 'border-l-2 border-[#3b82f6]' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#111] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-sm font-bold text-[#555] flex-shrink-0">
                      {e.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-[#eee] truncate">{e.name}</p>
                        {e.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-[#555] truncate">{e.company ? `${e.company} · ` : ''}{e.email}</p>
                      <p className="text-[10px] text-[#444] mt-1 truncate">{(e.message ?? '').slice(0, 80)}...</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      <span className="text-[9px] text-[#333]">{new Date(e.created_at).toLocaleDateString('en-CA')}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        <AnimatePresence>
          {selected && (
            <EnquiryDetail
              enquiry={enquiries.find(e => e.id === selected.id) ?? selected}
              onRefresh={loadEnquiries}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && <NewEnquiryModal onClose={() => setShowModal(false)} onAdded={loadEnquiries} />}
      </AnimatePresence>
    </div>
  );
}
