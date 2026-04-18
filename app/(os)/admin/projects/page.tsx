'use client';

import { useState, useCallback, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MoreVertical, CheckCircle, Clock, AlertTriangle, Lock,
  ArrowRight, Users, DollarSign, Calendar, Trash2, Edit3, Archive,
  ExternalLink, ChevronRight, Play, ChevronDown, X, UserCheck, FileSignature,
  GripVertical, LayoutGrid, List, LayoutList, Loader2
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { dbAddProject, dbUpdateProject, dbDeleteProject, dbAddMilestone, dbUpdateMilestone } from '@/lib/supabase/db';
import Link from 'next/link';
import type { Project, Milestone, MilestoneStatus, ProjectStatus } from '@/lib/types';

// ─── Constants ─────────────────────────────────────────────────────────────────

const HEALTH_CONFIG = {
  green: { label: 'On Track', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  amber: { label: 'At Risk', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  red: { label: 'Critical', color: '#b6332e', bg: 'rgba(182,51,46,0.1)' },
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  awaiting_approval: 'Awaiting Approval',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

const MILESTONE_CFG: Record<MilestoneStatus, { label: string; color: string; icon: React.ElementType }> = {
  locked: { label: 'Locked', color: '#444', icon: Lock },
  unlocked: { label: 'Unlocked', color: '#555', icon: Play },
  in_progress: { label: 'In Progress', color: '#3b82f6', icon: Clock },
  submitted: { label: 'Submitted', color: '#f59e0b', icon: ChevronDown },
  approved: { label: 'Approved', color: '#10b981', icon: CheckCircle },
  overdue: { label: 'Overdue', color: '#b6332e', icon: AlertTriangle },
};

const NEXT_STATUS: Record<MilestoneStatus, MilestoneStatus> = {
  locked: 'unlocked', unlocked: 'in_progress', in_progress: 'submitted',
  submitted: 'approved', approved: 'approved', overdue: 'in_progress',
};

const CONTRACT_TEMPLATES = [
  { id: 'msa', label: 'Master Service Agreement', desc: 'Governs the overall client relationship, scope, and IP' },
  { id: 'nda', label: 'Non-Disclosure Agreement', desc: 'Confidentiality protection for both parties' },
  { id: 'sow', label: 'Statement of Work', desc: 'Detailed deliverables, timeline, and payment schedule' },
  { id: 'ip_transfer', label: 'IP Transfer Agreement', desc: 'Transfers ownership of creative assets upon payment' },
];

function generateMilestoneId() { return `ms_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`; }

// ─── Milestone Row (in detail panel) ─────────────────────────────────────────

function MilestoneRow({ milestone, projectId, onAdvance }: { milestone: Milestone; projectId: string; onAdvance?: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const cfg = MILESTONE_CFG[milestone.status];
  const StatusIcon = cfg.icon;

  const advance = async () => {
    const next = NEXT_STATUS[milestone.status];
    if (next === 'approved' && milestone.status === 'approved') return;
    setBusy(true);
    await dbUpdateMilestone(milestone.id, {
      status: next,
      progress: next === 'approved' ? 100 : milestone.progress,
    });
    setBusy(false);
    onAdvance?.(milestone.id);
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${milestone.status === 'locked' ? 'border-[rgba(255,255,255,0.03)] opacity-40' : 'border-[rgba(255,255,255,0.05)] hover:bg-[#111]'}`}>
      <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#ddd] truncate">{milestone.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-[#444]">{milestone.endDate}</p>
          {milestone.payout && <span className="text-[10px] text-[#333]">· ${milestone.payout.toLocaleString()}</span>}
        </div>
      </div>
      <div className="w-14 hidden sm:block">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${milestone.progress}%`, background: cfg.color }} />
        </div>
        <p className="text-[9px] text-[#444] text-right mt-0.5">{milestone.progress}%</p>
      </div>
      <div className="flex -space-x-1.5">
        {(milestone.assignedTo ?? []).slice(0, 3).map((uid: string) => (
          <div key={uid} title={uid} className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[8px] font-bold text-[#888]">
            {uid.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {milestone.status !== 'approved' && (
        <button onClick={advance} disabled={busy || milestone.status === 'locked'}
          className="text-[10px] px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#eee] hover:border-[rgba(255,255,255,0.15)] disabled:opacity-30 transition-all whitespace-nowrap">
          {busy ? '...' : `→ ${MILESTONE_CFG[NEXT_STATUS[milestone.status]].label}`}
        </button>
      )}
    </div>
  );
}

// ─── Multi-Step New Project Modal ─────────────────────────────────────────────

interface DraftMilestone {
  id: string;
  name: string;
  endDate: string;
  payout: string;
  assignedTo: string[];
  isClientVisible: boolean;
}

const STEPS = ['Basics', 'Milestones', 'Team', 'Contracts'];

function NewProjectModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [basics, setBasics] = useState({
    name: '', clientName: '', clientId: 'usr_client_01',
    type: 'web' as Project['type'], totalValue: 10000,
    startDate: new Date().toISOString().split('T')[0], endDate: '', brief: '',
  });

  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    { id: generateMilestoneId(), name: 'Discovery & Brief', endDate: '', payout: '', assignedTo: ['usr_admin_01'], isClientVisible: true },
  ]);

  const [team, setTeam] = useState<string[]>(['usr_admin_01']);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

  const teamOptions: { id: string; name: string; title?: string; current_load?: number }[] = [];

  const addMilestone = () => {
    setMilestones(ms => [...ms, {
      id: generateMilestoneId(), name: '', endDate: '', payout: '', assignedTo: [], isClientVisible: true,
    }]);
  };

  const updateMilestone = (id: string, updates: Partial<DraftMilestone>) => {
    setMilestones(ms => ms.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMilestone = (id: string) => setMilestones(ms => ms.filter(m => m.id !== id));

  const toggleTeam = (uid: string) => {
    setTeam(t => t.includes(uid) ? t.filter(x => x !== uid) : [...t, uid]);
  };

  const handleSave = async () => {
    if (!basics.name || !basics.clientName) return;
    setBusy(true);
    try {
      // 1. Create the project
      const project = await dbAddProject({
        name: basics.name,
        client_name: basics.clientName,
        type: basics.type,
        total_value: basics.totalValue,
        start_date: basics.startDate,
        end_date: basics.endDate,
        brief: basics.brief,
        status: 'active',
        health_status: 'green',
        completion_percent: 0,
        paid_to_date: 0,
      });

      // 2. Create milestones
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (!m.name.trim()) continue;
        await dbAddMilestone({
          project_id: project.id,
          name: m.name,
          status: i === 0 ? 'unlocked' : 'locked',
          end_date: m.endDate || basics.endDate,
          progress: 0,
          is_client_visible: m.isClientVisible,
          payout: m.payout ? Number(m.payout) : null,
        });
      }

      setDone(true);
      setTimeout(onClose, 900);
    } catch (err) {
      console.error('Project create error:', err);
      alert('Failed to create project. Check console.');
    } finally {
      setBusy(false);
    }
  };

  const canProceed = [
    basics.name && basics.clientName && basics.endDate,
    milestones.some(m => m.name.trim()),
    team.length > 0,
    true,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Progress header */}
        <div className="border-b border-[rgba(255,255,255,0.06)] px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#eee]">New Project</h2>
            <button onClick={onClose}><X className="w-4 h-4 text-[#444] hover:text-white transition-colors" /></button>
          </div>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#b6332e]' : 'bg-[rgba(255,255,255,0.07)]'}`} />
                <p className={`text-[9px] mt-1 ${i === step ? 'text-[#b6332e] font-bold' : 'text-[#333]'}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {done ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-10 h-10 text-[#10b981] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#eee]">Project Created!</p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 160px)' }}>
              <AnimatePresence mode="wait">
                {/* STEP 0 — Basics */}
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="section-label mb-1.5 block">Project Name *</label>
                        <input type="text" className="os-input" value={basics.name} onChange={e => setBasics(b => ({ ...b, name: e.target.value }))} placeholder="e.g. Apex Brand Identity" autoFocus />
                      </div>
                      <div className="col-span-2">
                        <label className="section-label mb-1.5 block">Client Name *</label>
                        <input type="text" className="os-input" value={basics.clientName} onChange={e => setBasics(b => ({ ...b, clientName: e.target.value }))} placeholder="Client or company name" />
                      </div>
                      <div>
                        <label className="section-label mb-1.5 block">Service Type</label>
                        <select className="os-input cursor-pointer" value={basics.type} onChange={e => setBasics(b => ({ ...b, type: e.target.value as Project['type'] }))}>
                          <option value="web">Web Development</option>
                          <option value="video">Video Production</option>
                          <option value="branding">Branding</option>
                          <option value="social">Social Media</option>
                          <option value="full_brand">Full Brand Package</option>
                        </select>
                      </div>
                      <div>
                        <label className="section-label mb-1.5 block">Total Value ($)</label>
                        <input type="number" className="os-input" min={0} step={500} value={basics.totalValue} onChange={e => setBasics(b => ({ ...b, totalValue: Number(e.target.value) }))} />
                      </div>
                      <div>
                        <label className="section-label mb-1.5 block">Start Date *</label>
                        <input type="date" className="os-input" value={basics.startDate} onChange={e => setBasics(b => ({ ...b, startDate: e.target.value }))} />
                      </div>
                      <div>
                        <label className="section-label mb-1.5 block">End Date *</label>
                        <input type="date" className="os-input" value={basics.endDate} onChange={e => setBasics(b => ({ ...b, endDate: e.target.value }))} />
                      </div>
                      <div className="col-span-2">
                        <label className="section-label mb-1.5 block">Project Brief</label>
                        <textarea className="os-input resize-none" rows={3} value={basics.brief} onChange={e => setBasics(b => ({ ...b, brief: e.target.value }))} placeholder="High-level scope in one paragraph..." />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1 — Milestones */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-[#888]">Define project phases, due dates, and team payouts. The first milestone unlocks automatically.</p>
                      <button onClick={addMilestone} className="btn-ghost text-xs flex-shrink-0">
                        <Plus className="w-3 h-3" /> Add Phase
                      </button>
                    </div>

                    {milestones.map((m, i) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-elevated rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#888] bg-[rgba(255,255,255,0.05)] flex-shrink-0">{i + 1}</span>
                          <input type="text" className="os-input flex-1 text-sm font-semibold" placeholder={`Phase ${i + 1} name...`} value={m.name} onChange={e => updateMilestone(m.id, { name: e.target.value })} />
                          <button onClick={() => removeMilestone(m.id)} className="text-[#333] hover:text-[#b6332e] transition-colors flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="section-label mb-1 block">Due Date</label>
                            <input type="date" className="os-input text-xs" value={m.endDate} onChange={e => updateMilestone(m.id, { endDate: e.target.value })} />
                          </div>
                          <div>
                            <label className="section-label mb-1 block">Payout ($)</label>
                            <input type="number" className="os-input text-xs" min={0} step={100} placeholder="0" value={m.payout} onChange={e => updateMilestone(m.id, { payout: e.target.value })} />
                          </div>
                          <div className="flex flex-col">
                            <label className="section-label mb-1 block">Client Visible</label>
                            <button
                              onClick={() => updateMilestone(m.id, { isClientVisible: !m.isClientVisible })}
                              className={`flex-1 text-[10px] rounded-lg border transition-all font-semibold ${m.isClientVisible ? 'border-[rgba(16,185,129,0.4)] text-[#10b981] bg-[rgba(16,185,129,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#444]'}`}
                            >
                              {m.isClientVisible ? '✓ Visible' : '○ Hidden'}
                            </button>
                          </div>
                        </div>
                        {/* Assign to team */}
                        <div>
                          <label className="section-label mb-1.5 block">Assign To</label>
                          <div className="flex flex-wrap gap-1.5">
                            {teamOptions.map(u => {
                              const isAssigned = m.assignedTo.includes(u.id);
                              return (
                                <button
                                  key={u.id}
                                  onClick={() => updateMilestone(m.id, {
                                    assignedTo: isAssigned ? m.assignedTo.filter(x => x !== u.id) : [...m.assignedTo, u.id],
                                  })}
                                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${isAssigned ? 'border-[rgba(182,51,46,0.4)] bg-[rgba(182,51,46,0.1)] text-[#b6332e]' : 'border-[rgba(255,255,255,0.06)] text-[#444] hover:text-[#888]'}`}
                                >
                                  {u.name.split(' ')[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* STEP 2 — Team */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <p className="text-xs text-[#888] mb-3">Select all team members with access to this project.</p>
                    {teamOptions.map(u => {
                      const isSelected = team.includes(u.id);
                      return (
                        <motion.div
                          key={u.id}
                          onClick={() => toggleTeam(u.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.05)]' : 'border-[rgba(255,255,255,0.05)] hover:bg-[#111]'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-xs font-bold text-[#888] flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#eee] truncate">{u.name}</p>
                            <p className="text-[10px] text-[#444] truncate">{u.title}</p>
                          </div>
                          {u.current_load !== undefined && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${u.current_load > 4 ? 'text-[#f59e0b] border-[rgba(245,158,11,0.3)]' : 'text-[#10b981] border-[rgba(16,185,129,0.3)]'}`}>
                              {u.current_load} proj
                            </span>
                          )}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#b6332e] bg-[#b6332e]' : 'border-[#333]'}`}>
                            {isSelected && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* STEP 3 — Contracts */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <p className="text-xs text-[#888] mb-3">Select contract templates to attach. Contracts can be sent to the client from the IP &amp; Contracts vault.</p>
                    {CONTRACT_TEMPLATES.map(ct => {
                      const isSelected = selectedContracts.includes(ct.id);
                      return (
                        <div
                          key={ct.id}
                          onClick={() => setSelectedContracts(s => s.includes(ct.id) ? s.filter(x => x !== ct.id) : [...s, ct.id])}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.05)]' : 'border-[rgba(255,255,255,0.05)] hover:bg-[#111]'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${isSelected ? 'bg-[rgba(182,51,46,0.15)]' : 'bg-[rgba(255,255,255,0.04)]'}`}>
                            📄
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-[#eee]">{ct.label}</p>
                            <p className="text-[10px] text-[#555] mt-0.5">{ct.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${isSelected ? 'border-[#b6332e] bg-[#b6332e]' : 'border-[#333]'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                    <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] mt-3">
                      <p className="text-[10px] text-[#444] leading-relaxed">
                        Selected contracts will be created as <span className="text-[#888]">Draft</span> in IP &amp; Contracts. You can customize and send them from there after the project is created.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="border-t border-[rgba(255,255,255,0.05)] px-6 py-4 flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary text-xs">← Back</button>
              )}
              {step < STEPS.length - 1 && (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed[step]}
                  className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
                >
                  Next: {STEPS[step + 1]} →
                </button>
              )}
              {step === STEPS.length - 1 && (
                <button
                  onClick={handleSave}
                  disabled={busy}
                  className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
                >
                  {busy ? 'Creating...' : '🚀 Create Project'}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onOpen, onRefresh }: { project: Project; onOpen: (p: Project) => void; onRefresh: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const health = HEALTH_CONFIG[project.healthStatus ?? 'green'];

  const handleAction = async (action: 'hold' | 'archive' | 'delete' | 'complete') => {
    setMenuOpen(false);
    setBusy(true);
    try {
      if (action === 'delete') await dbDeleteProject(project.id);
      else if (action === 'complete') await dbUpdateProject(project.id, { status: 'completed', completion_percent: 100 });
      else if (action === 'hold') await dbUpdateProject(project.id, { status: project.status === 'on_hold' ? 'active' : 'on_hold' });
      else if (action === 'archive') await dbUpdateProject(project.id, { status: 'archived' });
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`glass-panel rounded-2xl p-5 glass-panel-hover transition-all ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ background: health.bg, color: health.color }} className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {health.label}
            </span>
            <span className="text-[9px] text-[#444] uppercase">{STATUS_LABELS[project.status ?? 'active']}</span>
          </div>
          <h3 className="text-sm font-bold text-[#eee] truncate">{project.name}</h3>
          <p className="text-xs text-[#555] mt-0.5">{project.clientName} · {(project.type ?? '').replace('_', ' ').toUpperCase()}</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(m => !m)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-[#eee] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 z-20 w-44 glass-panel-elevated rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xl">
                {[
                  { label: 'Open Detail', icon: ExternalLink, action: () => onOpen(project) },
                  { label: project.status === 'on_hold' ? 'Resume' : 'Put on Hold', icon: Clock, action: () => handleAction('hold') },
                  { label: 'Mark Complete', icon: CheckCircle, action: () => handleAction('complete') },
                  { label: 'Archive', icon: Archive, action: () => handleAction('archive') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="w-full text-left px-4 py-2.5 text-xs text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.04)] flex items-center gap-2">
                    <item.icon className="w-3 h-3" /> {item.label}
                  </button>
                ))}
                <div className="h-px bg-[rgba(255,255,255,0.05)] mx-3 my-1" />
                <button onClick={() => handleAction('delete')} className="w-full text-left px-4 py-2.5 text-xs text-[#b6332e] hover:bg-[rgba(182,51,46,0.08)] flex items-center gap-2">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[#555] mb-1.5">
          <span>Completion</span>
          <span className="font-bold" style={{ color: health.color }}>{project.completionPercent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${project.completionPercent}%`, background: health.color }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: DollarSign, value: `$${(project.paidToDate/1000).toFixed(0)}k`, sub: `of $${(project.totalValue/1000).toFixed(0)}k` },
          { icon: Calendar, value: `${project.milestones.filter(m => m.status === 'approved').length}/${project.milestones.length}`, sub: 'Phases' },
          { icon: Users, value: `${project.assignedTeam.length}`, sub: 'Team' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel-elevated rounded-lg p-2">
            <stat.icon className="w-2.5 h-2.5 text-[#444] mb-0.5" />
            <p className="text-xs font-bold text-[#eee]">{stat.value}</p>
            <p className="text-[9px] text-[#444]">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {(project.assignedTeam ?? []).slice(0, 4).map((uid: string) => (
            <div key={uid} title={uid} className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[9px] font-bold text-[#888]">
              {uid.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <button onClick={() => onOpen(project)} className="text-[10px] text-[#444] hover:text-[#b6332e] flex items-center gap-1 transition-colors">
          Manage <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Project Detail Panel ─────────────────────────────────────────────────────

function ProjectDetailPanel({ project, onClose, onRefresh }: { project: Project; onClose: () => void; onRefresh?: () => void }) {
  const [editingHealth, setEditingHealth] = useState(false);
  const [editingPaid, setEditingPaid] = useState(false);
  const [tempPaid, setTempPaid] = useState(String(project.paidToDate));
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newMs, setNewMs] = useState({ name: '', endDate: '', payout: '' });

  const current = project;

  const handleHealthChange = async (h: string) => {
    await dbUpdateProject(project.id, { health_status: h });
    setEditingHealth(false);
    onRefresh?.();
  };

  const savePaid = async () => {
    await dbUpdateProject(project.id, { paid_to_date: Number(tempPaid) });
    setEditingPaid(false);
    onRefresh?.();
  };

  const addMilestone = async () => {
    if (!newMs.name) return;
    await dbAddMilestone({
      project_id: project.id,
      name: newMs.name,
      status: 'locked',
      end_date: newMs.endDate || project.endDate,
      progress: 0,
      is_client_visible: true,
      payout: newMs.payout ? Number(newMs.payout) : null,
    });
    setNewMs({ name: '', endDate: '', payout: '' });
    setAddingMilestone(false);
    onRefresh?.();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
      className="glass-panel rounded-2xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
      <div className="sticky top-0 bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.05)] px-5 py-4 flex items-center justify-between z-10">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#eee] truncate">{current.name}</h2>
          <p className="text-[10px] text-[#555]">{current.clientName}</p>
        </div>
        <button onClick={onClose} className="text-[#444] hover:text-white ml-4"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-5 space-y-5">
        {/* Health */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Health</p>
            <button onClick={() => setEditingHealth(h => !h)} className="text-[#444] hover:text-[#b6332e]"><Edit3 className="w-3 h-3" /></button>
          </div>
          {editingHealth ? (
            <div className="flex gap-2">
              {(['green', 'amber', 'red'] as const).map(h => (
                <button key={h} onClick={() => handleHealthChange(h)} className="flex-1 text-[10px] py-1.5 rounded-lg font-bold" style={{ background: HEALTH_CONFIG[h].bg, color: HEALTH_CONFIG[h].color, border: `1px solid ${HEALTH_CONFIG[h].color}40` }}>
                  {HEALTH_CONFIG[h].label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: HEALTH_CONFIG[current.healthStatus].color }} />
              <span className="text-xs text-[#ccc]">{HEALTH_CONFIG[current.healthStatus].label}</span>
            </div>
          )}
        </div>

        {/* Financials */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Financials</p>
            <button onClick={() => setEditingPaid(p => !p)} className="text-[#444] hover:text-[#b6332e]"><Edit3 className="w-3 h-3" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-panel-elevated rounded-xl p-3">
              <p className="section-label mb-1">Contract Value</p>
              <p className="text-base font-black text-[#eee]">${current.totalValue.toLocaleString()}</p>
            </div>
            <div className="glass-panel-elevated rounded-xl p-3">
              <p className="section-label mb-1">Paid to Date</p>
              {editingPaid ? (
                <div className="flex gap-1.5">
                  <input type="number" className="os-input text-xs py-1 flex-1" value={tempPaid} onChange={e => setTempPaid(e.target.value)} />
                  <button onClick={savePaid} className="btn-primary text-[9px] py-1 px-2">✓</button>
                </div>
              ) : (
                <p className="text-base font-black text-[#10b981]">${Number(current.paidToDate).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="mt-2 progress-bar">
            <div className="progress-fill !bg-[#10b981]" style={{ width: `${Math.min((current.paidToDate / current.totalValue) * 100, 100)}%` }} />
          </div>
          <p className="text-[10px] text-[#444] mt-1">{Math.round((current.paidToDate / current.totalValue) * 100)}% collected</p>
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Milestones ({current.milestones.length})</p>
            <button onClick={() => setAddingMilestone(a => !a)} className="btn-ghost text-[10px] py-0.5 px-2">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          <AnimatePresence>
            {addingMilestone && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-3 glass-panel-elevated rounded-xl p-3 space-y-2 overflow-hidden">
                <input type="text" className="os-input text-xs" placeholder="Milestone name..." value={newMs.name} onChange={e => setNewMs(n => ({ ...n, name: e.target.value }))} autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="os-input text-xs" value={newMs.endDate} onChange={e => setNewMs(n => ({ ...n, endDate: e.target.value }))} />
                  <input type="number" className="os-input text-xs" placeholder="Payout ($)" min={0} value={newMs.payout} onChange={e => setNewMs(n => ({ ...n, payout: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddingMilestone(false)} className="btn-secondary text-[10px] flex-1 justify-center">Cancel</button>
                  <button onClick={addMilestone} disabled={!newMs.name} className="btn-primary text-[10px] flex-1 justify-center disabled:opacity-40">Add Phase</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {current.milestones.length === 0 ? (
            <p className="text-xs text-[#444]">No milestones. Click + Add to create phases.</p>
          ) : (
            <div className="space-y-2">
              {current.milestones.map(m => (
                <MilestoneRow key={m.id} milestone={m} projectId={current.id} />
              ))}
            </div>
          )}
        </div>

        {/* Team */}
        <div>
          <p className="section-label mb-2">Team ({current.assignedTeam.length})</p>
          <div className="space-y-2">
            {(current.assignedTeam ?? []).map((uid: string) => (
              <div key={uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#111] transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[10px] font-bold text-[#888]">{uid.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#ccc] truncate">{uid}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/team/vault" className="btn-secondary text-[10px] justify-center">📁 Vault</Link>
          <Link href="/admin/ledger" className="btn-secondary text-[10px] justify-center">💳 Ledger</Link>
          <Link href="/admin/nudge" className="btn-secondary text-[10px] justify-center">⚡ Nudge</Link>
          <Link href="/admin/contracts" className="btn-secondary text-[10px] justify-center">📄 Contracts</Link>
          <Link href="/admin/quotation" className="btn-secondary text-[10px] justify-center col-span-2">📋 Generate Quote</Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Timeline View ──────────────────────────────────────────────────────────────

function TimelineView({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project) => void }) {
  const today = new Date();
  // Calculate timeline window: earliest startDate to latest endDate
  const dates = projects.flatMap(p => [
    new Date(p.startDate), new Date(p.endDate),
  ].filter(d => !isNaN(d.getTime())));
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
  // Expand window by 1 month each side
  minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setMonth(maxDate.getMonth() + 1);

  const totalMs = maxDate.getTime() - minDate.getTime();
  const pct = (d: Date) => Math.max(0, Math.min(100, ((d.getTime() - minDate.getTime()) / totalMs) * 100));
  const todayPct = pct(today);

  // Month headers
  const months: { label: string; left: number }[] = [];
  const cur = new Date(minDate);
  cur.setDate(1);
  while (cur <= maxDate) {
    months.push({ label: cur.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), left: pct(cur) });
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
        <p className="text-xs text-[#555]">Gantt-style view · {projects.length} projects · Hover to interact</p>
      </div>
      <div className="overflow-x-auto min-h-[300px]">
        <div className="min-w-[700px]">
          {/* Month header */}
          <div className="relative h-8 border-b border-[rgba(255,255,255,0.05)] px-36 bg-[#050505]">
            {months.map((m, i) => (
              <span key={i} className="absolute top-1.5 text-[9px] text-[#444] font-mono" style={{ left: `calc(144px + ${m.left}%)` }}>{m.label}</span>
            ))}
          </div>

          {/* Today line + rows */}
          <div className="relative">
            {/* Today vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-[#b6332e]/40 z-10"
              style={{ left: `calc(144px + ${todayPct}%)` }}
            >
              <span className="absolute -top-0 -translate-x-1/2 text-[8px] text-[#b6332e] bg-[#b6332e]/10 px-1 py-0.5 rounded whitespace-nowrap">Today</span>
            </div>

            {projects.map((p, idx) => {
              const start = new Date(p.startDate);
              const end = new Date(p.endDate);
              const left = pct(!isNaN(start.getTime()) ? start : today);
              const right = pct(!isNaN(end.getTime()) ? end : today);
              const width = Math.max(right - left, 2);
              const hc = HEALTH_CONFIG[p.healthStatus];
              return (
                <div key={p.id}
                  className={`flex items-center border-b border-[rgba(255,255,255,0.03)] px-2 py-2 hover:bg-[#111] transition-colors group ${idx % 2 === 0 ? '' : 'bg-[#040404]'}`}
                  style={{ height: 52 }}
                >
                  {/* Label */}
                  <div className="w-36 flex-shrink-0 pr-3">
                    <p className="text-[10px] font-bold text-[#ccc] truncate">{p.name}</p>
                    <p className="text-[9px] text-[#444] truncate">{p.clientName}</p>
                  </div>

                  {/* Bar area */}
                  <div className="flex-1 relative h-7">
                    <button
                      onClick={() => onOpen(p)}
                      className="absolute h-6 top-0.5 rounded-lg flex items-center px-2 text-[9px] font-bold text-white transition-all hover:opacity-90 hover:scale-y-110 overflow-hidden"
                      style={{ left: `${left}%`, width: `${width}%`, background: hc.color, minWidth: 8 }}
                      title={`${p.name} · ${p.completionPercent}% done`}
                    >
                      {width > 6 && <span className="truncate">{p.completionPercent}%</span>}
                      {/* Milestones as dots */}
                    </button>
                    {/* Milestone markers */}
                    {p.milestones.map(m => {
                      const mDate = new Date(m.endDate);
                      if (isNaN(mDate.getTime())) return null;
                      const mp = pct(mDate);
                      if (mp < left || mp > left + width) return null;
                      return (
                        <div key={m.id}
                          className="absolute w-2 h-2 rounded-full border border-black top-2.5 -translate-x-1/2 z-[5]"
                          style={{ left: `${mp}%`, background: MILESTONE_CFG[m.status].color }}
                          title={m.name}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-[rgba(255,255,255,0.04)]">
        {Object.entries(HEALTH_CONFIG).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: v.color }} />
            <span className="text-[9px] text-[#555]">{v.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          <span className="text-[9px] text-[#555]">Milestone</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('os_projects')
      .select('*, os_milestones(*)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Remap snake_case columns to what the UI expects
      const mapped: Project[] = data.map((p: Record<string, unknown>) => ({
        ...p,
        id: p.id as string,
        name: p.name as string,
        clientName: (p.client_name ?? p.name) as string,
        client_name: p.client_name as string,
        type: (p.type ?? 'web') as string,
        totalValue: Number(p.total_value ?? 0),
        paidToDate: Number(p.paid_to_date ?? 0),
        healthStatus: (p.health_status ?? 'green') as string,
        completionPercent: Number(p.completion_percent ?? 0),
        startDate: p.start_date as string,
        endDate: p.end_date as string,
        status: (p.status ?? 'active') as ProjectStatus,
        assignedTeam: (p.assigned_team ?? []) as string[],
        milestones: ((p.os_milestones ?? []) as Record<string, unknown>[]).map((m) => ({
          ...m,
          id: m.id as string,
          name: m.name as string,
          status: (m.status ?? 'locked') as MilestoneStatus,
          progress: Number(m.progress ?? 0),
          assignedTo: (m.assigned_to ?? []) as string[],
          endDate: m.end_date as string,
          startDate: m.start_date as string,
          payout: m.payout ? Number(m.payout) : undefined,
          isClientVisible: m.is_client_visible as boolean,
          dependencies: (m.dependencies ?? []) as string[],
        })),
        tags: (p.tags ?? []) as string[],
      })) as unknown as Project[];
      setProjects(mapped);
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProjects(); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = {
    active: projects.filter(p => p.status === 'active').length,
    revenue: projects.filter(p => p.status === 'active').reduce((s, p) => s + (p.totalValue ?? 0), 0),
    collected: projects.reduce((s, p) => s + (p.paidToDate ?? 0), 0),
    atRisk: projects.filter(p => p.healthStatus !== 'green' && p.status === 'active').length,
  };

  const VIEW_MODES: { id: 'grid' | 'list' | 'timeline'; label: string; icon: React.ElementType }[] = [
    { id: 'grid', label: 'Grid', icon: LayoutGrid },
    { id: 'list', label: 'List', icon: List },
    { id: 'timeline', label: 'Timeline', icon: LayoutList },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Project Management</h1>
          <p className="text-xs text-[#555] mt-0.5">
            {loading ? 'Loading...' : `${summary.active} active · ${projects.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex gap-0.5 p-0.5 rounded-xl bg-[#111] border border-[rgba(255,255,255,0.06)]">
            {VIEW_MODES.map(m => (
              <button key={m.id} onClick={() => setViewMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                  viewMode === m.id ? 'bg-[#1a1a1a] text-[#eee]' : 'text-[#555] hover:text-[#888]'
                }`}>
                <m.icon className="w-3 h-3" />{m.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNewModal(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: summary.active, color: '#10b981' },
          { label: 'Pipeline', value: `$${(summary.revenue / 1000).toFixed(0)}k`, color: '#3b82f6' },
          { label: 'Collected', value: `$${(summary.collected / 1000).toFixed(0)}k`, color: '#eee' },
          { label: 'At Risk', value: summary.atRisk, color: summary.atRisk > 0 ? '#f59e0b' : '#10b981' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="kpi-card">
            <p className="section-label mb-1">{k.label}</p>
            <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input type="text" placeholder="Search project or client..." className="os-input pl-9 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'active', 'on_hold', 'completed', 'archived'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${statusFilter === f ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border border-[rgba(182,51,46,0.3)]' : 'border border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <TimelineView projects={filtered} onOpen={p => setSelectedProject(selectedProject?.id === p.id ? null : p)} />
      ) : (
        <div className={selectedProject ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}>
          <div className={selectedProject ? 'lg:col-span-2' : ''}>
            {loading ? (
            <div className="py-20 flex items-center justify-center text-[#444]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading projects...
            </div>
          ) : filtered.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center">
                <p className="text-[#555] text-sm mb-3">No projects found.</p>
                <button onClick={() => setShowNewModal(true)} className="btn-primary text-xs mx-auto"><Plus className="w-3 h-3" /> Create First Project</button>
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div layout className={`grid gap-4 ${selectedProject ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                <AnimatePresence mode="popLayout">
                  {filtered.map(p => (
                    <ProjectCard key={p.id} project={p} onRefresh={loadProjects} onOpen={proj => setSelectedProject(selectedProject?.id === proj.id ? null : proj)} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-[rgba(255,255,255,0.05)]">
                    <tr>
                      {['Project', 'Client', 'Health', 'Progress', 'Value', ''].map(h => (
                        <th key={h} className={`px-5 py-3 section-label ${h === 'Value' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {filtered.map(p => {
                      const hc = HEALTH_CONFIG[p.healthStatus];
                      return (
                        <tr key={p.id} className="table-row-hover cursor-pointer" onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}>
                          <td className="px-5 py-3 text-sm font-bold text-[#eee]">{p.name}</td>
                          <td className="px-5 py-3 text-xs text-[#666]">{p.clientName}</td>
                          <td className="px-5 py-3">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: hc.bg, color: hc.color }}>{hc.label}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="progress-bar w-20"><div className="progress-fill" style={{ width: `${p.completionPercent}%`, background: hc.color }} /></div>
                              <span className="text-[10px] text-[#555]">{p.completionPercent}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-bold text-[#eee]">${p.totalValue.toLocaleString()}</td>
                          <td className="px-5 py-3"><ChevronRight className="w-4 h-4 text-[#444]" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedProject && (
              <ProjectDetailPanel
                project={projects.find(p => p.id === selectedProject.id) ?? selectedProject}
                onClose={() => setSelectedProject(null)}
                onRefresh={loadProjects}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showNewModal && <NewProjectModal onClose={() => setShowNewModal(false)} onSaved={loadProjects} />}
      </AnimatePresence>
    </div>
  );
}
