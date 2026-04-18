'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Bell, AlertTriangle, Send, CheckCircle, Clock, Zap, Plus, X, RefreshCw } from 'lucide-react';

interface NudgeRow {
  id: string;
  recipient_id: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  trigger_type: string;
  level: number;
  status: string;
  message: string;
  project_id: string | null;
  project_name: string | null;
  sent_at: string | null;
  created_at: string;
}

interface UserRow { id: string; name: string; email: string; role: string; nudge_count: number; }
interface ProjectRow { id: string; name: string; }

const LEVEL_CONFIG = {
  1: { label: 'Level 1 — Friendly', color: '#10b981', desc: 'Soft check-in. No pressure.' },
  2: { label: 'Level 2 — Firm', color: '#f59e0b', desc: 'Escalated. Mentions deadline.' },
  3: { label: 'Level 3 — Escalation', color: '#b6332e', desc: 'Final warning. CC admin.' },
} as const;

const TRIGGER_LABELS: Record<string, string> = {
  talent_reminder: '🎯 Talent Reminder',
  client_approval: '📋 Client Approval',
  payment_chaser: '💰 Payment Chaser',
  custom: '✉️ Custom',
};

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  scheduled: { color: '#555', icon: '⏳' },
  sent: { color: '#3b82f6', icon: '📤' },
  delivered: { color: '#10b981', icon: '✅' },
  responded: { color: '#10b981', icon: '💬' },
  escalated: { color: '#b6332e', icon: '🚨' },
};

export default function NudgeLogic() {
  const [nudges, setNudges] = useState<NudgeRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({
    recipient_id: '',
    trigger_type: 'talent_reminder' as string,
    level: 1 as 1 | 2 | 3,
    project_id: '',
    message: '',
  });

  async function load() {
    const [nudgeRes, userRes, projRes] = await Promise.all([
      supabase.from('os_nudges').select('*').order('created_at', { ascending: false }),
      supabase.from('os_users').select('id,name,email,role,nudge_count').neq('role', 'admin'),
      supabase.from('os_projects').select('id,name').eq('status', 'active'),
    ]);
    setNudges(nudgeRes.data ?? [] as any);
    setUsers(userRes.data ?? [] as any);
    setProjects(projRes.data ?? [] as any);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSend() {
    const user = users.find((u) => u.id === form.recipient_id);
    const project = projects.find((p) => p.id === form.project_id);
    if (!user || !form.message.trim()) return;

    const { error } = await supabase.from('os_nudges').insert({
      recipient_id: form.recipient_id,
      recipient_name: user.name,
      recipient_email: user.email,
      trigger_type: form.trigger_type,
      level: form.level,
      status: 'sent',
      message: form.message,
      project_id: form.project_id || null,
      project_name: project?.name ?? null,
      sent_at: new Date().toISOString(),
    } as any);

    if (!error) {
      // Increment nudge_count on user
      await supabase.from('os_users').update({ nudge_count: (user.nudge_count ?? 0) + 1 } as any).eq('id', form.recipient_id);
      setShowModal(false);
      setForm({ recipient_id: '', trigger_type: 'talent_reminder', level: 1, project_id: '', message: '' });
      load();
    }
  }

  const filtered = filter === 'all' ? nudges : nudges.filter((n) => n.trigger_type === filter || n.status === filter);

  // Auto-generate message template
  const selectedUser = users.find((u) => u.id === form.recipient_id);
  const selectedProject = projects.find((p) => p.id === form.project_id);

  function generateTemplate() {
    const name = selectedUser?.name.split(' ')[0] ?? '[Name]';
    const projName = selectedProject?.name ?? '[Project]';
    const templates: Record<string, string> = {
      talent_reminder: `Hi ${name}, this is a friendly reminder that your deliverable for ${projName} is due soon. Please update your progress or let us know if there are any blockers.`,
      client_approval: `Hi ${name}, a new deliverable is ready for your review on the ${projName} project. Please log into your portal and provide feedback at your earliest convenience.`,
      payment_chaser: `Hi ${name}, we wanted to follow up on the outstanding invoice for the ${projName} project. Please arrange payment at your earliest convenience or reach out to discuss a timeline.`,
      custom: `Hi ${name}, `,
    };
    setForm((f) => ({ ...f, message: templates[f.trigger_type] ?? '' }));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Nudge Logic</h1>
          <p className="text-xs text-[#555] mt-0.5">Automated & manual communications engine</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> Send Nudge
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: nudges.filter((n) => n.status !== 'scheduled').length, color: '#3b82f6', icon: Send },
          { label: 'Responded', value: nudges.filter((n) => n.status === 'responded').length, color: '#10b981', icon: CheckCircle },
          { label: 'Pending', value: nudges.filter((n) => ['scheduled', 'sent', 'delivered'].includes(n.status)).length, color: '#f59e0b', icon: Clock },
          { label: 'Escalated', value: nudges.filter((n) => n.status === 'escalated').length, color: '#b6332e', icon: AlertTriangle },
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

      {/* High Risk Users */}
      {users.filter((u) => (u.nudge_count ?? 0) >= 3).length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-[rgba(182,51,46,0.2)]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#b6332e]" />
            <h2 className="text-sm font-bold text-[#b6332e]">High Nudge Risk</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {users.filter((u) => (u.nudge_count ?? 0) >= 3).map((u) => (
              <div key={u.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(182,51,46,0.1)] border border-[rgba(182,51,46,0.2)]">
                <span className="text-xs font-bold text-[#b6332e]">{u.name}</span>
                <span className="text-[9px] bg-[#b6332e] text-white px-1.5 py-0.5 rounded-full font-bold">{u.nudge_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'talent_reminder', label: '🎯 Talent' },
          { key: 'client_approval', label: '📋 Client' },
          { key: 'payment_chaser', label: '💰 Payment' },
          { key: 'escalated', label: '🚨 Escalated' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filter === f.key
              ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border-[rgba(182,51,46,0.3)]'
              : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Nudge List */}
      <div className="space-y-3">
        {loading && <div className="text-center py-8 text-xs text-[#333]">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <Bell className="w-8 h-8 text-[#1a1a1a] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#333]">No nudges yet</p>
            <p className="text-xs text-[#444] mt-1">Send your first nudge to a team member or client.</p>
          </div>
        )}
        {filtered.map((nudge, i) => {
          const lvl = LEVEL_CONFIG[nudge.level as 1 | 2 | 3];
          const statusCfg = STATUS_CONFIG[nudge.status] ?? { color: '#555', icon: '?' };
          return (
            <motion.div key={nudge.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-panel rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs"
                    style={{ background: `${lvl.color}15` }}>
                    <Zap className="w-4 h-4" style={{ color: lvl.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#eee]">{nudge.recipient_name}</p>
                    <p className="text-[10px] text-[#555] mt-0.5">
                      {TRIGGER_LABELS[nudge.trigger_type] ?? nudge.trigger_type}
                      {nudge.project_name && ` · ${nudge.project_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border"
                    style={{ color: lvl.color, borderColor: `${lvl.color}30`, background: `${lvl.color}10` }}>
                    {lvl.label}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{ color: statusCfg.color, background: `${statusCfg.color}15` }}>
                    {statusCfg.icon} {nudge.status}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#888] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl p-3 leading-relaxed">
                {nudge.message}
              </p>
              {nudge.sent_at && (
                <p className="text-[9px] text-[#444] mt-2">
                  Sent {new Date(nudge.sent_at).toLocaleString()}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Send Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Send Nudge</h3>
                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label mb-1.5 block">Recipient</label>
                  <select className="os-input cursor-pointer" value={form.recipient_id} onChange={(e) => setForm((f) => ({ ...f, recipient_id: e.target.value }))}>
                    <option value="">Select...</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Project (optional)</label>
                  <select className="os-input cursor-pointer" value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}>
                    <option value="">None</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="section-label mb-1.5 block">Trigger Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TRIGGER_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => setForm((f) => ({ ...f, trigger_type: key }))}
                      className={`text-[11px] py-2 px-3 rounded-xl border text-left transition-all ${form.trigger_type === key ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label mb-1.5 block">Escalation Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((l) => {
                    const cfg = LEVEL_CONFIG[l];
                    return (
                      <button key={l} onClick={() => setForm((f) => ({ ...f, level: l }))}
                        className={`text-[10px] py-2 px-2 rounded-xl border text-center transition-all ${form.level === l ? 'font-bold' : 'border-[rgba(255,255,255,0.06)] text-[#555]'}`}
                        style={form.level === l ? { color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}10` } : {}}>
                        L{l} · {cfg.desc.split('.')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="section-label">Message</label>
                  <button onClick={generateTemplate} className="text-[10px] text-[#b6332e] hover:underline">Auto-generate</button>
                </div>
                <textarea className="os-input resize-none" rows={4} value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Write your message or use auto-generate..." />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={handleSend} disabled={!form.recipient_id || !form.message.trim()} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  <Send className="w-3.5 h-3.5" /> Send Nudge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
