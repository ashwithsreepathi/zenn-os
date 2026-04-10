'use client';

import { Calendar as CalendarIcon } from 'lucide-react';

export default function TeamCalendar() {
  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-[#eee]">My Calendar</h1>
      <div className="glass-panel rounded-2xl p-6 h-[400px] flex items-center justify-center border-dashed">
         <div className="text-center">
            <CalendarIcon className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <p className="text-[#888] font-bold">Your personal milestone calendar</p>
            <p className="text-xs text-[#555] mt-1">Schedules will appear here once projects are assigned.</p>
         </div>
      </div>
    </div>
  );
}
