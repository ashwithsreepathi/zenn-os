/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  Search, Hash, Lock, Shield, Send, Image as ImageIcon, Paperclip,
  Plus, X, AtSign, MessageSquare, Users, Check,
} from 'lucide-react';

interface ChannelRow {
  id: string; name: string; type: string; project_id: string | null;
  members: string[]; last_message_at: string | null;
}
interface MessageRow {
  id: string; channel_id: string; sender_id: string; sender_name: string | null;
  sender_role: string | null; content: string; is_action_required: boolean;
  created_at: string;
}
interface UserRow { id: string; name: string; role: string; email: string; }

function generateId() { return `msg_${Date.now().toString(36)}`; }

export default function ChatHub() {
  const { user, impersonating, impersonatingUserId } = useAuth();

  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<MessageRow[]>([]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadName, setNewThreadName] = useState('');
  const [newThreadType, setNewThreadType] = useState<'client_shared' | 'agency_internal'>('agency_internal');
  const [newThreadMembers, setNewThreadMembers] = useState<string[]>([]);
  const [channelSearch, setChannelSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    const [chRes, userRes] = await Promise.all([
      supabase.from('os_channels').select('*').order('last_message_at', { ascending: false }),
      supabase.from('os_users').select('id,name,role,email'),
    ]);
    const allChannels = chRes.data ?? [] as any /* eslint-disable-line @typescript-eslint/no-explicit-any */[];
    const allUsers = userRes.data ?? [] as any /* eslint-disable-line @typescript-eslint/no-explicit-any */[];
    setChannels(allChannels as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);
    setUsers(allUsers as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    // Resolve current user
    const resolvedId = impersonating ? impersonatingUserId : user?.id;
    const me = allUsers.find((u) => u.id === resolvedId) ?? allUsers.find((u) => u.role === 'admin') ?? null;
    setCurrentUser(me);

    if (allChannels.length && !activeChannelId) {
      setActiveChannelId((allChannels[0] as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).id);
    }
  }

  async function loadMessages(channelId: string) {
    const { data } = await supabase.from('os_messages').select('*')
      .eq('channel_id', channelId).order('created_at', { ascending: true });
    setMessages(data ?? [] as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [user, impersonating]);

  useEffect(() => {
    if (activeChannelId) loadMessages(activeChannelId);
    setLocalMessages([]);
  }, [activeChannelId]);

  const myChannels = channels.filter((c) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (c.type === 'agency_internal' && currentUser.role === 'client') return false;
    if (c.type === 'executive_only') return false;
    return (c.members ?? []).includes(currentUser.id);
  }).filter((c) => channelSearch === '' || c.name.toLowerCase().includes(channelSearch.toLowerCase()));

  const activeChannel = myChannels.find((c) => c.id === activeChannelId) ?? myChannels[0];
  const allChannelMessages = [...messages, ...localMessages.filter((m) => m.channel_id === activeChannel?.id)]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !activeChannel || !currentUser) return;

    const optimistic: MessageRow = {
      id: generateId(), channel_id: activeChannel.id, sender_id: currentUser.id,
      sender_name: currentUser.name, sender_role: currentUser.role,
      content: trimmed, is_action_required: false, created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Persist to DB
    await supabase.from('os_messages').insert({
      channel_id: activeChannel.id, sender_id: currentUser.id,
      sender_name: currentUser.name, sender_role: currentUser.role, content: trimmed,
    } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    // Update channel last_message_at
    await supabase.from('os_channels').update({ last_message_at: new Date().toISOString() } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).eq('id', activeChannel.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const createThread = async () => {
    if (!newThreadName.trim() || !currentUser) return;
    const members = Array.from(new Set([currentUser.id, ...newThreadMembers]));
    const { data } = await supabase.from('os_channels').insert({
      name: newThreadName.trim().toLowerCase().replace(/\s+/g, '-'),
      type: newThreadType, members,
    } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).select().single();
    if (data) {
      setChannels((prev) => [data as ChannelRow, ...prev]);
      setActiveChannelId((data as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).id);
    }
    setShowNewThread(false);
    setNewThreadName('');
    setNewThreadMembers([]);
  };

  const channelIcon = (c: ChannelRow) => {
    if (c.type === 'executive_only') return <Shield className="w-3.5 h-3.5 flex-shrink-0 text-[#b6332e]" />;
    if (c.type === 'agency_internal') return <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#555]" />;
    return <Hash className="w-3.5 h-3.5 flex-shrink-0 text-[#555]" />;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -mx-6 -my-6 bg-black">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#050505] border-r border-[rgba(255,255,255,0.05)] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#eee]">Zenn Chat</h2>
            <button onClick={() => setShowNewThread(true)}
              className="w-6 h-6 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#555] hover:text-[#eee] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
            <input type="text" value={channelSearch} onChange={(e) => setChannelSearch(e.target.value)}
              placeholder="Search channels..." className="os-input pl-9 text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Client Channels */}
          {myChannels.filter((c) => c.type === 'client_shared').length > 0 && (
            <div>
              <p className="px-3 mb-2 text-[10px] font-bold text-[#555] uppercase tracking-widest">Client Projects</p>
              <div className="space-y-0.5">
                {myChannels.filter((c) => c.type === 'client_shared').map((c) => (
                  <button key={c.id} onClick={() => setActiveChannelId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${activeChannel?.id === c.id ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e]' : 'text-[#777] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#eee]'}`}>
                    {channelIcon(c)} <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Internal Channels */}
          {currentUser?.role !== 'client' && myChannels.filter((c) => c.type !== 'client_shared').length > 0 && (
            <div>
              <p className="px-3 mb-2 text-[10px] font-bold text-[#555] uppercase tracking-widest">Internal Teams</p>
              <div className="space-y-0.5">
                {myChannels.filter((c) => c.type !== 'client_shared').map((c) => (
                  <button key={c.id} onClick={() => setActiveChannelId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${activeChannel?.id === c.id ? 'bg-[rgba(255,255,255,0.08)] text-[#eee]' : 'text-[#777] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#eee]'}`}>
                    {channelIcon(c)} <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current User */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#b6332e]/20 border border-[#b6332e]/30 flex items-center justify-center text-[10px] font-bold text-[#b6332e]">
            {currentUser?.name.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#eee] truncate">{currentUser?.name ?? 'Loading...'}</p>
            <p className="text-[9px] text-[#555] capitalize">{currentUser?.role ?? ''}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#10b981]" title="Online" />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#020202] min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-6 bg-[#050505] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {activeChannel && channelIcon(activeChannel)}
            <h3 className="font-bold text-[#eee] text-sm truncate">{activeChannel?.name ?? 'Select a channel'}</h3>
            {activeChannel?.type === 'executive_only' && (
              <span className="text-[9px] text-[#b6332e] border border-[rgba(182,51,46,0.3)] px-1.5 py-0.5 rounded">EXEC ONLY</span>
            )}
          </div>
          <div className="flex -space-x-2">
            {(activeChannel?.members ?? []).slice(0, 4).map((id) => {
              const u = users.find((u) => u.id === id);
              return (
                <div key={id} title={u?.name} className="w-6 h-6 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[9px] font-bold text-[#888]">
                  {u?.name.charAt(0) ?? '?'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {allChannelMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-10 h-10 text-[#1a1a1a] mb-3" />
              <p className="text-sm font-bold text-[#333]">No messages yet</p>
              <p className="text-xs text-[#444] mt-1">Be the first to say something in #{activeChannel?.name}</p>
            </div>
          )}
          {allChannelMessages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            const sender = users.find((u) => u.id === msg.sender_id);
            return (
              <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${isMe ? 'bg-[#b6332e]/20 text-[#b6332e]' : 'bg-[#1a1a1a] text-[#888]'}`}>
                  {(sender?.name ?? msg.sender_name ?? '?').charAt(0)}
                </div>
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[11px] font-bold text-[#ccc]">{sender?.name ?? msg.sender_name}</span>
                    <span className="text-[9px] text-[#555] font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-[#b6332e] text-white rounded-tr-sm' : 'bg-white/[0.04] border border-white/[0.05] text-[#ddd] rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                  {msg.is_action_required && !isMe && (
                    <div className="mt-2 bg-[rgba(182,51,46,0.1)] border border-[rgba(182,51,46,0.3)] rounded-xl p-3 max-w-xs">
                      <p className="text-xs text-[#b6332e] font-bold mb-2">⚡ Action Required</p>
                      <button className="btn-primary text-[10px] py-1 w-full justify-center">Respond</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#050505] border-t border-[rgba(255,255,255,0.05)] flex-shrink-0">
          <div className="glass-panel-elevated rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] overflow-hidden">
            <textarea ref={textareaRef} rows={1} value={message} onChange={handleTextareaChange} onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannel?.name ?? 'channel'}... (Enter to send)`}
              className="w-full bg-transparent border-0 ring-0 resize-none text-sm text-[#eee] px-4 pt-3 pb-2 min-h-[44px] focus:outline-none" />
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex gap-2 text-[#555]">
                <button className="hover:text-[#eee] transition-colors p-1"><Paperclip className="w-4 h-4" /></button>
                <button className="hover:text-[#eee] transition-colors p-1"><ImageIcon className="w-4 h-4" /></button>
                <button className="hover:text-[#eee] transition-colors p-1"><AtSign className="w-4 h-4" /></button>
              </div>
              <button onClick={handleSend} disabled={!message.trim()}
                className="w-8 h-8 rounded-lg bg-[#b6332e] flex items-center justify-center text-white hover:bg-[#d03e39] disabled:opacity-30 transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-[#333] text-center mt-2 font-mono">Shift+Enter for new line · messages saved to database</p>
        </div>
      </div>

      {/* New Thread Modal */}
      <AnimatePresence>
        {showNewThread && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewThread(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#eee]">New Thread</h3>
                <button onClick={() => setShowNewThread(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Thread Name</label>
                <input type="text" className="os-input" placeholder="e.g. montax-design-review" value={newThreadName}
                  onChange={(e) => setNewThreadName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && createThread()} />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['agency_internal', 'client_shared'] as const).map((t) => (
                    <button key={t} onClick={() => setNewThreadType(t)}
                      className={`text-[11px] py-2 rounded-xl border font-semibold transition-all ${newThreadType === t ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                      {t === 'agency_internal' ? '🔒 Internal' : '# Client Shared'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="section-label mb-2 block">Add People ({newThreadMembers.length} selected)</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {users.filter((u) => u.id !== currentUser?.id && (newThreadType === 'client_shared' || u.role !== 'client')).map((u) => {
                    const sel = newThreadMembers.includes(u.id);
                    return (
                      <button key={u.id} onClick={() => setNewThreadMembers((m) => sel ? m.filter((id) => id !== u.id) : [...m, u.id])}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] border transition-all text-left ${sel ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                        <span className="w-6 h-6 rounded-full bg-[#111] flex items-center justify-center text-[9px] font-bold flex-shrink-0">{u.name.charAt(0)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{u.name.split(' ')[0]}</p>
                          <p className="text-[9px] opacity-60 capitalize">{u.role}</p>
                        </div>
                        {sel && <Check className="w-3 h-3 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={createThread} disabled={!newThreadName.trim()} className="btn-primary w-full justify-center text-xs disabled:opacity-40">
                Create Thread
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
