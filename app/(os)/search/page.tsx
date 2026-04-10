'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, File, Users, Folder, MessageSquare, DollarSign,
  Package, Calendar, FileText, Hash, ArrowRight, Clock
} from 'lucide-react';
import { mockProjects, mockUsers, mockContracts } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'project' | 'person' | 'contract' | 'file' | 'channel' | 'enquiry' | 'quote';
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  color: string;
  meta?: string;
}

function buildResults(query: string, projects: typeof mockProjects, enquiries: any[], quotes: any[]): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Projects
  mockProjects.filter(p =>
    p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q) || p.type.includes(q)
  ).forEach(p => results.push({
    id: p.id, type: 'project', title: p.name, subtitle: `${p.clientName} · ${p.type}`,
    href: '/admin/projects', icon: Folder, color: '#3b82f6', meta: `$${p.totalValue.toLocaleString()}`,
  }));

  // People
  mockUsers.filter(u =>
    u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
    (u.skills ?? []).some(s => s.toLowerCase().includes(q))
  ).forEach(u => results.push({
    id: u.id, type: 'person', title: u.name, subtitle: u.title,
    href: '/admin/personnel', icon: Users, color: '#10b981', meta: u.role,
  }));

  // Contracts
  mockContracts.filter(c =>
    c.recipientName.toLowerCase().includes(q) || c.type.includes(q) || (c.projectName ?? '').toLowerCase().includes(q)
  ).forEach(c => results.push({
    id: c.id, type: 'contract', title: c.type.replace('_', ' ').toUpperCase(), subtitle: c.recipientName,
    href: '/admin/contracts', icon: FileText, color: '#f59e0b', meta: c.status,
  }));

  // Enquiries
  enquiries.filter((e: any) =>
    e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.company ?? '').toLowerCase().includes(q) ||
    e.projectType.toLowerCase().includes(q)
  ).forEach((e: any) => results.push({
    id: e.id, type: 'enquiry', title: e.name, subtitle: e.projectType,
    href: '/admin/intake', icon: MessageSquare, color: '#8b5cf6', meta: e.status,
  }));

  // Quotes
  quotes.filter((q2: any) =>
    q2.clientName.toLowerCase().includes(q) || q2.title.toLowerCase().includes(q)
  ).forEach((q2: any) => results.push({
    id: q2.id, type: 'quote', title: q2.title, subtitle: q2.clientName,
    href: '/admin/quotation', icon: DollarSign, color: '#b6332e', meta: `$${q2.total?.toFixed(0) ?? 0}`,
  }));

  // Static file results
  if ('montax'.includes(q) || 'video'.includes(q) || q.includes('mp4') || q.includes('file')) {
    results.push({ id: 'f1', type: 'file', title: 'Montax_Hero_v2_FINAL.mp4', subtitle: 'Project Vault · 04_Exports', href: '/team/vault', icon: File, color: '#888' });
    results.push({ id: 'f2', type: 'file', title: 'Brand_Guidelines.pdf', subtitle: 'Project Vault · 03_Project_Files', href: '/team/vault', icon: FileText, color: '#888' });
  }

  return results.slice(0, 12);
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  project: { label: 'Project', color: '#3b82f6' },
  person: { label: 'Person', color: '#10b981' },
  contract: { label: 'Contract', color: '#f59e0b' },
  file: { label: 'File', color: '#888' },
  channel: { label: 'Channel', color: '#555' },
  enquiry: { label: 'Enquiry', color: '#8b5cf6' },
  quote: { label: 'Quote', color: '#b6332e' },
};

const RECENTS = [
  { label: 'Montax Platform V2', href: '/admin/projects', icon: Folder },
  { label: 'Jordan Vance', href: '/admin/personnel', icon: Users },
  { label: 'Project Vault', href: '/team/vault', icon: Package },
  { label: 'Inquiry Inbox', href: '/admin/intake', icon: MessageSquare },
];

const SHORTCUTS = [
  { label: 'New Project', href: '/admin/projects', icon: Folder, key: 'P' },
  { label: 'Generate Quote', href: '/admin/quotation', icon: DollarSign, key: 'Q' },
  { label: 'Inquiry Inbox', href: '/admin/intake', icon: MessageSquare, key: 'I' },
  { label: 'Chat Hub', href: '/chat', icon: Hash, key: 'C' },
];

export default function GlobalSearch() {
  const { enquiries, quotes } = useStore();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const rawResults = buildResults(query, mockProjects, enquiries, quotes);
  const results = typeFilter ? rawResults.filter(r => r.type === typeFilter) : rawResults;
  const availableTypes = [...new Set(rawResults.map(r => r.type))];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-10 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#444]" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setTypeFilter(null); }}
          placeholder="Search projects, people, files, contracts..."
          className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-2xl pl-16 pr-6 py-6 text-xl text-[#eee] focus:outline-none focus:border-[rgba(182,51,46,0.4)] transition-colors shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">
            ✕
          </button>
        )}
      </div>

      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent */}
          <div className="glass-panel rounded-2xl p-5">
            <p className="section-label mb-3">Recent</p>
            <div className="space-y-1">
              {RECENTS.map(r => (
                <Link key={r.label} href={r.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.04)] group transition-colors">
                  <r.icon className="w-4 h-4 text-[#444] group-hover:text-[#888]" />
                  <span className="text-sm text-[#888] group-hover:text-[#eee] transition-colors">{r.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#333] ml-auto group-hover:text-[#555]" />
                </Link>
              ))}
            </div>
          </div>
          {/* Shortcuts */}
          <div className="glass-panel rounded-2xl p-5">
            <p className="section-label mb-3">Quick Navigate</p>
            <div className="grid grid-cols-2 gap-2">
              {SHORTCUTS.map(s => (
                <Link key={s.label} href={s.href} className="flex items-center gap-2 p-3 rounded-xl glass-panel-elevated hover:bg-[rgba(255,255,255,0.05)] group transition-colors">
                  <s.icon className="w-4 h-4 text-[#555] group-hover:text-[#b6332e]" />
                  <span className="text-xs text-[#777] group-hover:text-[#eee]">{s.label}</span>
                  <kbd className="ml-auto text-[9px] text-[#333] bg-[#111] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.05)]">⌘{s.key}</kbd>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {query && (
        <div className="space-y-4 animate-fade-in">
          {/* Type filters */}
          {availableTypes.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setTypeFilter(null)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!typeFilter ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border-[rgba(182,51,46,0.3)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                All ({rawResults.length})
              </button>
              {availableTypes.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all ${typeFilter === t ? 'border-current' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
                  style={typeFilter === t ? { color: TYPE_CONFIG[t]?.color, borderColor: `${TYPE_CONFIG[t]?.color}40`, background: `${TYPE_CONFIG[t]?.color}10` } : {}}>
                  {TYPE_CONFIG[t]?.label ?? t} ({rawResults.filter(r => r.type === t).length})
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Search className="w-8 h-8 text-[#222] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#333]">No results for "{query}"</p>
              <p className="text-xs text-[#444] mt-1">Try searching a name, project, or file type</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={r.href} className="flex items-center gap-4 p-4 rounded-xl glass-panel glass-panel-hover bg-[#0a0a0a] cursor-pointer transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${r.color}15` }}>
                      <r.icon className="w-5 h-5" style={{ color: r.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#eee] truncate">{r.title}</p>
                      <p className="text-[10px] text-[#555] truncate mt-0.5">{r.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {r.meta && <span className="text-[10px] text-[#444] capitalize">{r.meta}</span>}
                      <span className="text-[9px] px-2 py-0.5 rounded-full border capitalize" style={{ color: TYPE_CONFIG[r.type]?.color, borderColor: `${TYPE_CONFIG[r.type]?.color}30` }}>
                        {TYPE_CONFIG[r.type]?.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#333] group-hover:text-[#555] transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
