'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Link as LinkIcon, ZoomIn, ZoomOut, AlertTriangle, Plus, X, Check, Calendar } from 'lucide-react';
import { mockProjects, mockUsers } from '@/lib/mock-data';
import type { Milestone } from '@/lib/types';

type MilestoneStatus = 'locked' | 'in_progress' | 'submitted' | 'approved';

interface LocalMilestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  startDate: string;
  endDate: string;
  assignedTo: string[];
  isClientVisible: boolean;
  payout?: number;
  dependsOn?: string;
}

function generateId() { return `ms_${Date.now().toString(36)}`; }

const STATUS_COLOR: Record<string, string> = {
  approved: '#10b981',
  in_progress: '#3b82f6',
  submitted: '#f59e0b',
  locked: '#555',
};

export default function DependencyArchitect() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [zoom, setZoom] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [autoLinking, setAutoLinking] = useState(false);
  const [autoLinked, setAutoLinked] = useState(false);

  // Local milestones added this session
  const [localMilestones, setLocalMilestones] = useState<LocalMilestone[]>([]);

  // Create form
  const [form, setForm] = useState({
    name: '', startDate: '', endDate: '', status: 'locked' as MilestoneStatus,
    assignedTo: [] as string[], isClientVisible: false, payout: '',
  });

  const allMilestones = [
    ...selectedProject.milestones.slice(0, 4).map(m => ({ ...m, isLocal: false })),
    ...localMilestones.filter(m => true).map(m => ({ ...m, isLocal: true })),
  ];

  const doAutoLink = () => {
    setAutoLinking(true);
    setTimeout(() => { setAutoLinking(false); setAutoLinked(true); }, 1200);
  };

  const createMilestone = () => {
    if (!form.name.trim()) return;
    const prev = allMilestones[allMilestones.length - 1];
    const newMs: LocalMilestone = {
      id: generateId(), name: form.name, status: form.status,
      startDate: form.startDate || new Date().toISOString().split('T')[0],
      endDate: form.endDate, assignedTo: form.assignedTo,
      isClientVisible: form.isClientVisible, payout: form.payout ? Number(form.payout) : undefined,
      dependsOn: prev?.id,
    };
    setLocalMilestones(prev => [...prev, newMs]);
    setForm({ name: '', startDate: '', endDate: '', status: 'locked', assignedTo: [], isClientVisible: false, payout: '' });
    setShowCreateModal(false);
    setAutoLinked(false); // reset so next autolink reflects new nodes
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Dependency Architect</h1>
          <p className="text-xs text-[#555] mt-0.5">Critical path visualization & bottleneck detection</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={doAutoLink} disabled={autoLinking}
            className={`btn-secondary transition-all ${autoLinked ? 'border-[rgba(16,185,129,0.4)] text-[#10b981] bg-[rgba(16,185,129,0.06)]' : ''}`}>
            <LinkIcon className="w-3.5 h-3.5" />
            {autoLinking ? 'Linking...' : autoLinked ? '✓ Auto-linked' : 'Auto-link nodes'}
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-3.5 h-3.5" /> Create Milestone
          </button>
        </div>
      </div>

      {/* Project Tabs */}
      <div className="flex gap-2 flex-shrink-0 flex-wrap">
        {mockProjects.filter(p => p.status === 'active').map(p => (
          <button key={p.id} onClick={() => { setSelectedProject(p); setAutoLinked(false); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${selectedProject.id === p.id ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border-[rgba(182,51,46,0.3)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden bg-[#050505]">
        {/* Dot Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Zoom toolbar */}
        <div className="absolute top-4 left-4 z-10 glass-panel-elevated p-2 rounded-xl flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[#555] transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs font-mono text-[#888] w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[#555] transition-colors"><ZoomIn className="w-4 h-4" /></button>
        </div>

        {/* Auto-link status banner */}
        <AnimatePresence>
          {autoLinked && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-4 right-4 z-10 flex items-center gap-2 text-[10px] text-[#10b981] glass-panel-elevated px-3 py-2 rounded-xl border border-[rgba(16,185,129,0.3)]">
              <Check className="w-3 h-3" /> All nodes linked in sequence
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="absolute inset-0 flex items-center justify-center overflow-auto">
          <div className="transition-transform duration-300" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <div className="flex items-center gap-0 relative p-10">
              {/* Connection lines */}
              {allMilestones.map((_, i) => i < allMilestones.length - 1 && (
                <div key={`line-${i}`} className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `calc(${i * (196 + 40)}px + 196px)`, width: 40, height: 1, background: autoLinked || i < selectedProject.milestones.length - 1 ? 'rgba(182,51,46,0.4)' : 'rgba(255,255,255,0.08)' }}>
                  {(autoLinked || i < selectedProject.milestones.length - 1) && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-2 border-y-transparent border-l-4 border-l-[rgba(182,51,46,0.5)]" />
                  )}
                </div>
              ))}

              {allMilestones.map((m, i) => {
                const statusColor = STATUS_COLOR[m.status] ?? '#555';
                return (
                  <div key={m.id} className="flex items-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className={`w-[196px] glass-panel-elevated p-4 rounded-2xl relative z-10 cursor-pointer hover:border-[rgba(182,51,46,0.4)] transition-all`}
                      style={{ borderLeft: `3px solid ${statusColor}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-[#555] tracking-widest uppercase">MS-{i + 1}</span>
                        {'isLocal' in m && m.isLocal && <span className="text-[8px] bg-[rgba(182,51,46,0.15)] text-[#b6332e] px-1.5 py-0.5 rounded font-bold">NEW</span>}
                        {m.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />}
                      </div>
                      <h3 className="text-xs font-bold text-[#eee] mb-2 leading-tight">{m.name}</h3>
                      <div className="text-[9px] text-[#444] mb-2 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {m.endDate}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                          {(m.assignedTo ?? []).map(id => {
                            const u = mockUsers.find(u => u.id === id);
                            return (
                              <div key={id} className="w-5 h-5 rounded-full bg-[#222] border border-[#111] flex items-center justify-center text-[8px] font-bold text-[#888]" title={u?.name}>
                                {u?.name.charAt(0) ?? '?'}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold capitalize" style={{ color: statusColor, background: `${statusColor}18` }}>
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                      {autoLinked && i > 0 && (
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-[rgba(182,51,46,0.4)]" />
                      )}
                    </motion.div>
                    {i < allMilestones.length - 1 && <div className="w-10 flex-shrink-0" />}
                  </div>
                );
              })}

              {/* Add new node CTA */}
              <div className="flex items-center">
                <div className="w-10 flex-shrink-0" />
                <button onClick={() => setShowCreateModal(true)}
                  className="w-[120px] h-[100px] rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center text-[#333] hover:border-[rgba(182,51,46,0.3)] hover:text-[#b6332e] transition-all group">
                  <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Add Phase</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="glass-panel p-3 rounded-xl space-y-1.5">
            {Object.entries(STATUS_COLOR).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2 text-[10px] text-[#888]">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Milestone Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#eee]">Create Milestone</h2>
                <button onClick={() => setShowCreateModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="section-label mb-1.5 block">Phase Name *</label>
                  <input type="text" className="os-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Color Grading & Sound Mix" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Start Date</label>
                    <input type="date" className="os-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Due Date</label>
                    <input type="date" className="os-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Status</label>
                    <select className="os-input cursor-pointer" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MilestoneStatus }))}>
                      <option value="locked">Locked</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Payout ($)</label>
                    <input type="number" className="os-input" value={form.payout} onChange={e => setForm(f => ({ ...f, payout: e.target.value }))} placeholder="0" min={0} />
                  </div>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">
                    Assigned Team Members
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {mockUsers.filter(u => u.role !== 'client').map(u => (
                      <button key={u.id}
                        onClick={() => setForm(f => ({
                          ...f,
                          assignedTo: f.assignedTo.includes(u.id) ? f.assignedTo.filter(id => id !== u.id) : [...f.assignedTo, u.id]
                        }))}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] border transition-all ${form.assignedTo.includes(u.id) ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                        <span className="w-5 h-5 rounded-full bg-[#111] flex items-center justify-center text-[9px] font-bold flex-shrink-0">{u.name.charAt(0)}</span>
                        <span className="truncate">{u.name.split(' ')[0]}</span>
                        {form.assignedTo.includes(u.id) && <Check className="w-2.5 h-2.5 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#888]">Visible to Client</span>
                  <button onClick={() => setForm(f => ({ ...f, isClientVisible: !f.isClientVisible }))}
                    className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 ${form.isClientVisible ? 'bg-[#b6332e] border-[#b6332e]' : 'bg-transparent border-[rgba(255,255,255,0.1)]'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.isClientVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="glass-panel rounded-xl p-3 text-[10px] text-[#555] flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-[#b6332e] flex-shrink-0" />
                  This milestone will auto-link as a dependency of the previous phase.
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={createMilestone} disabled={!form.name.trim()} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  <GitBranch className="w-3.5 h-3.5" /> Add to Graph
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
