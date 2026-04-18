/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ExternalLink, MessageCircle, FileText, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProofReview() {
  const [playing, setPlaying] = useState(false);
  const [annotations, setAnnotations] = useState<{ id: string; time: string; text: string; resolved: boolean }[]>([
    { id: '1', time: '0:14', text: 'Can we warm up the skin tones here slightly?', resolved: false },
    { id: '2', time: '0:32', text: 'Logo seems a bit small on mobile safe zones.', resolved: true }
  ]);
  const [newAnnotation, setNewAnnotation] = useState('');

  const addAnnotation = () => {
    if (!newAnnotation.trim()) return;
    setAnnotations([...annotations, { id: Math.random().toString(), time: '0:45', text: newAnnotation, resolved: false }]);
    setNewAnnotation('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -mx-6 -my-6 bg-black">
      {/* Topbar override */}
      <div className="h-14 bg-[#050505] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-6 flex-shrink-0 z-40 relative">
        <div className="flex items-center gap-4">
          <Link href="/portal/client-dashboard" className="text-[#555] hover:text-[#eee] transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
          <div>
            <p className="font-semibold text-sm text-[#eee]">BFB_Spring_Campaign_v02.mp4</p>
            <p className="text-[10px] text-[#555] font-mono tracking-widest uppercase">Proof Review · Version 2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost text-xs"><XCircle className="w-3.5 h-3.5" /> Request Revisions</button>
          <button className="btn-primary text-xs shadow-[0_0_20px_rgba(182,51,46,0.3)]"><CheckCircle className="w-3.5 h-3.5" /> Approve Deliverable</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Media Player Area */}
        <div className="flex-1 bg-[#020202] relative flex flex-col p-6">
          <div className="flex-1 bg-[#111] rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden flex items-center justify-center">
            {/* Mock Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <span className="text-4xl text-[#333] font-bold">16:9 PROOF AREA</span>
            </div>
            {/* Player Controls (Mock) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel-elevated rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
              <button className="text-[#eee] hover:text-[#b6332e] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setPlaying(!playing)} className="w-10 h-10 rounded-full bg-[#eee] text-black flex items-center justify-center hover:bg-[#b6332e] hover:text-white transition-colors">
                {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <button className="text-[#eee] hover:text-[#b6332e] transition-colors"><ChevronLeft className="w-5 h-5 rotate-180" /></button>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-4">
             <div className="text-xs font-mono text-[#888]">0:45 / 1:30</div>
             <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full relative cursor-pointer">
                <div className="absolute top-0 left-0 h-full bg-[#b6332e] rounded-full" style={{ width: '50%' }} />
                {/* Annotation markers */}
                {annotations.map(a => (
                  <div key={a.id} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ left: a.time === '0:14' ? '15%' : a.time === '0:32' ? '35%' : '50%' }} />
                ))}
             </div>
          </div>
        </div>

        {/* Annotation Sidebar */}
        <div className="w-[380px] bg-[#050505] border-l border-[rgba(255,255,255,0.05)] flex flex-col">
          <div className="p-5 border-b border-[rgba(255,255,255,0.05)]">
            <h2 className="text-sm font-bold text-[#eee]">Annotations</h2>
            <p className="text-xs text-[#555] mt-1">{annotations.filter(a => !a.resolved).length} unresolved notes</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence>
              {annotations.map(a => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl border ${a.resolved ? 'bg-[#111] border-[rgba(255,255,255,0.03)] opacity-50' : 'bg-[#0a0a0a] border-[rgba(255,255,255,0.08)]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#b6332e] bg-[rgba(182,51,46,0.1)] px-2 py-0.5 rounded">{a.time}</span>
                    {a.resolved && <span className="text-[9px] text-[#10b981] font-bold uppercase">Resolved</span>}
                  </div>
                  <p className={`text-xs ${a.resolved ? 'text-[#666] line-through' : 'text-[#ddd]'}`}>{a.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-5 border-t border-[rgba(255,255,255,0.05)] bg-[#0a0a0a]">
            <div className="relative">
              <input
                type="text"
                value={newAnnotation}
                onChange={e => setNewAnnotation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAnnotation()}
                placeholder="Add note at 0:45..."
                className="os-input pr-10 text-xs"
              />
              <button onClick={addAnnotation} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#b6332e] transition-colors"><MessageCircle className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
