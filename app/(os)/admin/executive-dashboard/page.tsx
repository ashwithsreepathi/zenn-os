'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Zap, Activity, Inbox,
  AlertTriangle, ArrowRight, Circle, Clock, ChevronRight, Radio
} from 'lucide-react';
import { mockKPIs, mockProjects, mockActivity, mockLeads } from '@/lib/mock-data';
import Link from 'next/link';

// Mini sparkline for KPI cards
function Sparkline({ data, color = '#b6332e' }: { data: number[]; color?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 36;
  const width = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-70">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

// Custom tooltip for P&L chart
function PLTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel-elevated rounded-xl px-4 py-3 text-xs border border-[rgba(255,255,255,0.08)]">
      <p className="text-[#888] mb-2 font-mono">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#eee] font-semibold">${(p.value / 1000).toFixed(1)}k</span>
          <span className="text-[#555] capitalize">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

const HEALTH_COLOR: Record<string, string> = {
  green: '#10b981',
  amber: '#f59e0b',
  red: '#b6332e',
};

export default function ExecutiveDashboard() {
  const [plView, setPlView] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [sensitivityMode, setSensitivityMode] = useState(false);

  const kpis = [
    {
      label: 'Gross Revenue',
      value: mockKPIs.grossRevenue,
      trend: mockKPIs.grossRevenueTrend,
      change: '+12.4%',
      up: true,
      icon: DollarSign,
      prefix: '$',
    },
    {
      label: 'Net Profit',
      value: mockKPIs.netProfit,
      trend: mockKPIs.netProfitTrend,
      change: '+8.7%',
      up: true,
      icon: TrendingUp,
      prefix: '$',
    },
    {
      label: 'Project Velocity',
      value: mockKPIs.projectVelocity,
      trend: mockKPIs.projectVelocityTrend,
      change: '-6 days',
      up: true,
      icon: Zap,
      suffix: ' days avg',
    },
    {
      label: 'Active Pipeline',
      value: mockKPIs.activePipeline,
      trend: mockKPIs.activePipelineTrend,
      change: '+$6.8k',
      up: true,
      icon: Activity,
      prefix: '$',
    },
  ];

  const formatValue = (v: number, prefix?: string, suffix?: string) => {
    if (sensitivityMode) return '••••••';
    if (prefix === '$') {
      return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;
    }
    return `${v}${suffix ?? ''}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Executive Dashboard</h1>
          <p className="text-xs text-[#555] mt-0.5">April 2026 · Real-time agency pulse</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sensitivity Mode */}
          <button
            onClick={() => setSensitivityMode(!sensitivityMode)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              sensitivityMode
                ? 'border-[#b6332e] text-[#b6332e] bg-[rgba(182,51,46,0.08)]'
                : 'border-[rgba(255,255,255,0.08)] text-[#555] hover:text-[#888]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {sensitivityMode ? 'Sensitivity Mode: ON' : 'Sensitivity Mode'}
          </button>

          {/* Quick-Call Alert Button */}
          <button className="btn-primary text-xs gap-2 animate-pulse-brand">
            <Radio className="w-3.5 h-3.5" />
            Quick-Call Alert
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="kpi-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="section-label mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-[#eee] tracking-tight">
                  {formatValue(kpi.value, kpi.prefix, kpi.suffix)}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[rgba(182,51,46,0.1)] flex items-center justify-center flex-shrink-0">
                <kpi.icon className="w-4 h-4 text-[#b6332e]" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? 'text-[#10b981]' : 'text-[#b6332e]'}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
              {!sensitivityMode && <Sparkline data={kpi.trend} />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* P&L Chart — 2/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#eee]">Receivables vs. Payables</h2>
              <p className="text-xs text-[#555] mt-0.5">P&L overview with cash flow forecast</p>
            </div>
            <div className="flex gap-1">
              {(['monthly', 'quarterly', 'yearly'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setPlView(v)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                    plView === v
                      ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border border-[rgba(182,51,46,0.3)]'
                      : 'text-[#555] hover:text-[#888]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockKPIs.plData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b6332e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#b6332e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<PLTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#b6332e" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Feed — 1/3 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="glass-panel rounded-2xl p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#eee]">Live Feed</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] text-[#444]">Live</span>
            </div>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
            {mockActivity.slice(0, 6).map((event, i) => (
              <div
                key={event.id}
                className={`py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 ${event.isRedFlag ? 'rounded-lg bg-[rgba(182,51,46,0.04)] px-2 -mx-2' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    event.category === 'financial' ? 'bg-[#10b981]' :
                    event.category === 'legal' ? 'bg-[#b6332e]' :
                    event.category === 'production' ? 'bg-[#3b82f6]' :
                    event.isRedFlag ? 'bg-[#b6332e]' : 'bg-[#444]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#ddd] leading-tight">
                      <span className="text-[#b6332e] font-semibold">{event.userName}</span>{' '}
                      {event.action}
                    </p>
                    <p className="text-[10px] text-[#444] mt-0.5 truncate">{event.detail}</p>
                    <p className="text-[9px] text-[#333] mt-1 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {event.isRedFlag && <AlertTriangle className="w-3 h-3 text-[#b6332e] flex-shrink-0 mt-0.5" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Project Health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-[#eee]">Project Health</h2>
            <Link href="/admin/dependency" className="text-xs text-[#555] hover:text-[#b6332e] transition-colors flex items-center gap-1">
              Dependency Architect <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockProjects.filter(p => p.status === 'active').map((project) => (
              <Link
                key={project.id}
                href={`/admin/dependency?project=${project.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: HEALTH_COLOR[project.healthStatus], boxShadow: `0 0 6px ${HEALTH_COLOR[project.healthStatus]}80` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#ddd] truncate group-hover:text-white transition-colors">
                    {project.name}
                  </p>
                  <p className="text-[10px] text-[#444] mt-0.5">{project.clientName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-[#eee]">{project.completionPercent}%</p>
                  <div className="w-16 mt-1">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${project.healthStatus === 'red' ? 'bg-[#b6332e]' : project.healthStatus === 'amber' ? '!bg-[#f59e0b]' : '!bg-[#10b981]'}`}
                        style={{ width: `${project.completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#333] group-hover:text-[#b6332e] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Inquiry Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-[#eee]">Hot Leads</h2>
            <Link href="/admin/intake" className="text-xs text-[#555] hover:text-[#b6332e] transition-colors flex items-center gap-1">
              View Pipeline <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockLeads.filter(l => l.temperature !== 'cold' && l.stage !== 'converted' && l.stage !== 'lost').slice(0, 4).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                {lead.isSpamFlag && <AlertTriangle className="w-3.5 h-3.5 text-[#b6332e] flex-shrink-0" />}
                {!lead.isSpamFlag && (
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.temperature === 'hot' ? 'bg-[#b6332e]' : 'bg-[#f59e0b]'}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#ddd] truncate">{lead.companyName}</p>
                  <p className="text-[10px] text-[#444] capitalize">{lead.stage.replace('_', ' ')} · {lead.projectType}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-[#eee]">${(lead.estimatedBudget / 1000).toFixed(0)}k</p>
                  <div className={`badge-${lead.temperature === 'hot' ? 'brand' : 'warning'} mt-1 inline-block`}>
                    {lead.temperature}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Burn Rate Alert */}
          <div className="mt-4 p-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
              <p className="text-xs text-[#f59e0b] font-semibold">Burn Rate Alert</p>
            </div>
            <p className="text-[10px] text-[#666] mt-1">BFB revision spike detected — 2 extra rounds above contract. Check Change Request Center.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
