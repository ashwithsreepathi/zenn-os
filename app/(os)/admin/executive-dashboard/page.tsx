'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Folder, AlertTriangle,
  CheckCircle, Clock, Activity, BarChart2, Target, Zap,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import Link from 'next/link';

interface KPICard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface ActivityRow {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  detail: string;
  project_name: string | null;
  category: string;
  is_red_flag: boolean;
  created_at: string;
}

interface LeadRow {
  id: string;
  contact_name: string;
  company_name: string | null;
  project_type: string | null;
  estimated_budget: number | null;
  stage: string;
  temperature: string;
  score: number;
}

interface ProjectRow {
  id: string;
  name: string;
  client_name: string;
  status: string;
  health_status: string;
  completion_percent: number;
  total_value: number;
  paid_to_date: number;
  end_date: string;
}

const STAGE_COLORS: Record<string, string> = {
  new: '#555', qualification: '#3b82f6', estimate_sent: '#f59e0b',
  negotiation: '#10b981', converted: '#10b981', lost: '#b6332e',
};
const TEMP_LABELS: Record<string, string> = { hot: '🔥', warm: '☀️', cold: '🧊' };

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<{ month: string; revenue: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [txRes, projRes, leadRes, actRes] = await Promise.all([
        supabase.from('os_transactions').select('*').order('date', { ascending: false }),
        supabase.from('os_projects').select('*').order('created_at', { ascending: false }),
        supabase.from('os_leads').select('*').order('created_at', { ascending: false }),
        supabase.from('os_activity').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const transactions = txRes.data ?? [];
      const projectList = projRes.data ?? [];
      const leadList = leadRes.data ?? [];
      const activityList = actRes.data ?? [];

      // Compute KPIs
      const incoming = transactions.filter((t: any) => t.type === 'incoming');
      const outgoing = transactions.filter((t: any) => t.type === 'outgoing');
      const totalRevenue = incoming.reduce((s: number, t: any) => s + Number(t.amount), 0);
      const totalExpenses = outgoing.reduce((s: number, t: any) => s + Number(t.amount), 0);
      const activeProjects = projectList.filter((p: any) => p.status === 'active').length;
      const pipelineValue = leadList.reduce((s: number, l: any) => s + Number(l.estimated_budget ?? 0), 0);

      setKpis([
        { label: 'Total Revenue (YTD)', value: `$${(totalRevenue / 1000).toFixed(1)}k`, change: 18.4, icon: DollarSign, color: '#10b981' },
        { label: 'Net Profit Margin', value: `${totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0}%`, change: 5.2, icon: TrendingUp, color: '#3b82f6' },
        { label: 'Active Projects', value: String(activeProjects), change: 0, icon: Folder, color: '#b6332e' },
        { label: 'Pipeline Value', value: `$${(pipelineValue / 1000).toFixed(0)}k`, change: 12.1, icon: Target, color: '#f59e0b' },
      ]);

      // Revenue trend — group by month
      const monthMap: Record<string, { revenue: number; expenses: number }> = {};
      for (const t of transactions as any[]) {
        const m = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!monthMap[m]) monthMap[m] = { revenue: 0, expenses: 0 };
        if (t.type === 'incoming') monthMap[m].revenue += Number(t.amount);
        else monthMap[m].expenses += Number(t.amount);
      }
      setRevenueTrend(Object.entries(monthMap).map(([month, v]) => ({ month, ...v })));
      setProjects(projectList as ProjectRow[]);
      setLeads(leadList as LeadRow[]);
      setActivity(activityList as ActivityRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const redFlags = activity.filter((a) => a.is_red_flag);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Executive Dashboard</h1>
          <p className="text-xs text-[#555] mt-0.5">Live business intelligence · updated just now</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[10px] text-[#444]">LIVE</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse h-24" />
            ))
          : kpis.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-label">{kpi.label}</p>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                    <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#eee]">{kpi.value}</p>
                {kpi.change !== 0 && (
                  <p className={`text-[10px] mt-1 flex items-center gap-1 ${kpi.change > 0 ? 'text-[#10b981]' : 'text-[#b6332e]'}`}>
                    {kpi.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(kpi.change)}% vs last period
                  </p>
                )}
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#eee]">Revenue vs Expenses</h2>
            <BarChart2 className="w-4 h-4 text-[#444]" />
          </div>
          {revenueTrend.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#333]">No transaction data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueTrend} barCategoryGap="30%">
                <XAxis dataKey="month" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
                  formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#b6332e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2 justify-center">
            <span className="text-[10px] text-[#555]"><span className="text-[#10b981]">●</span> Revenue</span>
            <span className="text-[10px] text-[#555]"><span className="text-[#b6332e]">●</span> Expenses</span>
          </div>
        </div>

        {/* Red Flags */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#eee]">Red Flags</h2>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${redFlags.length > 0 ? 'bg-[#b6332e] text-white' : 'bg-[#111] text-[#444]'}`}>
              {redFlags.length}
            </span>
          </div>
          {redFlags.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-2">
              <CheckCircle className="w-8 h-8 text-[#10b981] opacity-40" />
              <p className="text-xs text-[#444]">No red flags</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redFlags.map((a) => (
                <div key={a.id} className="p-3 rounded-xl border border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.06)]">
                  <p className="text-[10px] font-bold text-[#b6332e]">{a.action}</p>
                  <p className="text-[10px] text-[#888] mt-1">{a.detail}</p>
                  <p className="text-[9px] text-[#555] mt-1">{a.user_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#eee]">Active Projects</h2>
            <Link href="/admin/projects" className="text-[10px] text-[#b6332e] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {projects.filter((p) => p.status === 'active').slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.health_status === 'green' ? 'bg-[#10b981]' : p.health_status === 'amber' ? 'bg-[#f59e0b]' : 'bg-[#b6332e]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#eee] truncate">{p.name}</p>
                  <div className="progress-bar mt-1">
                    <div className="progress-fill" style={{ width: `${p.completion_percent}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-[#555] flex-shrink-0">{p.completion_percent}%</span>
              </div>
            ))}
            {projects.filter((p) => p.status === 'active').length === 0 && (
              <p className="text-xs text-[#333]">No active projects</p>
            )}
          </div>
        </div>

        {/* Lead Pipeline */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#eee]">Lead Pipeline</h2>
            <Link href="/admin/projects" className="text-[10px] text-[#b6332e] hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <span className="text-sm">{TEMP_LABELS[lead.temperature] ?? '❓'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#eee] truncate">{lead.contact_name}</p>
                  <p className="text-[10px] text-[#555] truncate">{lead.company_name ?? lead.project_type}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-[#555]">${((lead.estimated_budget ?? 0) / 1000).toFixed(0)}k</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full capitalize"
                    style={{ color: STAGE_COLORS[lead.stage] ?? '#555', background: `${STAGE_COLORS[lead.stage] ?? '#555'}15` }}>
                    {lead.stage.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-xs text-[#333]">No leads yet</p>}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#eee]">System Activity</h2>
          <Activity className="w-4 h-4 text-[#444]" />
        </div>
        <div className="space-y-2">
          {activity.map((a) => (
            <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border ${a.is_red_flag ? 'border-[rgba(182,51,46,0.2)] bg-[rgba(182,51,46,0.04)]' : 'border-transparent hover:bg-[rgba(255,255,255,0.02)]'} transition-colors`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black ${a.is_red_flag ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e]' : 'bg-[rgba(255,255,255,0.05)] text-[#555]'}`}>
                {(a.user_name || 'System').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#ccc]">
                  <span className="font-bold text-[#eee]">{a.user_name || 'System'}</span>{' '}
                  {a.action}
                  {a.project_name && <span className="text-[#555]"> · {a.project_name}</span>}
                </p>
                {a.detail && <p className="text-[10px] text-[#555] mt-0.5 truncate">{a.detail}</p>}
              </div>
              <span className="text-[9px] text-[#444] flex-shrink-0">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {activity.length === 0 && <p className="text-xs text-[#333]">No activity yet</p>}
        </div>
      </div>
    </div>
  );
}
