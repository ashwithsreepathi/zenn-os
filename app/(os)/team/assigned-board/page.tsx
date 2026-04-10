'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockProjects, mockUsers } from '@/lib/mock-data';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AssignedBoard() {
  const { user, impersonating } = useAuth();

  // Get active user ID (impersonated or real)
  const activeUserId = impersonating
    ? mockUsers.find((u) => u.role === impersonating)?.id
    : user?.id;

  const myProjects = activeUserId
    ? mockProjects.filter((p) => p.assignedTeam.includes(activeUserId) && p.status === 'active')
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#eee]">My Assigned Board</h1>
        <p className="text-xs text-[#555] mt-0.5">Your active projects and pending milestones</p>
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
            myProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-6 glass-panel-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#eee]">{project.name}</h3>
                    <p className="text-xs text-[#666] mt-1">{project.clientName} · {project.type.toUpperCase()}</p>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                    project.healthStatus === 'red' ? 'bg-[#b6332e]/20 text-[#b6332e]' :
                    project.healthStatus === 'amber' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    'bg-[#10b981]/20 text-[#10b981]'
                  }`}>
                    {project.completionPercent}% Complete
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar mb-5">
                  <div
                    className={`progress-fill ${project.healthStatus === 'red' ? 'bg-[#b6332e]' : project.healthStatus === 'amber' ? '!bg-[#f59e0b]' : '!bg-[#10b981]'}`}
                    style={{ width: `${project.completionPercent}%` }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="section-label">My Milestones</p>
                  {project.milestones
                    .filter((m) => activeUserId && m.assignedTo.includes(activeUserId))
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#111]">
                        <div className="flex items-center gap-3">
                          {m.status === 'locked' ? (
                            <AlertTriangle className="w-4 h-4 text-[#555]" />
                          ) : m.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-[#10b981]" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#b6332e]" />
                          )}
                          <span className={`text-sm ${m.status === 'locked' ? 'text-[#555]' : 'text-[#ddd]'}`}>
                            {m.name}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {m.status === 'in_progress' && (
                            <Link href="/team/submission" className="btn-primary text-[10px] py-1 px-3">
                              Submit Proof
                            </Link>
                          )}
                          <Link href="/team/vault" className="btn-secondary text-[10px] py-1 px-3">
                            Vault
                          </Link>
                        </div>
                      </div>
                    ))}
                  {project.milestones.filter((m) => activeUserId && m.assignedTo.includes(activeUserId)).length === 0 && (
                    <p className="text-xs text-[#444] pl-1">No milestones directly assigned to you on this project.</p>
                  )}
                </div>
              </motion.div>
            ))
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
                  <p className="text-[10px] text-[#888] mt-1">Montax Frontend is past 5 days without a status update.</p>
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
              <div className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                <MessageSquare className="w-4 h-4 text-[#555] mt-0.5" />
                <div>
                  <p className="text-xs text-[#ddd]"><span className="font-bold">Ashwith:</span> &ldquo;Check the new color grade...&rdquo;</p>
                  <p className="text-[10px] text-[#555]">BFB Campaign · 2 hrs ago</p>
                </div>
              </div>
            </div>
            <Link href="/chat" className="btn-ghost text-xs w-full justify-center mt-4">Open Chat Hub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
