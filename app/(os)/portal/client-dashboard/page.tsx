/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { ServiceType } from '@/lib/types';
import {
  CheckCircle, Lock, Clock, PlayCircle, FileText, ArrowRight, BarChart2,
  Camera, Globe, TrendingUp, Image, Video, Star, Download, Eye, ThumbsUp,
  ThumbsDown, Users, Heart, MessageCircle, Share2, Zap, Palette, Monitor,
  BookOpen, ChevronRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';

// ─── Service Meta ─────────────────────────────────────────────────────────────

const SERVICE_META: Record<ServiceType, { label: string; icon: React.ElementType; color: string }> = {
  web: { label: 'Web Development', icon: Globe, color: '#3b82f6' },
  business_dev: { label: 'Business Development', icon: TrendingUp, color: '#10b981' },
  photography: { label: 'Photography', icon: Camera, color: '#f59e0b' },
  social_media: { label: 'Social Media', icon: BarChart2, color: '#8b5cf6' },
  video: { label: 'Video Production', icon: Video, color: '#b6332e' },
  branding: { label: 'Brand Identity', icon: Palette, color: '#ec4899' },
};

// ─── MOCK DATA FOR SERVICE MODULES ────────────────────────────────────────────

const mockGallery = [
  { id: 'ph1', name: 'Studio Shot A', status: 'approved', size: '4K - 12MB', thumb: '📸' },
  { id: 'ph2', name: 'Outdoor Series #1', status: 'pending', size: '4K - 14MB', thumb: '🌿' },
  { id: 'ph3', name: 'Product Hero', status: 'pending', size: '4K - 10MB', thumb: '📦' },
  { id: 'ph4', name: 'Lifestyle Pack', status: 'approved', size: '4K - 18MB', thumb: '🌇' },
  { id: 'ph5', name: 'Detail Shots', status: 'pending', size: '4K - 9MB', thumb: '🔍' },
  { id: 'ph6', name: 'Team Portraits', status: 'revision', size: '4K - 16MB', thumb: '👤' },
];

const mockSocialStats = {
  followers: { value: 14820, change: 8.4 },
  reach: { value: 62400, change: 22.1 },
  engagement: { value: 4.8, change: -0.3 },
  impressions: { value: 94100, change: 31.2 },
};

const mockReachData = [
  { week: 'W1', reach: 8200, engagement: 380 },
  { week: 'W2', reach: 11400, engagement: 520 },
  { week: 'W3', reach: 9800, engagement: 441 },
  { week: 'W4', reach: 14200, engagement: 680 },
  { week: 'W5', reach: 12800, engagement: 590 },
  { week: 'W6', reach: 16100, engagement: 770 },
];

const mockTopPosts = [
  { id: 1, caption: 'Spring sale is here! 🌸 Get 40% off...', likes: 342, comments: 28, shares: 61, platform: 'Instagram' },
  { id: 2, caption: 'Behind the scenes at our warehouse...', likes: 218, comments: 14, shares: 33, platform: 'Instagram' },
  { id: 3, caption: 'Customer story: How Tyler saved $800...', likes: 189, comments: 42, shares: 29, platform: 'Facebook' },
];

const mockPresentationSlides = [
  { id: 1, title: 'Brand Direction', type: 'cover', status: 'approved', thumb: '🎨' },
  { id: 2, title: 'Logo Concepts', type: 'design', status: 'approved', thumb: '✏️' },
  { id: 3, title: 'Color System', type: 'design', status: 'revision', thumb: '🎨' },
  { id: 4, title: 'Typography', type: 'design', status: 'pending', thumb: 'Aa' },
  { id: 5, title: 'Brand in Use', type: 'mockup', status: 'pending', thumb: '📱' },
];

// ─── Service Modules ─────────────────────────────────────────────────────────

function WebModule({ project }: { project: { name: string; completion_percent: number; milestones?: any[] } | undefined }) {
  if (!project) return <p className="text-xs text-[#444]">No web project linked.</p>;
  const visibleMilestones = (project.milestones ?? []).filter((m: any) => m.is_client_visible);
  const approved = visibleMilestones.filter((m: any) => m.status === 'approved').length;

  return (
    <div className="space-y-5">
      {/* Progress Ring */}
      <div className="glass-panel rounded-2xl p-5 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="44" cy="44" r="36" fill="none" stroke="#3b82f6" strokeWidth="8"
              strokeDasharray={2 * Math.PI * 36}
              strokeDashoffset={2 * Math.PI * 36 * (1 - project.completion_percent / 100)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-[#eee]">{project.completion_percent}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#eee] truncate">{project.name}</h3>
          <p className="text-[10px] text-[#555] mb-2">{approved} of {visibleMilestones.length} phases complete</p>
          <div className="progress-bar">
            <div className="progress-fill !bg-[#3b82f6]" style={{ width: `${project.completion_percent}%` }} />
          </div>
        </div>
      </div>

      {/* Milestone roadmap */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#eee]">Project Roadmap</h3>
          <span className="text-[10px] text-[#555]">{approved}/{visibleMilestones.length} done</span>
        </div>
        <div className="space-y-3">
        {visibleMilestones.map((m: any, i: number) => {
            const isDone = m.status === 'approved';
            const isActive = m.status === 'in_progress';
            return (
              <div key={m.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${isDone ? 'bg-[#10b981] border-[#10b981]' : isActive ? 'bg-transparent border-[#3b82f6] animate-pulse' : 'bg-transparent border-[#333]'}`} />
                  {i < visibleMilestones.length - 1 && <div className={`w-0.5 h-6 mt-1 ${isDone ? 'bg-[#10b981] opacity-30' : 'bg-[#222]'}`} />}
                </div>
                <div className={`flex-1 ${i < visibleMilestones.length - 1 ? 'mb-6' : ''} ${!isDone && !isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${isDone ? 'text-[#666] line-through' : 'text-[#eee]'}`}>{m.name}</p>
                    {isDone && <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" />}
                    {isActive && <span className="text-[9px] text-[#3b82f6] bg-[rgba(59,130,246,0.1)] px-2 py-0.5 rounded-full">In Progress</span>}
                    {m.status === 'submitted' && (
                      <Link href="/portal/proof-review" className="btn-primary text-[9px] py-0.5 px-2">Review →</Link>
                    )}
                    {!isDone && !isActive && m.status !== 'submitted' && <Lock className="w-3 h-3 text-[#333]" />}
                  </div>
                  <p className="text-[10px] text-[#444] mt-0.5">Due {m.end_date ?? '—'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/portal/proof-review" className="glass-panel rounded-xl p-4 flex items-center gap-3 hover:bg-[#111] transition-colors">
          <Eye className="w-5 h-5 text-[#3b82f6]" />
          <div><p className="text-xs font-bold text-[#eee]">Review Proofs</p><p className="text-[10px] text-[#555]">1 pending</p></div>
        </Link>
        <Link href="/portal/billing" className="glass-panel rounded-xl p-4 flex items-center gap-3 hover:bg-[#111] transition-colors">
          <FileText className="w-5 h-5 text-[#10b981]" />
          <div><p className="text-xs font-bold text-[#eee]">Billing</p><p className="text-[10px] text-[#555]">View invoices</p></div>
        </Link>
      </div>
    </div>
  );
}

function BusinessDevModule() {
  const kpis = [
    { label: 'Leads Pipeline', value: '12', change: '+3 this wk', color: '#3b82f6' },
    { label: 'Proposals Sent', value: '4', change: '2 pending', color: '#f59e0b' },
    { label: 'Est. Revenue', value: '$84k', change: 'Q2 target', color: '#10b981' },
    { label: 'Conversion Rate', value: '33%', change: '+5% mom', color: '#b6332e' },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="glass-panel rounded-2xl p-4">
            <p className="section-label mb-1">{k.label}</p>
            <p className="text-xl font-black" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[10px] text-[#444] mt-0.5">{k.change}</p>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#eee] mb-3">Pipeline Overview</h3>
        <div className="space-y-2">
          {[
            { label: 'Discovery', count: 5, color: '#555' },
            { label: 'Qualified', count: 4, color: '#3b82f6' },
            { label: 'Proposal', count: 2, color: '#f59e0b' },
            { label: 'Negotiation', count: 1, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[10px] text-[#555] w-20">{s.label}</span>
              <div className="flex-1 progress-bar">
                <div className="progress-fill" style={{ width: `${(s.count / 5) * 100}%`, background: s.color }} />
              </div>
              <span className="text-[10px] font-bold text-[#888] w-4 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhotographyModule() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'approved' | 'revision'>>(
    Object.fromEntries(mockGallery.map(p => [p.id, p.status as 'pending' | 'approved' | 'revision']))
  );

  const approve = (id: string) => setStatuses(s => ({ ...s, [id]: 'approved' }));
  const requestRevision = (id: string) => setStatuses(s => ({ ...s, [id]: 'revision' }));

  const approvedCount = Object.values(statuses).filter(s => s === 'approved').length;
  const pendingCount = Object.values(statuses).filter(s => s === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
        <Camera className="w-8 h-8 text-[#f59e0b] flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold text-[#eee]">Gallery — Proof Round 1</p>
          <p className="text-[10px] text-[#555]">{approvedCount} approved · {pendingCount} awaiting your review</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] text-[#10b981] bg-[rgba(16,185,129,0.1)] px-2 py-1 rounded-full">{approvedCount} ✓</span>
          <span className="text-[10px] text-[#f59e0b] bg-[rgba(245,158,11,0.1)] px-2 py-1 rounded-full">{pendingCount} pending</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mockGallery.map(photo => {
          const status = statuses[photo.id];
          return (
            <motion.div key={photo.id} whileHover={{ scale: 1.02 }}
              className={`glass-panel rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                status === 'approved' ? 'border-[rgba(16,185,129,0.4)]' :
                status === 'revision' ? 'border-[rgba(182,51,46,0.4)]' :
                'border-transparent hover:border-[rgba(255,255,255,0.1)]'
              }`}
              onClick={() => setSelectedPhoto(photo.id === selectedPhoto ? null : photo.id)}
            >
              {/* Photo placeholder */}
              <div className="h-28 bg-[#111] flex items-center justify-center text-4xl relative">
                {photo.thumb}
                <div className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  status === 'approved' ? 'bg-[#10b981] text-black' :
                  status === 'revision' ? 'bg-[#b6332e] text-white' :
                  'bg-[rgba(255,255,255,0.08)] text-[#888]'
                }`}>
                  {status === 'approved' ? '✓ OK' : status === 'revision' ? '↩ Revision' : '● Review'}
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[10px] font-bold text-[#eee] truncate">{photo.name}</p>
                <p className="text-[9px] text-[#444]">{photo.size}</p>
              </div>

              <AnimatePresence>
                {selectedPhoto === photo.id && status === 'pending' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="px-2.5 pb-2.5 grid grid-cols-2 gap-1.5 overflow-hidden">
                    <button onClick={() => approve(photo.id)} className="flex items-center justify-center gap-1 text-[10px] bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.3)] rounded-lg py-1.5 hover:bg-[rgba(16,185,129,0.2)] transition-colors">
                      <ThumbsUp className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => requestRevision(photo.id)} className="flex items-center justify-center gap-1 text-[10px] bg-[rgba(182,51,46,0.1)] text-[#b6332e] border border-[rgba(182,51,46,0.3)] rounded-lg py-1.5 hover:bg-[rgba(182,51,46,0.2)] transition-colors">
                      <ThumbsDown className="w-3 h-3" /> Revise
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {approvedCount === mockGallery.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-panel rounded-xl p-4 border border-[rgba(16,185,129,0.3)] flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#10b981]" />
          <div>
            <p className="text-xs font-bold text-[#10b981]">Gallery Approved!</p>
            <p className="text-[10px] text-[#555]">All images signed off. Download link will be shared within 24h.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SocialMediaModule() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(mockSocialStats).map(([key, stat]) => (
          <div key={key} className="glass-panel rounded-xl p-4">
            <p className="section-label mb-1 capitalize">{key.replace('_', ' ')}</p>
            <p className="text-lg font-black text-[#eee]">{typeof stat.value === 'number' && stat.value > 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}{key === 'engagement' ? '%' : ''}</p>
            <p className={`text-[10px] mt-0.5 ${stat.change > 0 ? 'text-[#10b981]' : 'text-[#b6332e]'}`}>
              {stat.change > 0 ? '▲' : '▼'} {Math.abs(stat.change)}% vs last mo
            </p>
          </div>
        ))}
      </div>

      {/* Reach chart */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#eee] mb-4">Weekly Reach &amp; Engagement</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={mockReachData}>
            <XAxis dataKey="week" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
              formatter={(v: unknown) => [Number(v).toLocaleString(), '']} />
            <Line type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="engagement" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-[10px] text-[#555]"><span style={{ color: '#8b5cf6' }}>●</span> Reach</span>
          <span className="text-[10px] text-[#555]"><span style={{ color: '#f59e0b' }}>●</span> Engagement</span>
        </div>
      </div>

      {/* Top posts */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#eee] mb-3">Top Performing Posts</h3>
        <div className="space-y-3">
          {mockTopPosts.map((post, i) => (
            <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
              <span className="text-[10px] font-black text-[#333] w-4 flex-shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#aaa] truncate">{post.caption}</p>
                <p className="text-[9px] text-[#444] mt-0.5">{post.platform}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#555] flex-shrink-0">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#b6332e]" />{post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.comments}</span>
                <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoModule() {
  const phases = [
    { label: 'Pre-Production', status: 'done', note: 'Storyboard approved' },
    { label: 'Shoot Days', status: 'done', note: '2 days completed Apr 5–6' },
    { label: 'Primary Edit', status: 'active', note: 'v2 ready for review' },
    { label: 'Color & Sound', status: 'locked', note: 'Pending edit approval' },
    { label: 'Delivery', status: 'locked', note: '4K ProRes + social cuts' },
  ];
  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#eee] mb-4">Production Pipeline</h3>
        <div className="space-y-3">
          {phases.map((p, i) => (
            <div key={p.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black ${p.status === 'done' ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981]' : p.status === 'active' ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] animate-pulse' : 'bg-[rgba(255,255,255,0.04)] text-[#333]'}`}>
                {p.status === 'done' ? '✓' : p.status === 'active' ? '●' : `${i + 1}`}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${p.status === 'done' ? 'text-[#555] line-through' : p.status === 'active' ? 'text-[#eee]' : 'text-[#444]'}`}>{p.label}</p>
                <p className="text-[10px] text-[#444]">{p.note}</p>
              </div>
              {p.status === 'active' && (
                <Link href="/portal/proof-review" className="btn-primary text-[9px] py-1 px-3 whitespace-nowrap">Review v2</Link>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="glass-panel rounded-xl p-4 border border-[rgba(182,51,46,0.2)]">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-[#b6332e]" />
          <div>
            <p className="text-xs font-bold text-[#eee]">Hero Edit v2 is ready for review</p>
            <p className="text-[10px] text-[#555]">1:12 cut — submitted Apr 9, 2026</p>
          </div>
          <Link href="/portal/proof-review" className="btn-primary text-xs ml-auto">Watch &amp; Approve</Link>
        </div>
      </div>
    </div>
  );
}

function BrandingModule() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideStatuses, setSlideStatuses] = useState<Record<number, string>>(
    Object.fromEntries(mockPresentationSlides.map((s, i) => [i, s.status]))
  );

  const current = mockPresentationSlides[activeSlide];
  const status = slideStatuses[activeSlide];

  return (
    <div className="space-y-5">
      {/* Slide navigation */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="border-b border-[rgba(255,255,255,0.05)] px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#eee]">Brand Presentation</h3>
          <span className="text-[10px] text-[#555]">{activeSlide + 1} / {mockPresentationSlides.length}</span>
        </div>

        {/* Main slide view */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="h-48 bg-[#080808] flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-6xl mb-3">{current.thumb}</div>
              <p className="text-sm font-black text-[#eee]">{current.title}</p>
              <p className="text-[10px] text-[#444] mt-1 capitalize">{current.type}</p>
            </div>
            <div className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full ${
              status === 'approved' ? 'bg-[#10b981] text-black' :
              status === 'revision' ? 'bg-[#b6332e] text-white' : 'bg-[rgba(255,255,255,0.08)] text-[#888]'
            }`}>
              {status === 'approved' ? '✓ Approved' : status === 'revision' ? '↩ Revision Requested' : '● Awaiting Review'}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Review actions */}
        {status === 'pending' && (
          <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.05)] flex gap-2">
            <button onClick={() => setSlideStatuses(s => ({ ...s, [activeSlide]: 'approved' }))}
              className="flex-1 flex items-center justify-center gap-2 text-xs py-2 rounded-xl border border-[rgba(16,185,129,0.3)] text-[#10b981] bg-[rgba(16,185,129,0.08)] hover:bg-[rgba(16,185,129,0.15)] transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" /> Approve This Slide
            </button>
            <button onClick={() => setSlideStatuses(s => ({ ...s, [activeSlide]: 'revision' }))}
              className="flex-1 flex items-center justify-center gap-2 text-xs py-2 rounded-xl border border-[rgba(182,51,46,0.3)] text-[#b6332e] bg-[rgba(182,51,46,0.08)] hover:bg-[rgba(182,51,46,0.15)] transition-colors">
              <ThumbsDown className="w-3.5 h-3.5" /> Request Changes
            </button>
          </div>
        )}

        {/* Slide thumbs */}
        <div className="flex gap-2 px-5 py-3 border-t border-[rgba(255,255,255,0.05)] overflow-x-auto">
          {mockPresentationSlides.map((s, i) => {
            const st = slideStatuses[i];
            return (
              <button key={s.id} onClick={() => setActiveSlide(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center text-lg transition-all ${i === activeSlide ? 'border-[#b6332e]' : st === 'approved' ? 'border-[rgba(16,185,129,0.5)] opacity-60' : 'border-transparent hover:border-[rgba(255,255,255,0.1)]'} bg-[#0a0a0a]`}>
                {s.thumb}
                <div className={`text-[7px] mt-0.5 font-bold ${st === 'approved' ? 'text-[#10b981]' : st === 'revision' ? 'text-[#b6332e]' : 'text-[#333]'}`}>
                  {st === 'approved' ? '✓' : st === 'revision' ? '↩' : '○'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button disabled={activeSlide === 0} onClick={() => setActiveSlide(a => a - 1)} className="btn-secondary flex-1 justify-center text-xs disabled:opacity-30">← Prev</button>
        <button disabled={activeSlide === mockPresentationSlides.length - 1} onClick={() => setActiveSlide(a => a + 1)} className="btn-primary flex-1 justify-center text-xs disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}

// ─── Action Inbox (shared) ────────────────────────────────────────────────────

function ActionInbox() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#eee]">Action Inbox</h3>
        <span className="bg-[#b6332e] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">1 Need Action</span>
      </div>
      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.06)] flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <Zap className="w-4 h-4 text-[#b6332e] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#eee]">Proof Review Waiting</p>
              <p className="text-[10px] text-[#888] mt-0.5">Phase 3 deliverables are ready for your approval.</p>
            </div>
          </div>
          <Link href="/portal/proof-review" className="btn-primary text-[10px] py-1.5 px-3 whitespace-nowrap flex-shrink-0">Review</Link>
        </div>
        <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] flex items-center gap-3 opacity-50">
          <CheckCircle className="w-4 h-4 text-[#10b981]" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#888]">Phase 2 Sign-off</p>
            <p className="text-[9px] text-[#555]">Completed Apr 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Portal Dashboard ────────────────────────────────────────────────────

export default function ClientDashboard() {
  const { user, impersonating, impersonatingUserId } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [linkedProject, setLinkedProject] = useState<any>(null);
  const [projectMilestones, setProjectMilestones] = useState<any[]>([]);

  const resolvedUserId = impersonating ? impersonatingUserId : user?.id;

  useEffect(() => {
    if (!resolvedUserId) return;
    supabase.from('os_users').select('*').eq('id', resolvedUserId).single().then(({ data: u }) => {
      if (u) {
        setCurrentUser(u);
        // Find their linked project via client_id or assigned_team
        supabase.from('os_projects').select('*')
          .or(`client_id.eq.${u.id},assigned_team.cs.{${u.id}}`)
          .eq('status', 'active')
          .limit(1)
          .single()
          .then(({ data: proj }) => {
            if (proj) {
              setLinkedProject(proj);
              supabase.from('os_milestones').select('*').eq('project_id', proj.id)
                .order('display_order', { ascending: true })
                .then(({ data: ms }) => setProjectMilestones(ms ?? []));
            }
          });
      }
    });
  }, [resolvedUserId]);

  const services = (currentUser?.service_subscriptions as any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] ?? []);
  const [activeService, setActiveService] = useState<ServiceType>('web');

  // Merge milestones into linkedProject for WebModule
  const projectWithMilestones = linkedProject ? { ...linkedProject, milestones: projectMilestones } : undefined;

  const greeting = impersonating
    ? (currentUser?.name?.split(' ')[0] ?? 'Client')
    : (user?.name?.split(' ')[0] ?? 'Client');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#eee]">Welcome back, {greeting} 👋</h1>
          <p className="text-sm text-[#555] mt-1">
            {currentUser?.company ?? currentUser?.title ?? 'Client Portal'}
            {services.length > 1 && ` · ${services.length} active services`}
          </p>
        </div>
        <Link href="/chat" className="btn-secondary text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> Message Team
        </Link>
      </div>

      {/* Service Tabs — only show if client has multiple services */}
      {services.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {services.map(sub => {
            const tempType = sub.type as ServiceType;
            const meta = SERVICE_META[tempType] ?? SERVICE_META['web'];
            const Icon = meta.icon;
            const isActive = activeService === tempType;
            return (
              <button
                key={sub.type}
                onClick={() => setActiveService(sub.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'border-current text-current'
                    : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'
                }`}
                style={isActive ? { color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}10` } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Service Heading */}
      {services.length > 0 && (
        <div className="flex items-center gap-2">
          {(() => {
            const meta = SERVICE_META[activeService as ServiceType] ?? SERVICE_META['web'];
            const Icon = meta.icon;
            return (
              <>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <h2 className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</h2>
                {linkedProject && <span className="text-[10px] text-[#444]">· {linkedProject.name}</span>}
              </>
            );
          })()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main service module */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div key={activeService} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeService === 'web' && <WebModule project={projectWithMilestones} />}
              {activeService === 'business_dev' && <BusinessDevModule />}
              {activeService === 'photography' && <PhotographyModule />}
              {activeService === 'social_media' && <SocialMediaModule />}
              {activeService === 'video' && <VideoModule />}
              {activeService === 'branding' && <BrandingModule />}
              {!(['web','business_dev','photography','social_media','video','branding'] as ServiceType[]).includes(activeService) && (
                <div className="glass-panel rounded-2xl p-12 text-center">
                  <p className="text-xs text-[#444]">Dashboard for this service is being set up.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ActionInbox />

          {/* Quick links */}
          <div className="glass-panel rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-[#eee] mb-3">Quick Access</h3>
            {[
              { label: 'Proof Review', href: '/portal/proof-review', icon: Eye },
              { label: 'My Assets', href: '/portal/asset-vault', icon: Download },
              { label: 'Billing & Invoices', href: '/portal/billing', icon: FileText },
              { label: 'Chat Hub', href: '/chat', icon: MessageCircle },
            ].map(link => (
              <Link key={link.label} href={link.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#111] transition-colors group">
                <link.icon className="w-4 h-4 text-[#444] group-hover:text-[#b6332e] transition-colors" />
                <span className="text-xs text-[#888] group-hover:text-[#eee] transition-colors">{link.label}</span>
                <ChevronRight className="w-3 h-3 text-[#333] ml-auto group-hover:text-[#555]" />
              </Link>
            ))}
          </div>

          {/* No services message */}
          {services.length === 0 && (
            <div className="glass-panel rounded-2xl p-6 text-center border border-[rgba(255,255,255,0.04)]">
              <BookOpen className="w-6 h-6 text-[#333] mx-auto mb-2" />
              <p className="text-xs text-[#555]">No active services found. Contact your account manager.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
