'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface CalendarEvent {
  id: string;
  title: string;
  project: string;
  project_name: string;
  date: Date;
  status: string;
  is_client_visible: boolean;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MasterCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filter, setFilter] = useState<'all' | 'agency' | 'client'>('all');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMilestones = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('os_milestones')
      .select('id, name, status, end_date, is_client_visible, project_id, os_projects(name)')
      .not('end_date', 'is', null)
      .order('end_date');

    if (!error && data) {
      const mapped: CalendarEvent[] = data
        .filter((m: Record<string, unknown>) => m.end_date)
        .map((m: Record<string, unknown>) => {
          const project = m.os_projects as { name: string } | null;
          return {
            id: m.id as string,
            title: m.name as string,
            project: m.project_id as string,
            project_name: project?.name ?? 'Unknown Project',
            date: new Date(m.end_date as string),
            status: m.status as string,
            is_client_visible: m.is_client_visible as boolean,
          };
        });
      setEvents(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadMilestones(); }, [loadMilestones]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const filteredEvents = events.filter(e => {
    if (filter === 'agency') return !e.is_client_visible;
    if (filter === 'client') return e.is_client_visible;
    return true;
  });

  const eventsForDay = (day: number) =>
    filteredEvents.filter(e =>
      e.date.getDate() === day &&
      e.date.getMonth() === month &&
      e.date.getFullYear() === year
    );

  const totalVisible = filteredEvents.filter(e =>
    e.date.getMonth() === month && e.date.getFullYear() === year
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Agency Master Calendar</h1>
          <p className="text-xs text-[#555] mt-0.5">
            {MONTH_NAMES[month]} {year} · {loading ? '…' : `${totalVisible} milestone${totalVisible !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={goToday} className="btn-secondary"><CalIcon className="w-3.5 h-3.5" /> Today</button>
          <button onClick={loadMilestones} className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '↻'} Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[700px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] p-1">
              <button onClick={prevMonth} className="p-1 text-[#555] hover:text-[#eee] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-bold text-[#eee] px-4">{MONTH_NAMES[month]} {year}</span>
              <button onClick={nextMonth} className="p-1 text-[#555] hover:text-[#eee] transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] p-1">
              {(['month', 'week'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`text-xs px-3 py-1 rounded-md capitalize transition-colors ${view === v ? 'bg-[rgba(255,255,255,0.1)] text-[#eee]' : 'text-[#555] hover:text-[#888]'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[10px] text-[#555] font-semibold">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Approved</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#b6332e]" /> Overdue</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> In Progress</span>
            </div>
            <div className="h-4 w-px bg-[rgba(255,255,255,0.1)]" />
            <div className="flex gap-2">
              {(['all', 'agency', 'client'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-md capitalize transition-colors ${filter === f ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e]' : 'text-[#555] hover:text-[#888]'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#444]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading milestones...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
              {/* Day headers */}
              {DAY_NAMES.map(day => (
                <div key={day} className="bg-[#111] p-2 text-center text-[10px] font-bold text-[#555] tracking-widest uppercase">
                  {day}
                </div>
              ))}

              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#050505] min-h-[120px] p-2 opacity-50" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayEvents = eventsForDay(day);
                const todayCell = isToday(day);
                return (
                  <div key={day}
                    className={`bg-[#0a0a0a] min-h-[120px] p-2 hover:bg-[#111] transition-colors relative border-t border-[rgba(255,255,255,0.02)] ${todayCell ? 'bg-[rgba(182,51,46,0.03)]' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${todayCell ? 'bg-[#b6332e] text-white' : 'text-[#666]'}`}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1.5 mt-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div key={event.id}
                          className={`px-1.5 py-1 rounded text-[9px] truncate border-l-2 cursor-pointer transition-colors ${
                            event.status === 'approved' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20' :
                            event.status === 'in_progress' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30 hover:bg-[#3b82f6]/20' :
                            event.status === 'overdue' ? 'bg-[#b6332e]/10 text-[#b6332e] border-[#b6332e]/30 hover:bg-[#b6332e]/20' :
                            'bg-[#fff]/5 text-[#aaa] border-[#fff]/10 hover:bg-[#fff]/10'
                          }`}
                          title={`${event.project_name} — ${event.title}`}>
                          <span className="font-semibold block truncate leading-tight">{event.project_name}</span>
                          <span className="opacity-80 block truncate leading-tight">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-[#555] px-1.5">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
