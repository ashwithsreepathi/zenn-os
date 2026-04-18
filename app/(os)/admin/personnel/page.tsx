'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, AlertTriangle, Phone, Mail, X, Send, Check, Zap, Star, FolderOpen, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { dbAddInvite } from '@/lib/supabase/db';
import type { UserRole } from '@/lib/types';

const ROLE_COLOR: Record<string, string> = {
  admin: '#b6332e',
  employee: '#3b82f6',
  affiliate: '#8b5cf6',
  client: '#10b981',
};

const STATUS_CONFIG = {
  active: { label: 'Active', dot: '#10b981' },
  limited: { label: 'Limited', dot: '#f59e0b' },
  ooo: { label: 'Out of Office', dot: '#3b82f6' },
  blacklisted: { label: 'Blacklisted', dot: '#b6332e' },
};

function BurnoutRing({ load, max = 5 }: { load: number; max?: number }) {
  const pct = Math.min(load / max, 1);
  const color = pct > 0.8 ? '#b6332e' : pct > 0.5 ? '#f59e0b' : '#10b981';
  const radius = 19;
  const circ = 2 * Math.PI * radius;
  return (
    <svg width={44} height={44} className="absolute -top-[2px] -left-[2px]" style={{ overflow: 'visible' }}>
      <circle cx={22} cy={22} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={2.5} />
      <circle
        cx={22} cy={22} r={radius} fill="none"
        stroke={color} strokeWidth={2.5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}


interface OSUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title?: string;
  status: 'active' | 'limited' | 'ooo' | 'blacklisted';
  skills?: string[];
  reliability_score?: number;
  current_load?: number;
  nudge_count?: number;
  timezone?: string;
  is_onboarded?: boolean;
  joined_at?: string;
}

export default function PersonnelDirectory() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<OSUser | null>(null);
  const [users, setUsers] = useState<OSUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [quickCallUser, setQuickCallUser] = useState<OSUser | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [callNote, setCallNote] = useState('');
  const [callSent, setCallSent] = useState(false);

  // Assign to Project modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState<OSUser | null>(null);
  const [assignDone, setAssignDone] = useState(false);
  const [assignProjects, setAssignProjects] = useState<{ id: string; name: string; client_name: string; completion_percent: number; assigned_team: string[] }[]>([]);

  // Payout History modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutUser, setPayoutUser] = useState<OSUser | null>(null);

  // Hire form
  const [hireForm, setHireForm] = useState({ name: '', email: '', role: 'affiliate' as UserRole, title: '', skills: '' });
  const [hireSent, setHireSent] = useState(false);
  const [hireSaving, setHireSaving] = useState(false);

  // Add contact form
  const [addForm, setAddForm] = useState({ name: '', email: '', title: '', role: 'affiliate' as UserRole, timezone: 'America/Toronto' });
  const [addSaved, setAddSaved] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('os_users')
      .select('*')
      .neq('role', 'client')
      .order('name');
    if (!error && data) setUsers(data as OSUser[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.skills ?? []).some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const sendQuickCall = () => {
    setCallSent(true);
    setTimeout(() => { setCallSent(false); setQuickCallUser(null); setCallNote(''); }, 1800);
  };

  const sendHireInvite = async () => {
    if (!hireForm.name.trim() || !hireForm.email.trim()) return;
    setHireSaving(true);
    try {
      await dbAddInvite({
        email: hireForm.email,
        name: hireForm.name,
        role: hireForm.role,
      });
      setHireSent(true);
      setTimeout(() => { setHireSent(false); setShowHireModal(false); setHireForm({ name: '', email: '', role: 'affiliate', title: '', skills: '' }); }, 1800);
    } catch (err) {
      console.error('Hire invite error:', err);
      alert('Failed to send invite.');
    } finally {
      setHireSaving(false);
    }
  };

  const saveContact = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    setAddSaving(true);
    try {
      // Save as a pending invite so they appear once accepted
      await dbAddInvite({
        email: addForm.email,
        name: addForm.name,
        role: addForm.role,
      });
      setAddSaved(true);
      await loadUsers();
      setTimeout(() => { setAddSaved(false); setShowAddContact(false); setAddForm({ name: '', email: '', title: '', role: 'affiliate', timezone: 'America/Toronto' }); }, 1200);
    } catch (err) {
      console.error('Add contact error:', err);
      alert('Failed to add contact.');
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Personnel &amp; Talent Directory</h1>
          <p className="text-xs text-[#555] mt-0.5">{users.length} team members · Agency workforce intelligence</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddContact(true)} className="btn-secondary text-xs">
            <UserPlus className="w-3.5 h-3.5" /> Add Contact
          </button>
          <button onClick={() => setShowHireModal(true)} className="btn-primary text-xs">
            <Send className="w-3.5 h-3.5" /> Quick-Hire Invite
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search name, skill, or tool..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="os-input pl-9 text-xs w-64"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'admin', 'employee', 'affiliate'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${roleFilter === r ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border border-[rgba(182,51,46,0.3)]' : 'border border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'active', 'limited', 'ooo'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${statusFilter === s ? 'bg-[rgba(255,255,255,0.05)] text-[#eee] border border-[rgba(255,255,255,0.12)]' : 'text-[#444] hover:text-[#666]'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Talent Grid */}
        <div className={`${selectedUser ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 md:grid-cols-2 ${!selectedUser ? 'lg:grid-cols-3' : ''} gap-4`}>
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-20 text-[#444]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading team...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 glass-panel rounded-2xl p-12 text-center">
              <p className="text-[#555] text-sm">No team members found. Send a Quick-Hire Invite to add your first person.</p>
            </div>
          ) : filtered.map((user, i) => {
            const statusConf = STATUS_CONFIG[user.status];
            const isSelected = selectedUser?.id === user.id;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedUser(isSelected ? null : user)}
                className={`glass-panel rounded-2xl p-5 cursor-pointer transition-all ${isSelected ? 'ring-brand' : 'glass-panel-hover'}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar with burnout ring */}
                  <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
                    <div className="w-[40px] h-[40px] rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center absolute inset-[2px]">
                      <span className="text-sm font-bold" style={{ color: ROLE_COLOR[user.role] }}>{user.name.charAt(0)}</span>
                    </div>
                    {user.current_load !== undefined && <BurnoutRing load={user.current_load} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#eee] truncate">{user.name}</p>
                      {user.is_onboarded === false && <AlertTriangle className="w-3 h-3 text-[#f59e0b] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#555] truncate mt-0.5">{user.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[user.status].dot }} />
                      <span className="text-[10px] text-[#444]">{STATUS_CONFIG[user.status].label}</span>
                      <span className="text-[10px] text-[#333] mx-0.5">·</span>
                      <span className="text-[10px] text-[#444] capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Reliability', value: `${user.reliability_score ?? '—'}%` },
                    { label: 'Load', value: `${user.current_load ?? 0} proj` },
                    { label: 'Nudges', value: `${user.nudge_count ?? 0}` },
                  ].map(m => (
                    <div key={m.label} className="glass-panel-elevated rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-[#eee]">{m.value}</p>
                      <p className="text-[9px] text-[#444] mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {user.skills && (
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] text-[#555] border border-[rgba(255,255,255,0.06)]">{s}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Detail Drawer */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#eee]">{selectedUser.name}</h2>
              <button onClick={() => setSelectedUser(null)} className="text-[#444] hover:text-white text-lg leading-none">×</button>
            </div>

            <div>
              <p className="section-label mb-2">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    setAssignUser(selectedUser); setAssignDone(false); setShowAssignModal(true);
                    const { data } = await supabase.from('os_projects').select('id, name, client_name, completion_percent, assigned_team').eq('status', 'active').order('name');
                    setAssignProjects((data ?? []).map(p => ({ ...p, completion_percent: p.completion_percent ?? 0, assigned_team: (p.assigned_team ?? []) as string[] })));
                  }}
                  className="btn-primary w-full text-xs justify-center"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Assign to Project
                </button>
                <button onClick={() => setQuickCallUser(selectedUser)} className="btn-ghost w-full text-xs justify-center">
                  <Phone className="w-3.5 h-3.5" /> Send Quick-Call Alert
                </button>
                <button
                  onClick={() => { setPayoutUser(selectedUser); setShowPayoutModal(true); }}
                  className="btn-secondary w-full text-xs justify-center"
                >
                  <DollarSign className="w-3.5 h-3.5" /> View Payout History
                </button>
              </div>
            </div>

            <div className="os-divider" />

            <div>
              <p className="section-label mb-2">Full Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedUser.skills ?? []).map(s => (
                  <span key={s} className="badge-neutral text-[10px]">{s}</span>
                ))}
                {!selectedUser.skills?.length && <p className="text-xs text-[#444]">No skills listed</p>}
              </div>
            </div>

            <div>
              <p className="section-label mb-2">Details</p>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Timezone', value: selectedUser.timezone },
                  { label: 'Joined', value: selectedUser.joined_at ? new Date(selectedUser.joined_at).toLocaleDateString('en-CA') : 'N/A' },
                  { label: 'Email', value: selectedUser.email },
                ].map(d => (
                  <div key={d.label} className="flex justify-between">
                    <span className="text-[#444]">{d.label}</span>
                    <span className="text-[#ccc] text-right truncate ml-4">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {!!selectedUser.nudge_count && selectedUser.nudge_count > 5 && (
              <div className="rounded-xl bg-[rgba(182,51,46,0.06)] border border-[rgba(182,51,46,0.12)] p-3">
                <p className="text-xs text-[#b6332e] font-semibold">⚠ High Maintenance</p>
                <p className="text-[10px] text-[#555] mt-1">{selectedUser.nudge_count} lifetime nudges received. Consider discussing workflow expectations.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Quick Call Modal */}
      <AnimatePresence>
        {quickCallUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setQuickCallUser(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="relative w-full max-w-sm glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Quick-Call Alert</h3>
                <button onClick={() => setQuickCallUser(null)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div className="flex items-center gap-3 glass-panel rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-bold text-[#b6332e]">{quickCallUser.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-[#eee]">{quickCallUser.name}</p>
                  <p className="text-xs text-[#555]">{quickCallUser.title}</p>
                </div>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Message / Reason for Call</label>
                <textarea className="os-input resize-none" rows={3} value={callNote} onChange={e => setCallNote(e.target.value)} placeholder="e.g. Urgent: Need revised edits by 3pm today..." autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setQuickCallUser(null)} className="btn-secondary text-xs justify-center">Cancel</button>
                <button onClick={sendQuickCall} className="btn-primary text-xs justify-center">
                  {callSent ? <><Check className="w-3.5 h-3.5" /> Sent!</> : <><Phone className="w-3.5 h-3.5" /> Send Alert</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick-Hire Invite Modal */}
      <AnimatePresence>
        {showHireModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowHireModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Quick-Hire Invite</h3>
                <button onClick={() => setShowHireModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <p className="text-xs text-[#555]">Send an onboarding invite link. The recipient will create their account and appear in this directory.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Full Name *</label>
                    <input type="text" className="os-input" value={hireForm.name} onChange={e => setHireForm(f => ({ ...f, name: e.target.value }))} placeholder="Jordan Smith" autoFocus />
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Email *</label>
                    <input type="email" className="os-input" value={hireForm.email} onChange={e => setHireForm(f => ({ ...f, email: e.target.value }))} placeholder="jordan@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Role</label>
                    <select className="os-input cursor-pointer" value={hireForm.role} onChange={e => setHireForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                      <option value="employee">Employee</option>
                      <option value="affiliate">Affiliate / Freelancer</option>
                    </select>
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Title</label>
                    <input type="text" className="os-input" value={hireForm.title} onChange={e => setHireForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Video Editor" />
                  </div>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Skills (comma separated)</label>
                  <input type="text" className="os-input" value={hireForm.skills} onChange={e => setHireForm(f => ({ ...f, skills: e.target.value }))} placeholder="Premiere Pro, After Effects" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowHireModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={sendHireInvite} disabled={!hireForm.name.trim() || !hireForm.email.trim() || hireSaving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  {hireSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</> : hireSent ? <><Check className="w-3.5 h-3.5" /> Invite Sent!</> : <><Send className="w-3.5 h-3.5" /> Send Invite</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddContact(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Add Contact</h3>
                <button onClick={() => setShowAddContact(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Full Name *</label>
                    <input type="text" className="os-input" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Chen" autoFocus />
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Email *</label>
                    <input type="email" className="os-input" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="alex@example.com" />
                  </div>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Title / Role Description</label>
                  <input type="text" className="os-input" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Brand Strategist" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Role</label>
                    <select className="os-input cursor-pointer" value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                      <option value="employee">Employee</option>
                      <option value="affiliate">Affiliate</option>
                    </select>
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Timezone</label>
                    <select className="os-input cursor-pointer" value={addForm.timezone} onChange={e => setAddForm(f => ({ ...f, timezone: e.target.value }))}>
                      <option value="America/Toronto">America/Toronto</option>
                      <option value="America/Vancouver">America/Vancouver</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Chicago">America/Chicago</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddContact(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={saveContact} disabled={!addForm.name.trim() || !addForm.email.trim() || addSaving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  {addSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : addSaved ? <><Check className="w-3.5 h-3.5" /> Added!</> : 'Add Contact'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign to Project Modal */}
      <AnimatePresence>
        {showAssignModal && assignUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Assign {assignUser.name} to Project</h3>
                <button onClick={() => setShowAssignModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {assignProjects.length === 0 && (
                  <p className="text-xs text-[#444] text-center py-4">No active projects found.</p>
                )}
                {assignProjects.map(p => {
                  const already = (p.assigned_team ?? []).includes(assignUser.id);
                  return (
                    <button
                      key={p.id}
                      onClick={async () => {
                        if (!already) {
                          const newTeam = [...(p.assigned_team ?? []), assignUser.id];
                          await supabase.from('os_projects').update({ assigned_team: newTeam }).eq('id', p.id);
                          setAssignDone(true);
                          setAssignProjects(prev => prev.map(pr => pr.id === p.id ? { ...pr, assigned_team: newTeam } : pr));
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs border transition-all text-left ${already ? 'border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] text-[#10b981]' : assignDone ? 'border-[rgba(182,51,46,0.4)] bg-[rgba(182,51,46,0.06)] text-[#b6332e]' : 'border-[rgba(255,255,255,0.06)] text-[#888] hover:border-[rgba(255,255,255,0.12)] hover:text-[#eee]'}`}
                    >
                      <div>
                        <p className="font-bold text-[#ddd]">{p.name}</p>
                        <p className="text-[10px] text-[#555] mt-0.5">{p.client_name} · {p.completion_percent}% done</p>
                      </div>
                      {already ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <span className="text-[10px]">Assign</span>}
                    </button>
                  );
                })}
              </div>
              {assignDone && (
                <div className="flex items-center gap-2 text-[11px] text-[#10b981] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl px-3 py-2">
                  <Check className="w-3.5 h-3.5" /> {assignUser.name} has been assigned.
                </div>
              )}
              <button onClick={() => setShowAssignModal(false)} className="btn-secondary w-full justify-center text-xs">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payout History Modal */}
      <AnimatePresence>
        {showPayoutModal && payoutUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Payout History — {payoutUser.name}</h3>
                <button onClick={() => setShowPayoutModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {[
                  { date: 'Apr 01, 2026', project: 'Montax Hero Video', amount: 1800, status: 'paid' },
                  { date: 'Mar 15, 2026', project: 'BFB Campaign Phase 2', amount: 2500, status: 'paid' },
                  { date: 'Feb 28, 2026', project: 'BFB Campaign Phase 1', amount: 2500, status: 'paid' },
                  { date: 'Feb 01, 2026', project: 'Zenn OS Internal', amount: 500, status: 'pending' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0a0a0a]">
                    <div>
                      <p className="text-xs font-semibold text-[#ddd]">{row.project}</p>
                      <p className="text-[10px] text-[#555] mt-0.5">{row.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#eee]">${row.amount.toLocaleString()}</p>
                      <span className={`text-[9px] font-bold ${row.status === 'paid' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>{row.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <span className="text-xs text-[#555]">Total Paid Out</span>
                <span className="text-sm font-black text-[#eee]">$7,300</span>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="btn-secondary w-full justify-center text-xs">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
