/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { DollarSign, Users, CheckCircle, Clock, Plus, X, AlertTriangle } from 'lucide-react';

interface User { id: string; name: string; role: string; }
interface Project { id: string; name: string; client_name: string; total_value: number; paid_to_date: number; }
interface Milestone { id: string; project_id: string; name: string; payout: number | null; status: string; }
interface Payout {
  id: string; user_id: string; user_name: string; role: string;
  project_id: string; milestone_id: string | null;
  allocation_type: string; amount: number; percentage: number | null;
  status: string; notes: string | null; paid_at: string | null;
}

export default function PayoutAllocator() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    user_id: '', milestone_id: '', allocation_type: 'fixed' as 'fixed' | 'percentage',
    amount: '', percentage: '', notes: '',
  });

  async function load() {
    const [projRes, msRes, userRes, payRes] = await Promise.all([
      supabase.from('os_projects').select('id,name,client_name,total_value,paid_to_date').order('created_at', { ascending: false }),
      supabase.from('os_milestones').select('id,project_id,name,payout,status'),
      supabase.from('os_users').select('id,name,role').in('role', ['affiliate', 'employee', 'admin']),
      supabase.from('os_payouts').select('*').order('created_at', { ascending: false }),
    ]);
    const projs = projRes.data ?? [];
    setProjects(projs as any);
    setMilestones(msRes.data ?? [] as any);
    setUsers(userRes.data ?? [] as any);
    setPayouts(payRes.data ?? [] as any);
    if (projs.length && !activeProjectId) setActiveProjectId((projs[0] as any).id);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const project = projects.find((p) => p.id === activeProjectId);
  const projectMilestones = milestones.filter((m) => m.project_id === activeProjectId);
  const projectPayouts = payouts.filter((p) => p.project_id === activeProjectId);

  const totalAllocated = projectPayouts.reduce((s, p) => s + Number(p.amount), 0);
  const totalPaid = projectPayouts.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);

  async function handleAdd() {
    if (!form.user_id || !activeProjectId) return;
    const user = users.find((u) => u.id === form.user_id);
    const amount = form.allocation_type === 'fixed'
      ? Number(form.amount)
      : ((Number(form.percentage) / 100) * (project?.total_value ?? 0));

    const { error } = await supabase.from('os_payouts').insert({
      project_id: activeProjectId,
      milestone_id: form.milestone_id || null,
      user_id: form.user_id,
      user_name: user?.name ?? '',
      role: user?.role ?? '',
      allocation_type: form.allocation_type,
      amount,
      percentage: form.allocation_type === 'percentage' ? Number(form.percentage) : null,
      notes: form.notes || null,
      status: 'pending',
    } as any);

    if (!error) {
      setShowModal(false);
      setForm({ user_id: '', milestone_id: '', allocation_type: 'fixed', amount: '', percentage: '', notes: '' });
      load();
    }
  }

  async function markPaid(id: string) {
    await supabase.from('os_payouts').update({ status: 'paid', paid_at: new Date().toISOString() } as any).eq('id', id);
    load();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Payout Allocator</h1>
          <p className="text-xs text-[#555] mt-0.5">Manage talent & contractor payouts per project</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Payout
        </button>
      </div>

      {/* Project Tabs */}
      <div className="flex gap-2 flex-wrap">
        {projects.map((p) => (
          <button key={p.id} onClick={() => setActiveProjectId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all truncate max-w-[200px] ${activeProjectId === p.id
              ? 'border-[rgba(182,51,46,0.4)] bg-[rgba(182,51,46,0.1)] text-[#b6332e]'
              : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            {p.name}
          </button>
        ))}
      </div>

      {project && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Project Value', value: `$${project.total_value.toLocaleString()}`, color: '#3b82f6', icon: DollarSign },
              { label: 'Paid to Date', value: `$${project.paid_to_date.toLocaleString()}`, color: '#10b981', icon: CheckCircle },
              { label: 'Total Allocated', value: `$${totalAllocated.toLocaleString()}`, color: '#f59e0b', icon: Users },
              { label: 'Pending Payouts', value: `$${(totalAllocated - totalPaid).toLocaleString()}`, color: '#b6332e', icon: Clock },
            ].map((s) => (
              <div key={s.label} className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="section-label">{s.label}</p>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Payout Table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
              <h2 className="text-sm font-bold text-[#eee]">Payout Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)]">
                    {['Recipient', 'Milestone', 'Type', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#555] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectPayouts.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-[#333]">No payouts allocated yet</td></tr>
                  ) : projectPayouts.map((p, i) => {
                    const ms = milestones.find((m) => m.id === p.milestone_id);
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-[#eee]">{p.user_name}</p>
                          <p className="text-[10px] text-[#555] capitalize">{p.role}</p>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-[#888]">{ms?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] px-2 py-0.5 rounded-full border capitalize"
                            style={{ color: p.allocation_type === 'fixed' ? '#3b82f6' : '#f59e0b', borderColor: `${p.allocation_type === 'fixed' ? '#3b82f6' : '#f59e0b'}30` }}>
                            {p.allocation_type}{p.allocation_type === 'percentage' && ` (${p.percentage}%)`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-[#eee]">${Number(p.amount).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981]' : 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.status === 'pending' && (
                            <button onClick={() => markPaid(p.id)} className="text-[10px] text-[#10b981] hover:underline">Mark Paid</button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loading && <div className="text-center py-12 text-xs text-[#333]">Loading...</div>}

      {/* Add Payout Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">Add Payout</h3>
                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Recipient</label>
                <select className="os-input cursor-pointer" value={form.user_id} onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}>
                  <option value="">Select person...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Milestone (optional)</label>
                <select className="os-input cursor-pointer" value={form.milestone_id} onChange={(e) => setForm((f) => ({ ...f, milestone_id: e.target.value }))}>
                  <option value="">None</option>
                  {projectMilestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Allocation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['fixed', 'percentage'] as const).map((t) => (
                    <button key={t} onClick={() => setForm((f) => ({ ...f, allocation_type: t }))}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${form.allocation_type === t ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555]'}`}>
                      {t === 'fixed' ? '$ Fixed Amount' : '% Percentage'}
                    </button>
                  ))}
                </div>
              </div>
              {form.allocation_type === 'fixed' ? (
                <div>
                  <label className="section-label mb-1.5 block">Amount ($)</label>
                  <input type="number" className="os-input" placeholder="2500" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
              ) : (
                <div>
                  <label className="section-label mb-1.5 block">Percentage of Project Value</label>
                  <input type="number" className="os-input" placeholder="20" value={form.percentage} onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))} />
                  {project && form.percentage && (
                    <p className="text-[10px] text-[#555] mt-1">= ${((Number(form.percentage) / 100) * project.total_value).toLocaleString()}</p>
                  )}
                </div>
              )}
              <div>
                <label className="section-label mb-1.5 block">Notes (optional)</label>
                <input type="text" className="os-input" placeholder="e.g. Edit fee phase 1" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={handleAdd} disabled={!form.user_id || (!form.amount && !form.percentage)} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  Add Payout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
