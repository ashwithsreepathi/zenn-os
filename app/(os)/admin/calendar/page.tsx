'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, ZoomIn } from 'lucide-react';
import { mockProjects, mockUsers } from '@/lib/mock-data';

export default function MasterCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-10'));
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filter, setFilter] = useState<'all' | 'agency' | 'client'>('all');

  // Simple mock events generation based on milestones
  const events = mockProjects.flatMap(p => 
    p.milestones.map(m => ({
      id: m.id,
      title: m.name,
      project: p.name,
      date: new Date(m.endDate),
      status: m.status,
      team: m.assignedTo.map(id => mockUsers.find(u => u.id === id)?.name).filter(Boolean),
      isClientVisible: m.isClientVisible
    }))
  ).filter(e => {
    if (filter === 'agency') return !e.isClientVisible;
    if (filter === 'client') return e.isClientVisible;
    return true;
  });

  // Basic grid rendering for April 2026
  const daysInMonth = Array.from({ length: 30 }, (_, i) => new Date(2026, 3, i + 1));
  const firstDay = 3; // Wednesday

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Agency Master Calendar</h1>
          <p className="text-xs text-[#555] mt-0.5">April 2026 · {events.length} upcoming milestones</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="btn-secondary"><CalIcon className="w-3.5 h-3.5" /> Sync external</button>
          <button className="btn-primary"><ZoomIn className="w-3.5 h-3.5" /> Timeline View</button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[700px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] p-1">
              <button className="p-1 text-[#555] hover:text-[#eee] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-bold text-[#eee] px-4">April 2026</span>
              <button className="p-1 text-[#555] hover:text-[#eee] transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] p-1">
              {(['month', 'week'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`text-xs px-3 py-1 rounded-md capitalize transition-colors ${view === v ? 'bg-[rgba(255,255,255,0.1)] text-[#eee]' : 'text-[#555] hover:text-[#888]'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[10px] text-[#555] font-semibold">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Delivered</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#b6332e]" /> Urgent</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> In Progress</span>
            </div>
            <div className="h-4 w-px bg-[rgba(255,255,255,0.1)]" />
            <div className="flex gap-2">
              {(['all', 'agency', 'client'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-md capitalize transition-colors ${filter === f ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e]' : 'text-[#555] hover:text-[#888]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a]">
          <div className="grid grid-cols-7 gap-px bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
            {/* Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-[#111] p-2 text-center text-[10px] font-bold text-[#555] tracking-widest uppercase">
                {day}
              </div>
            ))}
            
            {/* Empty starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-[#050505] min-h-[120px] p-2 opacity-50" />
            ))}

            {/* Days */}
            {daysInMonth.map(date => {
              const dayEvents = events.filter(e => e.date.getDate() === date.getDate());
              const isToday = date.getDate() === 10; // Mock today

              return (
                <div key={date.toISOString()} className={`bg-[#0a0a0a] min-h-[120px] p-2 hover:bg-[#111] transition-colors relative border-t border-[rgba(255,255,255,0.02)] ${isToday ? 'bg-[rgba(182,51,46,0.03)]' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#b6332e] text-white' : 'text-[#666]'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mt-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`px-1.5 py-1 rounded text-[9px] truncate border-l-2 cursor-pointer transition-colors ${
                          event.status === 'approved' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20' :
                          event.status === 'in_progress' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30 hover:bg-[#3b82f6]/20' :
                          event.status === 'overdue' ? 'bg-[#b6332e]/10 text-[#b6332e] border-[#b6332e]/30 hover:bg-[#b6332e]/20' :
                          'bg-[#fff]/5 text-[#aaa] border-[#fff]/10 hover:bg-[#fff]/10'
                        }`}
                        title={`${event.project} - ${event.title}`}
                      >
                        <span className="font-semibold block truncate leading-tight">{event.project}</span>
                        <span className="opacity-80 block truncate leading-tight">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
