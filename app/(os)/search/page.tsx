/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, File, Users, Folder, MessageSquare, DollarSign,
  Package, FileText, Hash, ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'project' | 'person' | 'contract' | 'file' | 'enquiry' | 'quote';
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  color: string;
  meta?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  project: { label: 'Project', color: '#3b82f6' },
  person: { label: 'Person', color: '#10b981' },
  contract: { label: 'Contract', color: '#f59e0b' },
  file: { label: 'File', color: '#888' },
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
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const term = q.toLowerCase();
    const out: SearchResult[] = [];

    const [projRes, userRes, contractRes, enquiryRes, quoteRes] = await Promise.all([
      supabase.from('os_projects').select('id,name,client_name,type,total_value,status').ilike('name', `%${q}%`),
      supabase.from('os_users').select('id,name,title,role,email').or(`name.ilike.%${q}%,email.ilike.%${q}%`),
      supabase.from('os_contracts').select('id,type,recipient_name,project_name,status').or(`recipient_name.ilike.%${q}%,project_name.ilike.%${q}%`),
      supabase.from('os_enquiries').select('id,name,email,project_type,status').or(`name.ilike.%${q}%,email.ilike.%${q}%,project_type.ilike.%${q}%`),
      supabase.from('os_quotes').select('id,client_name,project_type').or(`client_name.ilike.%${q}%,project_type.ilike.%${q}%`),
    ]);

    for (const p of projRes.data ?? []) {
      out.push({ id: p.id, type: 'project', title: p.name, subtitle: `${p.client_name} · ${p.type}`,
        href: '/admin/projects', icon: Folder, color: '#3b82f6', meta: `$${Number(p.total_value ?? 0).toLocaleString()}` });
    }
    for (const u of userRes.data ?? []) {
      out.push({ id: u.id, type: 'person', title: u.name, subtitle: u.title ?? u.email,
        href: '/admin/personnel', icon: Users, color: '#10b981', meta: u.role });
    }
    for (const c of contractRes.data ?? []) {
      out.push({ id: c.id, type: 'contract', title: `${c.type.toUpperCase()} Contract`, subtitle: c.recipient_name,
        href: '/admin/contracts', icon: FileText, color: '#f59e0b', meta: c.status });
    }
    for (const e of enquiryRes.data ?? []) {
      out.push({ id: e.id, type: 'enquiry', title: e.name, subtitle: e.project_type ?? '',
        href: '/admin/intake', icon: MessageSquare, color: '#8b5cf6', meta: e.status });
    }
    for (const q2 of quoteRes.data ?? []) {
      out.push({ id: q2.id, type: 'quote', title: q2.client_name ?? 'Quote', subtitle: q2.project_type ?? '',
        href: '/admin/quotation', icon: DollarSign, color: '#b6332e' });
    }

    setResults(out.slice(0, 12));
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  const filtered = typeFilter ? results.filter((r) => r.type === typeFilter) : results;
  const availableTypes = [...new Set(results.map((r) => r.type))];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-10 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#444]" />
        <input autoFocus type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setTypeFilter(null); }}
          placeholder="Search projects, people, files, contracts..."
          className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-2xl pl-16 pr-6 py-6 text-xl text-[#eee] focus:outline-none focus:border-[rgba(182,51,46,0.4)] transition-colors shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">✕</button>
        )}
      </div>

      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-5">
            <p className="section-label mb-3">Recent</p>
            <div className="space-y-1">
              {RECENTS.map((r) => (
                <Link key={r.label} href={r.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.04)] group transition-colors">
                  <r.icon className="w-4 h-4 text-[#444] group-hover:text-[#888]" />
                  <span className="text-sm text-[#888] group-hover:text-[#eee] transition-colors">{r.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#333] ml-auto group-hover:text-[#555]" />
                </Link>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <p className="section-label mb-3">Quick Navigate</p>
            <div className="grid grid-cols-2 gap-2">
              {SHORTCUTS.map((s) => (
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
          {availableTypes.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setTypeFilter(null)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!typeFilter ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border-[rgba(182,51,46,0.3)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                All ({results.length})
              </button>
              {availableTypes.map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all ${typeFilter === t ? 'border-current' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
                  style={typeFilter === t ? { color: TYPE_CONFIG[t]?.color, borderColor: `${TYPE_CONFIG[t]?.color}40`, background: `${TYPE_CONFIG[t]?.color}10` } : {}}>
                  {TYPE_CONFIG[t]?.label} ({results.filter((r) => r.type === t).length})
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-panel rounded-xl h-16 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Search className="w-8 h-8 text-[#222] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#333]">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#444] mt-1">Try searching a name, project, or file type</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((r, i) => (
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
                      <span className="text-[9px] px-2 py-0.5 rounded-full border capitalize"
                        style={{ color: TYPE_CONFIG[r.type]?.color, borderColor: `${TYPE_CONFIG[r.type]?.color}30` }}>
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
