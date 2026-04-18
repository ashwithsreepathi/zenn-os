/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { UploadCloud, File, AlertTriangle } from 'lucide-react';

export default function ProofSubmission() {
  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#eee]">Proof Submission</h1>
        <p className="text-xs text-[#555] mt-0.5">Submit deliverables for internal or client review</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-dashed border-[#b6332e]/50 hover:bg-[rgba(182,51,46,0.02)] transition-colors cursor-pointer text-center">
        <UploadCloud className="w-10 h-10 text-[#b6332e] mx-auto mb-3" />
        <p className="text-sm font-bold text-[#eee]">Click or drag to attach proof file</p>
        <p className="text-xs text-[#555] mt-1">Supports MP4, MOV, PDF, JPG, PNG (Max 5GB)</p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="section-label mb-2 block">Link to Project Milestone</label>
            <select className="os-input cursor-pointer">
              <option>Select a milestone...</option>
              <option>BFB Campaign - V1 Draft</option>
              <option>Montax - Hero Export</option>
            </select>
          </div>
          <div>
             <label className="section-label mb-2 block">Version Notes</label>
             <textarea className="os-input resize-none" rows={4} placeholder="e.g. Addressed color grading contrast issues..." />
          </div>
          <div className="flex items-center gap-2 p-3 bg-[rgba(182,51,46,0.05)] border border-[rgba(182,51,46,0.2)] rounded-xl">
             <input type="checkbox" className="accent-[#b6332e] w-4 h-4 cursor-pointer" />
             <span className="text-xs text-[#eee] font-bold">Require Lead PM Approval before client release?</span>
          </div>
          <button className="btn-primary mt-4 w-full justify-center">Submit Deliverable</button>
        </div>
      </div>
    </div>
  );
}
