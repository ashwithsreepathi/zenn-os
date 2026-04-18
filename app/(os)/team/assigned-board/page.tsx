'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProjectRow { id: string; name: string; client_name: string; type: string; health_status: string; completion_percent: number; assigned_team: string[]; }
interface MilestoneRow { id: string; project_id: string; name: string; status: string; assigned_to: string[]; }
interface MessagePreview { channel_id: string; content: string; sender_name: string | null; created_at: string; channel_name?: string; }

export default function AssignedBoard() {
  const { user, impersonating, impersonatingUserId } = useAuth();
  const [myProjects, setMyProjects] = useState<ProjectRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [recentMessages, setRecentMessages] = useState<MessagePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Resolve which user we're looking at
      const resolvedId = impersonating ? impersonatingUserId : user?.id;
      if (!resolvedId) { setLoading(false); return; }

      const [projRes, msRes, msgRes] = await Promise.all([
        supabase.from('os_projects').select('id,name,client_name,type,health_status,completion_percent,assigned_team').eq('status', 'active'),
        supabase.from('os_milestones').select('id,project_id,name,status,assigned_to'),
        supabase.from('os_messages').select('channel_id,content,sender_name,created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const allProjects = (projRes.data ?? []) as ProjectRow[];
      const allMilestones = (msRes.data ?? []) as MilestoneRow[];

      // Filter to projects where this user is in assigned_team
      const mine = allProjects.filter((p) => (p.assigned_team ?? []).includes(resolvedId));
      const myProjectIds = mine.map((p) => p.id);
      const myMilestones = allMilestones.filter((m) => myProjectIds.includes(m.project_id));

      setMyProjects(mine);
      setMilestones(myMilestones);
      setRecentMessages((msgRes.data ?? []).slice(0, 3) as MessagePreview[]);
      setLoading(false);
    }
    load();
  }, [user, impersonating, impersonatingUserId]);

  const resolvedId = impersonating ? impersonatingUserId : user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-[#444] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#eee]">My Assigned Board</h1>
        <p className="text-xs text-[#555] mt-0.5">Your active projects and pending milestones · live from database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-[#eee]">Active Projects</h2>

          {myProjects.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <p className="text-[#666] text-sm">No active projects assigned to you.</p>
              <p className="text-[#444] text-xs mt-2">Contact your project manager for assignments.</p>
            </div>
          ) : (
            myProjects.map((project, i) => {
              const projectMilestones = milestones.filter((m) => m.project_id === project.id && (m.assigned_to ?? []).includes(resolvedId ?? ''));
              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass-panel rounded-2xl p-6 glass-panel-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#eee]">{project.name}</h3>
                      <p className="text-xs text-[#666] mt-1">{project.client_name} · {project.type.toUpperCase()}</p>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${project.health_status === 'red' ? 'bg-[#b6332e]/20 text-[#b6332e]' : project.health_status === 'amber' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
                      {project.completion_percent}% Complete
                    </div>
                  </div>

                  <div className="progress-bar mb-5">
                    <div className={`progress-fill ${project.health_status === 'red' ? 'bg-[#b6332e]' : project.health_status === 'amber' ? '!bg-[#f59e0b]' : '!bg-[#10b981]'}`}
                      style={{ width: `${project.completion_percent}%` }} />
                  </div>

                  <div className="space-y-2">
                    <p className="section-label">My Milestones</p>
                    {projectMilestones.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#111]">
                        <div className="flex items-center gap-3">
                          {m.status === 'locked' ? (
                            <AlertTriangle className="w-4 h-4 text-[#555]" />
                          ) : m.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-[#10b981]" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#b6332e]" />
                          )}
                          <span className={`text-sm ${m.status === 'locked' ? 'text-[#555]' : 'text-[#ddd]'}`}>{m.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {m.status === 'in_progress' && (
                            <Link href="/team/submission" className="btn-primary text-[10px] py-1 px-3">Submit Proof</Link>
                          )}
                          <Link href="/team/vault" className="btn-secondary text-[10px] py-1 px-3">Vault</Link>
                        </div>
                      </div>
                    ))}
                    {projectMilestones.length === 0 && (
                      <p className="text-xs text-[#444] pl-1">No milestones directly assigned to you on this project.</p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold text-[#eee] mb-4">Action Required</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.05)] flex gap-3">
                <AlertTriangle className="w-5 h-5 text-[#b6332e] flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#eee]">Update Milestone Progress</p>
                  <p className="text-[10px] text-[#888] mt-1">Check for any milestones that need a status update.</p>
                  <Link href="/team/milestone-update" className="text-[10px] text-[#b6332e] mt-2 inline-flex items-center hover:underline">
                    Update Now <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold text-[#eee] mb-4">Recent Chat</h2>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-xs text-[#444]">No recent messages</p>
              ) : recentMessages.map((msg) => (
                <div key={`${msg.channel_id}-${msg.created_at}`} className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-[#555] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#ddd] truncate">
                      <span className="font-bold">{msg.sender_name}:</span> &ldquo;{msg.content.slice(0, 50)}...&rdquo;
                    </p>
                    <p className="text-[10px] text-[#555]">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/chat" className="btn-ghost text-xs w-full justify-center mt-4">Open Chat Hub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
