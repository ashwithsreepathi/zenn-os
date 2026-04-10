'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, AlertTriangle, Plus, Minus, Check, Lock } from 'lucide-react';
import { mockProjects, mockUsers } from '@/lib/mock-data';

const AGENCY_FLOOR = 0.30; // 30% minimum agency margin

export default function PayoutAllocator() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [locked, setLocked] = useState(false);

  const team = mockUsers.filter(u => selectedProject.assignedTeam.includes(u.id) && u.id !== 'usr_admin_01');
  const totalValue = selectedProject.totalValue;
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);
  const agencyMargin = totalValue - totalAllocated;
  const marginPercent = agencyMargin / totalValue;
  const isBelowFloor = marginPercent < AGENCY_FLOOR;

  const chartData = [
    { name: 'Agency', value: Math.max(agencyMargin, 0) },
    ...team.map(u => ({ name: u.name, value: allocations[u.id] ?? 0 })).filter(d => d.value > 0),
  ];
  const CHART_COLORS = ['#b6332e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const equitableSplit = () => {
    const perPerson = Math.floor((totalValue * (1 - AGENCY_FLOOR)) / team.length);
    const newAllocs: Record<string, number> = {};
    team.forEach(u => { newAllocs[u.id] = perPerson; });
    setAllocations(newAllocs);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Payout Allocator</h1>
          <p className="text-xs text-[#555] mt-0.5">Profit-first revenue distribution</p>
        </div>
        <div className="flex gap-2">
          <button onClick={equitableSplit} className="btn-secondary text-xs">
            <span className="text-[#b6332e]">÷</span> Equitable Split
          </button>
          <button
            onClick={() => !isBelowFloor && setLocked(!locked)}
            disabled={isBelowFloor}
            className={`btn-primary text-xs ${isBelowFloor ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {locked ? <><Check className="w-3.5 h-3.5" /> Confirmed</> : <><Lock className="w-3.5 h-3.5" /> Confirm to Owed Ledger</>}
          </button>
        </div>
      </div>

      {/* Project selector */}
      <div className="flex gap-3">
        {mockProjects.filter(p => p.status === 'active').map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedProject(p); setAllocations({}); setLocked(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              selectedProject.id === p.id
                ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border-[rgba(182,51,46,0.3)]'
                : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut chart + margin */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-6">
            <p className="section-label mb-4">Revenue Distribution</p>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData.filter(d => d.value > 0)} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} strokeWidth={0}>
                    {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-[#555]">Total</p>
                <p className="text-lg font-black text-[#eee]">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Margin Health */}
          <div className={`glass-panel rounded-2xl p-4 ${isBelowFloor ? 'border-[#b6332e] border' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Agency Margin</p>
              {isBelowFloor && <AlertTriangle className="w-3.5 h-3.5 text-[#b6332e]" />}
            </div>
            <p className={`text-2xl font-black ${isBelowFloor ? 'text-[#b6332e]' : 'text-[#10b981]'}`}>
              ${Math.max(agencyMargin, 0).toLocaleString()}
              <span className="text-sm ml-1">({(marginPercent * 100).toFixed(0)}%)</span>
            </p>
            <div className="progress-bar mt-3">
              <div
                className={`progress-fill ${isBelowFloor ? 'bg-[#b6332e]' : '!bg-[#10b981]'} ${isBelowFloor ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.max(marginPercent * 100, 0)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#444] mt-1">Floor: {(AGENCY_FLOOR * 100).toFixed(0)}% minimum</p>
            {isBelowFloor && (
              <p className="text-xs text-[#b6332e] mt-2">⚠ Admin Override Code required to confirm below floor.</p>
            )}
          </div>
        </div>

        {/* Right: Allocation rows */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`glass-panel rounded-2xl p-6 ${locked ? 'state-locked' : ''}`}>
            <p className="section-label mb-4">Workforce Allocations</p>
            <div className="space-y-3">
              {team.map((member, i) => {
                const current = allocations[member.id] ?? 0;
                return (
                  <div key={member.id} className="glass-panel-elevated rounded-xl p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#888]">{member.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#ddd]">{member.name}</p>
                      <p className="text-[10px] text-[#555]">{member.title} · Load: {member.currentLoad} projects</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAllocations(p => ({ ...p, [member.id]: Math.max((p[member.id] ?? 0) - 250, 0) }))}
                        className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#555] hover:text-white transition-colors"
                      ><Minus className="w-3 h-3" /></button>
                      <input
                        type="number"
                        value={current}
                        min={0}
                        step={250}
                        onChange={e => setAllocations(p => ({ ...p, [member.id]: Number(e.target.value) }))}
                        className="w-24 text-center os-input text-sm font-bold"
                        style={{ fontSize: 13 }}
                      />
                      <button
                        onClick={() => setAllocations(p => ({ ...p, [member.id]: (p[member.id] ?? 0) + 250 }))}
                        className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#555] hover:text-white transition-colors"
                      ><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-xs text-[#555]">{totalValue > 0 ? ((current / totalValue) * 100).toFixed(0) : 0}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="glass-panel rounded-2xl p-5">
            <p className="section-label mb-2">Internal Notes & Adjustments</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Added $200 bonus for 24-hour turnaround..."
              rows={3}
              className="os-input resize-none text-xs"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setNotes(n => n + ' +$200 bonus — expedited delivery')} className="text-[10px] px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)] text-[#10b981] hover:bg-[rgba(16,185,129,0.12)] transition-colors">+ Bonus</button>
              <button onClick={() => setNotes(n => n + ' -$100 penalty — missed deadline')} className="text-[10px] px-3 py-1.5 rounded-lg bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.15)] text-[#b6332e] hover:bg-[rgba(182,51,46,0.12)] transition-colors">- Penalty</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
