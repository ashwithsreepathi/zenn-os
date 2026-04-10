'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { mockKPIs, mockProjects, mockLeads, mockUsers } from '@/lib/mock-data';
import { TrendingUp, Users, FolderOpen, DollarSign, Download, FileText, Check } from 'lucide-react';
import { useState } from 'react';

const revenueByType = [
  { type: 'Web', value: 28000 },
  { type: 'Video', value: 15500 },
  { type: 'Brand', value: 12000 },
  { type: 'Social', value: 4800 },
];

const leadSourceData = [
  { source: 'Referral', count: 2, color: '#b6332e' },
  { source: 'SEO', count: 1, color: '#3b82f6' },
  { source: 'Instagram', count: 1, color: '#8b5cf6' },
  { source: 'Direct', count: 1, color: '#555' },
];

const teamPerformance = [
  { member: 'Jordan', reliability: 87, load: 2 },
  { member: 'Mia', reliability: 94, load: 3 },
  { member: 'Sam', reliability: 96, load: 5 },
  { member: 'Rex', reliability: 72, load: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel-elevated rounded-xl px-4 py-3 text-xs border border-[rgba(255,255,255,0.08)]">
      <p className="text-[#888] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-[#eee] font-bold">
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `$${(p.value / 1000).toFixed(1)}k` : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
function downloadCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF Report (text-based, opens in new tab) ────────────────────────────────
function downloadPDFReport(projects: typeof mockProjects, kpis: typeof mockKPIs) {
  const now = new Date().toLocaleDateString('en-CA');
  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<title>Zenn Studios – Analytics Report ${now}</title>
<style>
  body { font-family: Arial, sans-serif; background: #fff; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; }
  h1 { font-size: 24px; border-bottom: 2px solid #b6332e; padding-bottom: 8px; color: #b6332e; }
  h2 { font-size: 16px; margin-top: 28px; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th { background: #f5f5f5; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; }
  .kpi { display: inline-block; margin: 0 12px 12px 0; background: #f7f7f7; border-radius: 8px; padding: 12px 20px; }
  .kpi-val { font-size: 24px; font-weight: 900; color: #b6332e; }
  .kpi-lbl { font-size: 11px; color: #888; text-transform: uppercase; }
  footer { margin-top: 40px; font-size: 10px; color: #aaa; }
</style>
</head><body>
<h1>🎬 Zenn Studios — Analytics Report</h1>
<p style="color:#888;font-size:12px;">Generated: ${now} · Confidential</p>
<h2>Key Metrics</h2>
<div>
  <div class="kpi"><div class="kpi-val">$${(kpis.grossRevenue / 1000).toFixed(1)}k</div><div class="kpi-lbl">Gross Revenue</div></div>
  <div class="kpi"><div class="kpi-val">${projects.filter(p => p.status === 'active').length}</div><div class="kpi-lbl">Active Projects</div></div>
  <div class="kpi"><div class="kpi-val">${mockUsers.filter(u => u.role !== 'client').length}</div><div class="kpi-lbl">Team Members</div></div>
  <div class="kpi"><div class="kpi-val">${mockLeads.length}</div><div class="kpi-lbl">Total Leads</div></div>
</div>
<h2>Active Projects</h2>
<table>
  <tr><th>Project</th><th>Client</th><th>Value</th><th>Progress</th><th>Health</th></tr>
  ${projects.filter(p => p.status === 'active').map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.clientName}</td>
      <td>$${p.totalValue.toLocaleString()}</td>
      <td>${p.completionPercent}%</td>
      <td>${p.healthStatus.toUpperCase()}</td>
    </tr>
  `).join('')}
</table>
<h2>Revenue by Service Type</h2>
<table>
  <tr><th>Service</th><th>Revenue</th></tr>
  ${revenueByType.map(r => `<tr><td>${r.type}</td><td>$${r.value.toLocaleString()}</td></tr>`).join('')}
</table>
<h2>Team Reliability</h2>
<table>
  <tr><th>Member</th><th>Reliability</th><th>Current Load</th></tr>
  ${teamPerformance.map(t => `<tr><td>${t.member}</td><td>${t.reliability}%</td><td>${t.load} projects</td></tr>`).join('')}
</table>
<footer>© ${new Date().getFullYear()} Zenn Studios — Internal Use Only</footer>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  // Trigger browser print dialog (→ Save as PDF)
  if (win) {
    win.addEventListener('load', () => {
      setTimeout(() => { win.print(); }, 600);
    });
  }
}

export default function Analytics() {
  const conversionRate = ((mockLeads.filter(l => l.stage === 'converted').length / mockLeads.length) * 100).toFixed(0);
  const [csvDone, setCsvDone] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const handleCSV = () => {
    downloadCSV('zenn-projects-report.csv',
      mockProjects.map(p => [p.name, p.clientName, p.status, p.totalValue, p.paidToDate, p.completionPercent + '%', p.healthStatus]),
      ['Project', 'Client', 'Status', 'Total Value', 'Paid To Date', 'Progress', 'Health']
    );
    setCsvDone(true);
    setTimeout(() => setCsvDone(false), 2500);
  };

  const handlePDF = () => {
    downloadPDFReport(mockProjects, mockKPIs);
    setPdfDone(true);
    setTimeout(() => setPdfDone(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Analytics & Performance</h1>
          <p className="text-xs text-[#555] mt-0.5">Agency-wide metrics · April 2026 snapshot</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCSV} className="btn-secondary text-xs">
            {csvDone ? <><Check className="w-3.5 h-3.5" /> Downloaded</> : <><Download className="w-3.5 h-3.5" /> Export CSV</>}
          </button>
          <button onClick={handlePDF} className="btn-primary text-xs">
            {pdfDone ? <><Check className="w-3.5 h-3.5" /> Opened</> : <><FileText className="w-3.5 h-3.5" /> PDF Report</>}
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Revenue', value: `$${(mockKPIs.grossRevenue / 1000).toFixed(1)}k`, change: '+12.4%', up: true, icon: DollarSign },
          { label: 'Active Projects', value: mockProjects.filter(p => p.status === 'active').length, change: '+1 this month', up: true, icon: FolderOpen },
          { label: 'Lead Conversion', value: `${conversionRate}%`, change: 'Lifetime avg', up: true, icon: TrendingUp },
          { label: 'Team Size', value: mockUsers.filter(u => u.role !== 'client').length, change: '1 pending onboard', up: false, icon: Users },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">{k.label}</p>
              <div className="w-7 h-7 rounded-lg bg-[rgba(182,51,46,0.1)] flex items-center justify-center">
                <k.icon className="w-4 h-4 text-[#b6332e]" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#eee]">{k.value}</p>
            <p className={`text-[10px] mt-1 ${k.up ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>{k.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#eee] mb-5">6-Month Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockKPIs.plData}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#b6332e" strokeWidth={2} dot={{ fill: '#b6332e', r: 4 }} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Project Type */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#eee] mb-5">Revenue by Service Type</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByType} barSize={32}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#b6332e" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#eee] mb-5">Lead Sources</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={leadSourceData} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                  {leadSourceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {leadSourceData.map(d => (
                <div key={d.source} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-[#ccc]">{d.source}</span>
                  <span className="text-xs font-bold text-[#eee] ml-auto">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Reliability */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#eee] mb-5">Team Reliability Scores</h2>
          <div className="space-y-4">
            {teamPerformance.map(t => (
              <div key={t.member}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-[#ccc] font-semibold">{t.member}</span>
                  <span className={`font-bold ${t.reliability >= 90 ? 'text-[#10b981]' : t.reliability >= 75 ? 'text-[#f59e0b]' : 'text-[#b6332e]'}`}>{t.reliability}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${t.reliability}%`, background: t.reliability >= 90 ? '#10b981' : t.reliability >= 75 ? '#f59e0b' : '#b6332e' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
