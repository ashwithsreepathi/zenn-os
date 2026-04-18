'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, ChevronDown, Eye, X, Check, AlertTriangle, MessageSquare, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserRole } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

const BREADCRUMBS: Record<string, string> = {
  '/admin/executive-dashboard': 'Executive Dashboard',
  '/admin/projects': 'Projects',
  '/admin/ledger': 'Financial Ledger',
  '/admin/payout': 'Payout Allocator',
  '/admin/personnel': 'Personnel Directory',
  '/admin/intake': 'Inquiry Inbox',
  '/admin/quotation': 'Quotation Maker',
  '/admin/calendar': 'Master Calendar',
  '/admin/dependency': 'Dependency Architect',
  '/admin/contracts': 'IP & Contracts',
  '/admin/permissions': 'Permission Matrix',
  '/admin/analytics': 'Analytics',
  '/admin/equipment': 'Equipment Tracker',
  '/admin/nudge': 'Nudge Logic',
  '/team/assigned-board': 'My Projects',
  '/team/vault': 'Project Vault',
  '/team/submission': 'Proof Submission',
  '/team/milestone-update': 'Milestone Update',
  '/team/calendar': 'My Calendar',
  '/team/legal': 'Legal & IP',
  '/portal/client-dashboard': 'Project Hub',
  '/portal/proof-review': 'Proof Review',
  '/portal/billing': 'Billing',
  '/portal/asset-vault': 'Assets',
  '/chat': 'Chat Hub',
  '/search': 'Global Search',
  '/settings': 'Settings',
};

// Mock notifications
interface Notification {
  id: string;
  type: 'nudge' | 'proof' | 'message' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'nudge', title: 'Nudge Triggered', body: 'Jordan Vance hasn\'t submitted Phase 3 edits.', time: '5m ago', read: false, href: '/admin/nudge' },
  { id: 'n2', type: 'proof', title: 'Proof Ready for Review', body: 'BFB Campaign — Phase 2 deliverables submitted.', time: '1h ago', read: false, href: '/portal/proof-review' },
  { id: 'n3', type: 'message', title: 'New Chat Message', body: 'Taylor Brooks: Can we push the deadline?', time: '2h ago', read: false, href: '/chat' },
  { id: 'n4', type: 'system', title: 'Invoice Overdue', body: 'Montax Financial — Invoice #INV-006 is 14 days overdue.', time: '1d ago', read: true, href: '/admin/ledger' },
  { id: 'n5', type: 'nudge', title: 'Milestone Advanced', body: 'MyCrossCanada — Discovery phase marked complete.', time: '2d ago', read: true, href: '/admin/projects' },
];

const NOTIF_ICON: Record<string, React.ElementType> = {
  nudge: Zap, proof: Check, message: MessageSquare, system: AlertTriangle,
};
const NOTIF_COLOR: Record<string, string> = {
  nudge: '#f59e0b', proof: '#10b981', message: '#3b82f6', system: '#b6332e',
};



export function Topbar() {
  const pathname = usePathname();
  const { user, impersonating, stopImpersonation, startImpersonation } = useAuth();
  const router = useRouter();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [clientOptions, setClientOptions] = useState<{label: string, role: UserRole, userId?: string}[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      supabase.from('os_users').select('id,name,company').eq('role', 'client').then(({ data }) => {
        if (data) {
          setClientOptions(data.map(u => ({
            label: `${u.name.split(' ')[0]}'s View (${u.company ?? 'Client'})`,
            role: 'client' as UserRole,
            userId: u.id,
          })));
        }
      });
    }
  }, [user?.role]);

  const VIEW_AS_OPTIONS = [
    { label: 'Employee View', role: 'employee' as UserRole, userId: undefined },
    { label: 'Affiliate View', role: 'affiliate' as UserRole, userId: undefined },
    ...clientOptions,
  ];

  const pageTitle = BREADCRUMBS[pathname] ?? 'Zenn OS';
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <>
      {/* Impersonation Banner */}
      <AnimatePresence>
        {impersonating && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#b6332e] text-white flex items-center justify-between px-6 text-xs font-semibold overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              Viewing as <strong className="capitalize ml-1">[{impersonating} mode]</strong>
            </div>
            <button onClick={stopImpersonation} className="underline hover:no-underline">Exit View</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-14 bg-[#050505] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-sm text-[#eee]">{pageTitle}</p>
            <p className="text-[10px] text-[#444] font-mono">Zenn OS</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => router.push('/search')}
            className="hidden md:flex items-center gap-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 text-[#444] text-xs hover:border-[rgba(255,255,255,0.12)] hover:text-[#888] transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="bg-[#111] px-1.5 py-0.5 rounded text-[10px] text-[#333]">⌘K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifDrawer(s => !s); setShowRoleMenu(false); }}
              className="relative w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#444] hover:text-[#888] hover:border-[rgba(255,255,255,0.12)] transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b6332e] rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifDrawer && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-panel-elevated rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden z-50 shadow-2xl"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
                    <h3 className="text-xs font-bold text-[#eee]">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-[#555] hover:text-[#888] transition-colors">Mark all read</button>
                      )}
                      <button onClick={() => setShowNotifDrawer(false)}><X className="w-3.5 h-3.5 text-[#444] hover:text-white" /></button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-6 h-6 text-[#222] mx-auto mb-2" />
                        <p className="text-xs text-[#444]">All caught up!</p>
                      </div>
                    ) : notifications.map(notif => {
                      const Icon = NOTIF_ICON[notif.type] ?? Bell;
                      return (
                        <button key={notif.id}
                          onClick={() => { markRead(notif.id); router.push(notif.href); setShowNotifDrawer(false); }}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[rgba(255,255,255,0.03)] transition-colors ${!notif.read ? 'bg-[rgba(255,255,255,0.015)]' : ''}`}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${NOTIF_COLOR[notif.type]}15` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: NOTIF_COLOR[notif.type] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-bold ${notif.read ? 'text-[#666]' : 'text-[#eee]'} truncate`}>{notif.title}</p>
                              <span className="text-[9px] text-[#444] flex-shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[10px] text-[#555] mt-0.5 line-clamp-2">{notif.body}</p>
                          </div>
                          {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-[#b6332e] mt-1.5 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-[rgba(255,255,255,0.05)]">
                    <button className="w-full text-[10px] text-[#555] hover:text-[#888] py-1.5 transition-colors">View all notifications →</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View As (Admin only) */}
          {user?.role === 'admin' && !impersonating && (
            <div className="relative">
              <button
                onClick={() => { setShowRoleMenu(s => !s); setShowNotifDrawer(false); }}
                className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 text-[#555] text-xs hover:border-[rgba(255,255,255,0.12)] hover:text-[#888] transition-all"
              >
                <Eye className="w-3 h-3" />
                <span>View As</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showRoleMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 w-52 glass-panel-elevated rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden z-50 shadow-xl"
                  >
                    {VIEW_AS_OPTIONS.map(opt => (
                      <button
                        key={opt.userId ?? opt.role}
                        onClick={() => { startImpersonation(opt.role, opt.userId); setShowRoleMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-3 h-3 flex-shrink-0 opacity-40" />
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-lg bg-[#b6332e]/20 border border-[#b6332e]/30 flex items-center justify-center">
            <span className="text-xs font-bold text-[#b6332e]">
              {user?.name?.charAt(0) ?? 'Z'}
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
