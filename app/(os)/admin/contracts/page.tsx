/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { FileText, Plus, X, Shield, Eye, Download, Send, CheckCircle, Clock, Edit3, Filter, RefreshCw } from 'lucide-react';

interface Contract {
  id: string; type: string; recipient_id: string | null; recipient_name: string;
  project_id: string | null; project_name: string | null; status: string;
  sent_at: string | null; executed_at: string | null; expires_at: string | null;
  created_at: string;
}
interface UserRow { id: string; name: string; email: string; role: string; }
interface ProjectRow { id: string; name: string; }

const TYPE_META: Record<string, { label: string; color: string; desc: string }> = {
  msa: { label: 'Master Service Agreement', color: '#3b82f6', desc: 'Covers all ongoing work.' },
  nda: { label: 'Non-Disclosure Agreement', color: '#8b5cf6', desc: 'Protects proprietary info.' },
  ip_transfer: { label: 'IP Transfer', color: '#f59e0b', desc: 'Full IP ownership transfer.' },
  contractor: { label: 'Contractor Agreement', color: '#10b981', desc: 'For affiliate/freelancer engagements.' },
  sow: { label: 'Statement of Work', color: '#b6332e', desc: 'Scope and deliverables per project.' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  draft: { color: '#555', label: 'Draft', icon: Edit3 },
  sent: { color: '#3b82f6', label: 'Sent', icon: Send },
  viewed: { color: '#f59e0b', label: 'Viewed', icon: Eye },
  partially_signed: { color: '#f59e0b', label: 'Partially Signed', icon: Clock },
  executed: { color: '#10b981', label: 'Executed', icon: CheckCircle },
};

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [form, setForm] = useState({
    type: 'msa' as string,
    recipient_id: '',
    project_id: '',
    expires_at: '',
    document_text: '',
  });

  async function load() {
    const [cRes, uRes, pRes] = await Promise.all([
      supabase.from('os_contracts').select('*').order('created_at', { ascending: false }),
      supabase.from('os_users').select('id,name,email,role'),
      supabase.from('os_projects').select('id,name'),
    ]);
    setContracts(cRes.data ?? [] as any);
    setUsers(uRes.data ?? [] as any);
    setProjects(pRes.data ?? [] as any);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    const user = users.find((u) => u.id === form.recipient_id);
    const project = projects.find((p) => p.id === form.project_id);
    if (!user) return;

    const { error } = await supabase.from('os_contracts').insert({
      type: form.type,
      recipient_id: form.recipient_id || null,
      recipient_name: user.name,
      project_id: form.project_id || null,
      project_name: project?.name ?? null,
      status: 'draft',
      document_text: form.document_text || null,
      expires_at: form.expires_at || null,
    } as any);

    if (!error) {
      setShowModal(false);
      setForm({ type: 'msa', recipient_id: '', project_id: '', expires_at: '', document_text: '' });
      load();
    }
  }

  async function updateStatus(id: string, status: string) {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'executed') updates.executed_at = new Date().toISOString();
    await supabase.from('os_contracts').update(updates as any).eq('id', id);
    load();
  }

  const filtered = activeFilter === 'all' ? contracts : contracts.filter((c) => c.status === activeFilter || c.type === activeFilter);

  const stats = {
    total: contracts.length,
    executed: contracts.filter((c) => c.status === 'executed').length,
    pending: contracts.filter((c) => ['sent', 'viewed', 'partially_signed'].includes(c.status)).length,
    draft: contracts.filter((c) => c.status === 'draft').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">IP & Contracts</h1>
          <p className="text-xs text-[#555] mt-0.5">Legal document management · live from database</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary text-xs"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> New Contract
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contracts', value: stats.total, color: '#3b82f6', icon: FileText },
          { label: 'Executed', value: stats.executed, color: '#10b981', icon: CheckCircle },
          { label: 'Pending Signature', value: stats.pending, color: '#f59e0b', icon: Clock },
          { label: 'Draft', value: stats.draft, color: '#555', icon: Edit3 },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">{s.label}</p>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'executed', 'sent', 'draft', 'msa', 'nda', 'contractor', 'sow', 'ip_transfer'].map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`text-[10px] px-3 py-1.5 rounded-lg border capitalize transition-all ${activeFilter === f
              ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border-[rgba(182,51,46,0.3)]'
              : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            {TYPE_META[f]?.label ?? f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Contracts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-panel rounded-2xl h-36 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Shield className="w-10 h-10 text-[#1a1a1a] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#333]">No contracts yet</p>
          <p className="text-xs text-[#444] mt-1">Create your first contract to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c, i) => {
            const meta = TYPE_META[c.type] ?? { label: c.type, color: '#555', desc: '' };
            const status = STATUS_CONFIG[c.status] ?? { color: '#555', label: c.status, icon: FileText };
            const StatusIcon = status.icon;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}15` }}>
                      <Shield className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#eee]">{meta.label}</p>
                      <p className="text-[10px] text-[#555]">{c.recipient_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border flex-shrink-0"
                    style={{ color: status.color, borderColor: `${status.color}30`, background: `${status.color}10` }}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="text-[9px] font-bold">{status.label}</span>
                  </div>
                </div>

                {c.project_name && (
                  <p className="text-[10px] text-[#555] mb-3">📁 {c.project_name}</p>
                )}

                <div className="flex items-center gap-2 text-[9px] text-[#444] mb-4">
                  {c.sent_at && <span>Sent {new Date(c.sent_at).toLocaleDateString()}</span>}
                  {c.executed_at && <span>· Executed {new Date(c.executed_at).toLocaleDateString()}</span>}
                  {c.expires_at && <span>· Expires {new Date(c.expires_at).toLocaleDateString()}</span>}
                  {!c.sent_at && !c.executed_at && <span>Created {new Date(c.created_at).toLocaleDateString()}</span>}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {c.status === 'draft' && (
                    <button onClick={() => updateStatus(c.id, 'sent')} className="btn-primary text-[10px] py-1">
                      <Send className="w-3 h-3" /> Send
                    </button>
                  )}
                  {c.status === 'sent' && (
                    <button onClick={() => updateStatus(c.id, 'executed')} className="btn-secondary text-[10px] py-1">
                      <CheckCircle className="w-3 h-3" /> Mark Executed
                    </button>
                  )}
                  <button className="btn-secondary text-[10px] py-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <button className="btn-secondary text-[10px] py-1">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Contract Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">New Contract</h3>
                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>

              <div>
                <label className="section-label mb-1.5 block">Contract Type</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(TYPE_META).map(([key, meta]) => (
                    <button key={key} onClick={() => setForm((f) => ({ ...f, type: key }))}
                      className={`text-left p-3 rounded-xl border text-[11px] transition-all ${form.type === key ? 'font-bold' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
                      style={form.type === key ? { color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}10` } : {}}>
                      <p>{meta.label}</p>
                      <p className="text-[9px] opacity-60 mt-0.5">{meta.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label mb-1.5 block">Recipient</label>
                <select className="os-input cursor-pointer" value={form.recipient_id} onChange={(e) => setForm((f) => ({ ...f, recipient_id: e.target.value }))}>
                  <option value="">Select person...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>

              <div>
                <label className="section-label mb-1.5 block">Linked Project (optional)</label>
                <select className="os-input cursor-pointer" value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}>
                  <option value="">None</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="section-label mb-1.5 block">Expiration Date (optional)</label>
                <input type="date" className="os-input" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={handleCreate} disabled={!form.recipient_id} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  Create as Draft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
