'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { GitBranch, Lock, CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

interface MilestoneRow {
  id: string; project_id: string; name: string; status: string;
  start_date: string | null; end_date: string | null;
  assigned_to: string[]; payout: number | null; display_order: number;
  dependencies: string[];
}
interface ProjectRow { id: string; name: string; client_name: string; status: string; health_status: string; }
interface UserRow { id: string; name: string; }

const STATUS_CONFIG = {
  locked: { color: '#333', icon: Lock, label: 'Locked' },
  unlocked: { color: '#555', icon: Clock, label: 'Unlocked' },
  in_progress: { color: '#3b82f6', icon: Clock, label: 'In Progress' },
  submitted: { color: '#f59e0b', icon: ChevronRight, label: 'Submitted' },
  approved: { color: '#10b981', icon: CheckCircle, label: 'Approved' },
  overdue: { color: '#b6332e', icon: AlertTriangle, label: 'Overdue' },
};

export default function DependencyArchitect() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, mRes, uRes] = await Promise.all([
        supabase.from('os_projects').select('id,name,client_name,status,health_status').eq('status', 'active'),
        supabase.from('os_milestones').select('*').order('display_order', { ascending: true }),
        supabase.from('os_users').select('id,name'),
      ]);
      const projs = pRes.data ?? [];
      setProjects(pRes.data ?? [] as any);
      setMilestones(mRes.data ?? [] as any);
      setUsers(uRes.data ?? [] as any);
      if (projs.length) setActiveProjectId((projs[0] as any).id);
      setLoading(false);
    }
    load();
  }, []);

  const project = projects.find((p) => p.id === activeProjectId);
  const projectMilestones = milestones
    .filter((m) => m.project_id === activeProjectId)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#eee]">Dependency Architect</h1>
        <p className="text-xs text-[#555] mt-0.5">Visual milestone dependency map · live from database</p>
      </div>

      {/* Project Tabs */}
      <div className="flex gap-2 flex-wrap">
        {projects.map((p) => (
          <button key={p.id} onClick={() => setActiveProjectId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all truncate max-w-[240px] ${activeProjectId === p.id
              ? 'border-[rgba(182,51,46,0.4)] bg-[rgba(182,51,46,0.1)] text-[#b6332e]'
              : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${p.health_status === 'green' ? 'bg-[#10b981]' : p.health_status === 'amber' ? 'bg-[#f59e0b]' : 'bg-[#b6332e]'}`} />
            {p.name}
          </button>
        ))}
        {!loading && projects.length === 0 && (
          <p className="text-xs text-[#444]">No active projects</p>
        )}
      </div>

      {project && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline / Gantt-style view */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#444]" />
                <h2 className="text-sm font-bold text-[#eee]">Milestone Pipeline — {project.name}</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {loading && <div className="text-center py-8 text-xs text-[#333]">Loading milestones...</div>}
              {!loading && projectMilestones.length === 0 && (
                <div className="text-center py-8 text-xs text-[#333]">No milestones found for this project</div>
              )}
              {projectMilestones.map((m, i) => {
                const cfg = STATUS_CONFIG[m.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.locked;
                const Icon = cfg.icon;
                const assignees = (m.assigned_to ?? []).map((id) => users.find((u) => u.id === id)).filter(Boolean) as UserRow[];
                const hasDeps = (m.dependencies ?? []).length > 0;

                return (
                  <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${m.status === 'in_progress'
                      ? 'border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.04)]'
                      : m.status === 'overdue'
                      ? 'border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.04)]'
                      : 'border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.07)]'}`}>
                      {/* Step indicator */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {m.status === 'approved' ? '✓' : String(i + 1).padStart(2, '0')}
                        </div>
                        {i < projectMilestones.length - 1 && (
                          <div className={`w-0.5 h-4 rounded ${['approved', 'in_progress'].includes(m.status) ? 'bg-[#3b82f6]/30' : 'bg-[#222]'}`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold ${m.status === 'approved' ? 'text-[#555] line-through' : 'text-[#eee]'}`}>
                            {m.name}
                          </p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ color: cfg.color, background: `${cfg.color}15` }}>
                            <Icon className="w-3 h-3 inline mr-1" />{cfg.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-[10px] text-[#444]">
                          {m.start_date && <span>🗓 {new Date(m.start_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>}
                          {m.end_date && <span>→ {new Date(m.end_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>}
                          {m.payout && <span className="text-[#10b981]">💰 ${Number(m.payout).toLocaleString()}</span>}
                        </div>

                        {assignees.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {assignees.slice(0, 4).map((u) => (
                              <div key={u.id} title={u.name}
                                className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[8px] font-bold text-[#888]">
                                {u.name.charAt(0)}
                              </div>
                            ))}
                            {assignees.length > 4 && <span className="text-[9px] text-[#444]">+{assignees.length - 4}</span>}
                          </div>
                        )}

                        {hasDeps && (
                          <p className="text-[9px] text-[#444] mt-1.5">
                            🔗 Depends on {(m.dependencies ?? []).length} milestone(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#eee] mb-4">Pipeline Health</h3>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = projectMilestones.filter((m) => m.status === status).length;
                  if (count === 0) return null;
                  const Icon = cfg.icon;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        <span className="text-[10px] text-[#888]">{cfg.label}</span>
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#eee] mb-4">Payout Allocation</h3>
              <div className="space-y-2">
                {projectMilestones.filter((m) => m.payout && Number(m.payout) > 0).map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <p className="text-[10px] text-[#888] truncate flex-1 mr-2">{m.name}</p>
                    <span className="text-[10px] font-bold text-[#10b981] flex-shrink-0">${Number(m.payout).toLocaleString()}</span>
                  </div>
                ))}
                {projectMilestones.filter((m) => m.payout && Number(m.payout) > 0).length === 0 && (
                  <p className="text-[10px] text-[#333]">No payouts set</p>
                )}
                <div className="border-t border-[rgba(255,255,255,0.05)] pt-2 mt-2 flex justify-between">
                  <span className="text-[10px] text-[#555]">Total</span>
                  <span className="text-[10px] font-bold text-[#eee]">
                    ${projectMilestones.reduce((s, m) => s + Number(m.payout ?? 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-panel rounded-2xl h-60 animate-pulse" />
      )}
    </div>
  );
}
