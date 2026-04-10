'use client';

import { DownloadCloud, ExternalLink, Filter } from 'lucide-react';

export default function ClientAssetVault() {
  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#eee]">Final Deliverables Vault</h1>
        <button className="btn-secondary text-xs"><ExternalLink className="w-3.5 h-3.5" /> Brand Guidelines</button>
      </div>

      <div className="glass-panel rounded-2xl p-6 h-[500px] flex items-center justify-center border-dashed">
         <div className="text-center">
            <DownloadCloud className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <p className="text-[#888] font-bold">No final deliverables available yet.</p>
            <p className="text-xs text-[#555] mt-1">Assets will appear here once Phase 1 is approved.</p>
         </div>
      </div>
    </div>
  );
}
