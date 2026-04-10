'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Send, ChevronRight, CheckCircle, Clock, Zap } from 'lucide-react';
import { mockNudges, mockUsers, mockProjects } from '@/lib/mock-data';
import type { Nudge } from '@/lib/types';

const LEVEL_CONFIG = {
  1: { label: 'Level 1 — Friendly', color: '#10b981', desc: 'Soft check-in. No pressure.' },
  2: { label: 'Level 2 — Firm', color: '#f59e0b', desc: 'Escalated. Mentions deadline.' },
  3: { label: 'Level 3 — Escalation', color: '#b6332e', desc: 'Final warning. CC admin.' },
} as const;

const TRIGGER_LABELS: Record<string, string> = {
  talent_reminder: '🎯 Talent Reminder',
  client_approval: '📬 Client Approval Chase',
  payment_chaser: '💳 Payment Chaser',
  custom: '✍️ Custom',
};

function NudgeCard({ nudge }: { nudge: Nudge }) {
  const level = LEVEL_CONFIG[nudge.level];
  const recipient = mockUsers.find((u) => u.id === nudge.recipientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-5 glass-panel-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-xs font-bold text-[#888]">
            {recipient?.name.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-sm font-bold text-[#eee]">{nudge.recipientName}</p>
            <p className="text-[10px] text-[#555]">{nudge.projectName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${level.color}20`, color: level.color }}>
            {level.label}
          </span>
          <span className="text-[10px] text-[#444] capitalize">{TRIGGER_LABELS[nudge.triggerType]}</span>
        </div>
      </div>

      <div className="bg-[#111] rounded-xl px-4 py-3 mb-4 border border-[rgba(255,255,255,0.04)]">
        <p className="text-xs text-[#ccc] leading-relaxed italic">&ldquo;{nudge.message}&rdquo;</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {nudge.status === 'sent' && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />}
          {nudge.status === 'delivered' && <CheckCircle className="w-3 h-3 text-[#10b981]" />}
          {nudge.status === 'scheduled' && <Clock className="w-3 h-3 text-[#555]" />}
          <span className="text-[10px] text-[#555] capitalize">{nudge.status}</span>
          {nudge.sentAt && (
            <span className="text-[9px] text-[#333] font-mono ml-2">
              {new Date(nudge.sentAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {nudge.status === 'scheduled' && (
          <button className="btn-primary text-[10px] py-1 px-3">
            <Send className="w-3 h-3" /> Send Now
          </button>
        )}
        {(nudge.status === 'sent') && nudge.level < 3 && (
          <button className="text-[10px] text-[#f59e0b] hover:text-[#fbbf24] transition-colors font-bold flex items-center gap-1">
            Escalate <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function NudgeLogic() {
  const [composing, setComposing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [triggerType, setTriggerType] = useState<'talent_reminder' | 'client_approval' | 'payment_chaser' | 'custom'>('talent_reminder');
  const [customMessage, setCustomMessage] = useState('');

  const pendingNudges = mockNudges.filter((n) => n.status === 'sent' || n.status === 'scheduled');
  const deliveredNudges = mockNudges.filter((n) => n.status === 'delivered' || n.status === 'responded');

  const autoMessages: Record<string, Record<number, string>> = {
    talent_reminder: {
      1: "Hey {name}, just checking in on your progress for {project}. Let us know how it's going!",
      2: "Hi {name}, the {project} milestone is approaching its deadline. Please update your status today.",
      3: "URGENT: {name}, {project} is now blocking client delivery. Immediate response required.",
    },
    client_approval: {
      1: "Hi {name}, your deliverable for {project} is ready for your review whenever you have a moment.",
      2: "Hey {name}, we're waiting on your approval for {project} to proceed. Please review when possible.",
      3: "{name}, this is a final reminder — {project} approval is critical to maintaining your timeline.",
    },
    payment_chaser: {
      1: "Hi {name}, just a friendly reminder that an invoice for {project} is due.",
      2: "{name}, your payment for {project} is overdue. Please arrange settlement to avoid delays.",
      3: "URGENT {name}: {project} invoice is severely overdue. Please contact us immediately.",
    },
  };

  const previewMessage = autoMessages[triggerType]?.[selectedLevel]
    ?.replace('{name}', mockUsers.find((u) => u.id === selectedRecipient)?.name ?? '[Recipient]')
    ?.replace('{project}', mockProjects.find((p) => p.id === selectedProject)?.name ?? '[Project]');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Nudge Logic Engine</h1>
          <p className="text-xs text-[#555] mt-0.5">Automated escalation sequences — 3-tier friction system</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 text-xs text-[#f59e0b] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg px-3 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {pendingNudges.length} pending response{pendingNudges.length !== 1 ? 's' : ''}
          </div>
          <button onClick={() => setComposing(true)} className="btn-primary text-xs">
            <Zap className="w-3.5 h-3.5" /> New Nudge
          </button>
        </div>
      </div>

      {/* Escalation Tiers Info */}
      <div className="grid grid-cols-3 gap-4">
        {([1, 2, 3] as const).map((lvl) => {
          const cfg = LEVEL_CONFIG[lvl];
          const count = mockNudges.filter((n) => n.level === lvl).length;
          return (
            <div key={lvl} className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-lg font-black text-[#eee]">{count}</span>
              </div>
              <p className="text-[10px] text-[#555]">{cfg.desc}</p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${(count / mockNudges.length) * 100}%`, background: cfg.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Nudges */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#eee] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            Active Nudges
          </h2>
          {pendingNudges.map((n) => <NudgeCard key={n.id} nudge={n} />)}
          {pendingNudges.length === 0 && (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
              <p className="text-sm text-[#888]">All caught up! No pending nudges.</p>
            </div>
          )}
        </div>

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#eee]">Delivered History</h2>
          {deliveredNudges.map((n) => <NudgeCard key={n.id} nudge={n} />)}
          {deliveredNudges.length === 0 && (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <p className="text-sm text-[#555]">No delivered nudges yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Drawer */}
      <AnimatePresence>
        {composing && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setComposing(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="w-[480px] bg-[#050505] border-l border-[rgba(255,255,255,0.06)] p-6 overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#eee]">Compose Nudge</h3>
                <button onClick={() => setComposing(false)} className="text-[#444] hover:text-white text-xl">×</button>
              </div>

              <div>
                <label className="section-label mb-2 block">Escalation Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((lvl) => {
                    const cfg = LEVEL_CONFIG[lvl];
                    return (
                      <button
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`p-3 rounded-xl text-center border transition-all ${selectedLevel === lvl ? 'border-current' : 'border-[rgba(255,255,255,0.06)] opacity-50'}`}
                        style={{ color: cfg.color, background: selectedLevel === lvl ? `${cfg.color}15` : 'transparent' }}
                      >
                        <p className="font-black text-lg">L{lvl}</p>
                        <p className="text-[9px] mt-0.5">{lvl === 1 ? 'Friendly' : lvl === 2 ? 'Firm' : 'Escalation'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="section-label mb-2 block">Trigger Type</label>
                <select className="os-input cursor-pointer" value={triggerType} onChange={(e) => setTriggerType(e.target.value as any)}>
                  {Object.entries(TRIGGER_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="section-label mb-2 block">Recipient</label>
                <select className="os-input cursor-pointer" value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)}>
                  <option value="">Select recipient...</option>
                  {mockUsers.filter((u) => u.role !== 'admin').map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="section-label mb-2 block">Related Project</label>
                <select className="os-input cursor-pointer" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                  <option value="">Select project...</option>
                  {mockProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {previewMessage && (
                <div>
                  <label className="section-label mb-2 block">Message Preview</label>
                  <div className="bg-[#111] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3">
                    <p className="text-xs text-[#ccc] leading-relaxed italic">&ldquo;{previewMessage}&rdquo;</p>
                  </div>
                </div>
              )}

              {triggerType === 'custom' && (
                <div>
                  <label className="section-label mb-2 block">Custom Message</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="os-input resize-none"
                    rows={4}
                    placeholder="Write your custom message..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setComposing(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button
                  onClick={() => setComposing(false)}
                  disabled={!selectedRecipient || !selectedProject}
                  className="btn-primary flex-1 justify-center disabled:opacity-40"
                >
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
