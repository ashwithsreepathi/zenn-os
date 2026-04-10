'use client';

import { FileText } from 'lucide-react';

export default function TeamLegal() {
  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-[#eee]">Legal & IP</h1>
      <div className="glass-panel rounded-2xl p-6 h-[400px] flex items-center justify-center border-dashed">
         <div className="text-center">
            <FileText className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <p className="text-[#888] font-bold">Standard NDAs and IP Assignment Agreements</p>
            <p className="text-xs text-[#555] mt-1">Files assigned to you will appear here.</p>
         </div>
      </div>
    </div>
  );
}
