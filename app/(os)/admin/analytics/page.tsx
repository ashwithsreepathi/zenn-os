'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { TrendingUp, Users, FolderOpen, DollarSign, Download } from 'lucide-react';

const PIE_COLORS = ['#b6332e', '#3b82f6', '#8b5cf6', '#555', '#10b981', '#f59e0b'];

export default function Analytics() {
  const [range, setRange] = useState<'30d' | '90d' | 'ytd'>('ytd');
  const [revenueByType, setRevenueByType] = useState<{ type: string; value: number }[]>([]);
  const [leadSourceData, setLeadSourceData] = useState<{ source: string; count: number; color: string }[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<{ member: string; reliability: number; load: number }[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<{ month: string; revenue: number; profit: number }[]>([]);
  const [kpis, setKpis] = useState({ revenue: 0, clients: 0, activeProjects: 0, margin: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [txRes, projRes, leadRes, userRes] = await Promise.all([
        supabase.from('os_transactions').select('*'),
        supabase.from('os_projects').select('*'),
        supabase.from('os_leads').select('*'),
        supabase.from('os_users').select('id,name,role,reliability_score,current_load').in('role', ['affiliate', 'employee']),
      ]);

      const txs = txRes.data ?? [];
      const projects = projRes.data ?? [];
      const leads = leadRes.data ?? [];
      const users = userRes.data ?? [];

      const incoming = txs.filter((t: any) => t.type === 'incoming');
      const outgoing = txs.filter((t: any) => t.type === 'outgoing');
      const totalRevenue = incoming.reduce((s: number, t: any) => s + Number(t.amount), 0);
      const totalExpenses = outgoing.reduce((s: number, t: any) => s + Number(t.amount), 0);
      const clients = [...new Set(projects.map((p: any) => p.client_id))].length;
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const margin = totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;

      setKpis({ revenue: totalRevenue, clients, activeProjects, margin });

      // Revenue by project type
      const typeMap: Record<string, number> = {};
      for (const p of projects as any[]) {
        typeMap[p.type] = (typeMap[p.type] ?? 0) + Number(p.total_value ?? 0);
      }
      const TYPE_LABELS: Record<string, string> = { web: 'Web', video: 'Video', branding: 'Brand', social: 'Social', full_brand: 'Full Brand' };
      setRevenueByType(Object.entries(typeMap).map(([type, value]) => ({ type: TYPE_LABELS[type] ?? type, value })));

      // Lead sources
      const srcMap: Record<string, number> = {};
      for (const l of leads as any[]) {
        srcMap[l.source ?? 'direct'] = (srcMap[l.source ?? 'direct'] ?? 0) + 1;
      }
      setLeadSourceData(Object.entries(srcMap).map(([source, count], i) => ({
        source: source.charAt(0).toUpperCase() + source.slice(1),
        count,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })));

      // Team performance
      setTeamPerformance(users.map((u: any) => ({
        member: u.name.split(' ')[0],
        reliability: u.reliability_score ?? 80,
        load: u.current_load ?? 1,
      })));

      // Revenue trend per month
      const monthMap: Record<string, { revenue: number; expenses: number }> = {};
      for (const t of txs as any[]) {
        const m = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!monthMap[m]) monthMap[m] = { revenue: 0, expenses: 0 };
        if (t.type === 'incoming') monthMap[m].revenue += Number(t.amount);
        else monthMap[m].expenses += Number(t.amount);
      }
      setRevenueTrend(Object.entries(monthMap).map(([month, v]) => ({
        month,
        revenue: v.revenue,
        profit: v.revenue - v.expenses,
      })));

      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `$${(kpis.revenue / 1000).toFixed(1)}k`, icon: DollarSign, color: '#10b981', change: '+18.4%' },
    { label: 'Active Clients', value: String(kpis.clients), icon: Users, color: '#3b82f6', change: '+2 this Q' },
    { label: 'Active Projects', value: String(kpis.activeProjects), icon: FolderOpen, color: '#b6332e', change: 'On track' },
    { label: 'Net Margin', value: `${kpis.margin}%`, icon: TrendingUp, color: '#f59e0b', change: '+5.2%' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Analytics</h1>
          <p className="text-xs text-[#555] mt-0.5">Business performance · live data</p>
        </div>
        <div className="flex items-center gap-2">
          {(['30d', '90d', 'ytd'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${range === r ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
              {r.toUpperCase()}
            </button>
          ))}
          <button className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-panel rounded-2xl h-24 animate-pulse" />)
          : statCards.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-panel rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="section-label">{s.label}</p>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#eee]">{s.value}</p>
                <p className="text-[10px] text-[#555] mt-1">{s.change}</p>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#eee] mb-4">Revenue & Profit Trend</h2>
          {revenueTrend.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-[#333]">No transaction data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="month" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
                  formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 justify-center mt-2">
            <span className="text-[10px] text-[#555]"><span className="text-[#10b981]">●</span> Revenue</span>
            <span className="text-[10px] text-[#555]"><span className="text-[#3b82f6]">- -</span> Profit</span>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#eee] mb-4">Lead Sources</h2>
          {leadSourceData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#333]">No leads yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={leadSourceData} dataKey="count" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3}>
                    {leadSourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {leadSourceData.map((s) => (
                  <div key={s.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-[10px] text-[#888]">{s.source}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#eee]">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Project Type */}
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#eee] mb-4">Revenue by Service Type</h2>
          {revenueByType.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#333]">No project data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueByType} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="type" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
                  formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, '']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {revenueByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Team Performance */}
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#eee] mb-4">Team Reliability</h2>
          <div className="space-y-4">
            {teamPerformance.map((m) => (
              <div key={m.member}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#eee]">{m.member}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#555]">Load: {m.load}/8</span>
                    <span className={`text-[10px] font-bold ${m.reliability >= 90 ? 'text-[#10b981]' : m.reliability >= 75 ? 'text-[#f59e0b]' : 'text-[#b6332e]'}`}>
                      {m.reliability}%
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"
                    style={{
                      width: `${m.reliability}%`,
                      background: m.reliability >= 90 ? '#10b981' : m.reliability >= 75 ? '#f59e0b' : '#b6332e'
                    }} />
                </div>
              </div>
            ))}
            {teamPerformance.length === 0 && <p className="text-xs text-[#333]">No team members yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
