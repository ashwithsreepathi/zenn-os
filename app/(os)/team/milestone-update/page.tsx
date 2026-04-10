'use client';

import { Activity } from 'lucide-react';

export default function MilestoneUpdate() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-[#eee]">Milestone Status Update</h1>
      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block">Project & Milestone</label>
            <select className="os-input cursor-pointer">
               <option>Select active assignment...</option>
               <option>BFB Campaign - Rendering Phase</option>
            </select>
          </div>
          <div>
            <label className="section-label mb-2 block">Current Status</label>
            <div className="flex gap-2">
              {['On Track', 'At Risk', 'Blocked', 'Ready for Review'].map(s => (
                <button key={s} className="px-3 py-1.5 rounded border border-[rgba(255,255,255,0.06)] text-xs text-[#888] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
             <label className="section-label mb-2 block">Update Details</label>
             <textarea className="os-input resize-none" rows={4} placeholder="What did you accomplish today? Any blockers?" />
          </div>
          <button className="btn-primary w-full justify-center"><Activity className="w-4 h-4 mr-1" /> Broadcast Update</button>
        </div>
      </div>
    </div>
  );
}
