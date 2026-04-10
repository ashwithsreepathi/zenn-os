'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, CreditCard, Users, Inbox, CalendarDays,
  GitBranch, FileText, Grid, BarChart2, Package,
  FolderOpen, ClipboardList, Upload, Calendar, File,
  Monitor, ClipboardCheck, Receipt, DownloadCloud, Bell,
  MessageSquare, Search, Settings, ChevronRight, ChevronLeft,
  LogOut, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import type { UserRole } from '@/lib/types';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Command',
    items: [
      { id: 'exec-dash', label: 'Executive Dashboard', href: '/admin/executive-dashboard', icon: LayoutDashboard, roles: ['admin'] },
      { id: 'ledger', label: 'Financial Ledger', href: '/admin/ledger', icon: BookOpen, roles: ['admin'] },
      { id: 'payout', label: 'Payout Allocator', href: '/admin/payout', icon: CreditCard, roles: ['admin'] },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id: 'projects', label: 'Projects', href: '/admin/projects', icon: FolderOpen, roles: ['admin'], badge: undefined },
      { id: 'personnel', label: 'Personnel Directory', href: '/admin/personnel', icon: Users, roles: ['admin'] },
      { id: 'intake', label: 'Inquiry Inbox', href: '/admin/intake', icon: Inbox, roles: ['admin'], badge: 'New' },
      { id: 'quotation', label: 'Quotation Maker', href: '/admin/quotation', icon: FileText, roles: ['admin'] },
      { id: 'calendar', label: 'Master Calendar', href: '/admin/calendar', icon: CalendarDays, roles: ['admin'] },
      { id: 'dependency', label: 'Dependency Architect', href: '/admin/dependency', icon: GitBranch, roles: ['admin'] },
      { id: 'contracts', label: 'IP & Contracts', href: '/admin/contracts', icon: File, roles: ['admin'] },
      { id: 'permissions', label: 'Permission Matrix', href: '/admin/permissions', icon: Grid, roles: ['admin'] },
      { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart2, roles: ['admin'] },
      { id: 'equipment', label: 'Equipment Tracker', href: '/admin/equipment', icon: Package, roles: ['admin'] },
    ]
  },
  {
    label: 'My Work',
    items: [
      { id: 'assigned', label: 'My Projects', href: '/team/assigned-board', icon: FolderOpen, roles: ['employee', 'affiliate'] },
      { id: 'vault', label: 'Project Vault', href: '/team/vault', icon: ClipboardList, roles: ['employee', 'affiliate', 'admin'] },
      { id: 'submission', label: 'Proof Submission', href: '/team/submission', icon: Upload, roles: ['employee', 'affiliate'] },
      { id: 'milestone-update', label: 'Milestone Update', href: '/team/milestone-update', icon: Activity, roles: ['employee', 'affiliate'] },
      { id: 'my-calendar', label: 'My Calendar', href: '/team/calendar', icon: Calendar, roles: ['employee', 'affiliate'] },
      { id: 'legal', label: 'Legal & IP', href: '/team/legal', icon: File, roles: ['employee', 'affiliate'] },
    ]
  },
  {
    label: 'Client Portal',
    items: [
      { id: 'client-dash', label: 'Project Hub', href: '/portal/client-dashboard', icon: Monitor, roles: ['client'] },
      { id: 'proof-review', label: 'Proof Review', href: '/portal/proof-review', icon: ClipboardCheck, roles: ['client'] },
      { id: 'billing', label: 'Billing', href: '/portal/billing', icon: Receipt, roles: ['client'] },
      { id: 'asset-vault', label: 'Asset Vault', href: '/portal/asset-vault', icon: DownloadCloud, roles: ['client'] },
    ]
  },
  {
    label: 'Platform',
    items: [
      { id: 'nudge', label: 'Nudge Logic', href: '/admin/nudge', icon: Bell, roles: ['admin'], badge: '3' },
      { id: 'chat', label: 'Chat Hub', href: '/chat', icon: MessageSquare, roles: ['admin', 'employee', 'affiliate', 'client'] },
      { id: 'search', label: 'Global Search', href: '/search', icon: Search, roles: ['admin', 'employee', 'affiliate', 'client'] },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'employee', 'affiliate', 'client'] },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, impersonating } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const activeRole: UserRole = (impersonating ?? user?.role ?? 'client');

  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(activeRole))
  })).filter(section => section.items.length > 0);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 bg-[#050505] border-r border-[rgba(255,255,255,0.05)] flex flex-col overflow-hidden relative"
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-[rgba(255,255,255,0.05)] flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-[#b6332e] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm leading-none">Z</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-black text-sm tracking-tight text-white whitespace-nowrap"
            >
              ZENN OS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none py-4 space-y-1 px-2">
        {filteredSections.map((section) => (
          <div key={section.label} className="mb-4">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="section-label px-3 mb-2"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#b6332e]' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge && (
                    <span className="ml-auto text-[10px] font-bold bg-[#b6332e] text-white px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`border-t border-[rgba(255,255,255,0.05)] p-3 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#888]">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#ccc] truncate">{user.name}</p>
              <p className="text-[10px] text-[#444] truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title="Logout"
          className={`flex items-center gap-2 text-[#444] hover:text-[#b6332e] transition-colors text-xs w-full rounded-lg px-2 py-1.5 hover:bg-[rgba(182,51,46,0.06)] ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#555] hover:text-white hover:border-[#b6332e] transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
