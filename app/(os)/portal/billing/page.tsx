/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { Receipt, DollarSign, DownloadCloud } from 'lucide-react';

export default function ClientBilling() {
  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-[#eee]">Billing & Invoices</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="kpi-card border border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.05)]">
           <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-[#b6332e]" /><p className="section-label">Amount Due</p></div>
           <p className="text-3xl font-black text-[#eee]">$12,500</p>
           <button className="btn-primary mt-4 w-full justify-center">Pay Balance Securely</button>
        </div>
        
        <div className="md:col-span-2 glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#eee] mb-4">Invoice History</h2>
          <div className="space-y-2">
            {[
              { id: 'INV-2026-04A', desc: 'Phase 2 Deposit', amount: '$12,500', status: 'pending', date: 'Apr 02, 2026' },
              { id: 'INV-2026-03B', desc: 'Phase 1 Deposit', amount: '$10,000', status: 'paid', date: 'Mar 15, 2026' },
            ].map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#111]">
                 <div>
                   <p className="text-xs font-bold text-[#eee]">{inv.id} — {inv.desc}</p>
                   <p className="text-[10px] text-[#555]">{inv.date}</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <p className="text-sm font-bold text-[#eee]">{inv.amount}</p>
                   <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${inv.status === 'paid' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#b6332e]/20 text-[#b6332e]'}`}>{inv.status}</span>
                   <button className="text-[#555] hover:text-[#eee]"><DownloadCloud className="w-4 h-4" /></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
