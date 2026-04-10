'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Bell, Shield, Palette, Smartphone, ChevronRight, Check,
  Moon, Sun, Monitor, Globe, Lock, Eye, EyeOff, Save, LogOut, Trash2,
  AlertTriangle, Volume2, Mail, Phone, ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'profile' | 'notifications' | 'security' | 'appearance' | 'sessions';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'sessions', label: 'Sessions', icon: Smartphone },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 ${on ? 'bg-[#b6332e] border-[#b6332e]' : 'bg-transparent border-[rgba(255,255,255,0.1)]'}`}>
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function ProfileTab({ user }: { user: any }) {
  const [form, setForm] = useState({ name: user?.name ?? '', title: user?.title ?? '', timezone: user?.timezone ?? 'America/Toronto', bio: '' });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-[#eee] mb-5">Profile Information</h2>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#b6332e]/20 border border-[#b6332e]/30 flex items-center justify-center text-2xl font-black text-[#b6332e]">
            {form.name.charAt(0)}
          </div>
          <div>
            <button className="btn-secondary text-xs mb-1">Change Photo</button>
            <p className="text-[10px] text-[#444]">JPG, PNG or WebP · Max 2MB</p>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="section-label mb-2 block">Full Name</label>
            <input type="text" className="os-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="section-label mb-2 block">Email Address</label>
            <input type="email" className="os-input" value={user?.email} disabled />
            <p className="text-[10px] text-[#444] mt-1">Contact admin to change email</p>
          </div>
          <div>
            <label className="section-label mb-2 block">Title / Role Description</label>
            <input type="text" className="os-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Video Editor" />
          </div>
          <div>
            <label className="section-label mb-2 block">Timezone</label>
            <select className="os-input cursor-pointer" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
              <option value="America/Toronto">America/Toronto (EST)</option>
              <option value="America/Vancouver">America/Vancouver (PST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Chicago">America/Chicago (CST)</option>
              <option value="America/Denver">America/Denver (MST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            </select>
          </div>
          <div>
            <label className="section-label mb-2 block">Bio (optional)</label>
            <textarea className="os-input resize-none" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio visible to team members..." />
          </div>
          <button onClick={save} className="btn-primary text-xs">
            {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailNudges: true, emailMilestones: true, emailInvoices: true, emailChat: false,
    pushNudges: true, pushChat: true, pushProofs: true, pushSystem: false,
    smsUrgent: false, digestFreq: 'daily' as 'realtime' | 'daily' | 'weekly',
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-sm font-bold text-[#eee]">Notification Preferences</h2>

      {[
        {
          title: 'Email Notifications', icon: Mail, rows: [
            { key: 'emailNudges', label: 'Nudge Alerts' },
            { key: 'emailMilestones', label: 'Milestone Updates' },
            { key: 'emailInvoices', label: 'Invoice & Payment' },
            { key: 'emailChat', label: 'Chat Messages (digest)' },
          ],
        },
        {
          title: 'Push Notifications', icon: Bell, rows: [
            { key: 'pushNudges', label: 'Nudge Triggered' },
            { key: 'pushChat', label: 'New Chat Messages' },
            { key: 'pushProofs', label: 'Proof Submissions' },
            { key: 'pushSystem', label: 'System Announcements' },
          ],
        },
        {
          title: 'SMS / Phone', icon: Phone, rows: [
            { key: 'smsUrgent', label: 'Urgent Escalations Only' },
          ],
        },
      ].map(section => (
        <div key={section.title} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <section.icon className="w-4 h-4 text-[#555]" />
            <p className="text-xs font-bold text-[#eee]">{section.title}</p>
          </div>
          <div className="space-y-3">
            {section.rows.map(row => (
              <div key={row.key} className="flex items-center justify-between">
                <span className="text-xs text-[#888]">{row.label}</span>
                <Toggle on={prefs[row.key as keyof typeof prefs] as boolean} onChange={() => toggle(row.key as keyof typeof prefs)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="glass-panel rounded-2xl p-5">
        <p className="text-xs font-bold text-[#eee] mb-3">Email Digest Frequency</p>
        <div className="flex gap-2">
          {(['realtime', 'daily', 'weekly'] as const).map(f => (
            <button key={f} onClick={() => setPrefs(p => ({ ...p, digestFreq: f }))}
              className={`flex-1 text-xs py-2 rounded-xl border capitalize transition-all ${prefs.digestFreq === f ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary text-xs"><Save className="w-3.5 h-3.5" /> Save Preferences</button>
    </div>
  );
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [saved, setSaved] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-sm font-bold text-[#eee]">Security Settings</h2>

      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-[#eee]">Change Password</p>
        <div>
          <label className="section-label mb-1.5 block">Current Password</label>
          <div className="relative">
            <input type={showCurrent ? 'text' : 'password'} className="os-input pr-10" placeholder="••••••••" />
            <button onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="section-label mb-1.5 block">New Password</label>
          <div className="relative">
            <input type={showNew ? 'text' : 'password'} className="os-input pr-10" placeholder="Min 12 characters" />
            <button onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="btn-primary text-xs">
          {saved ? '✓ Password Updated' : <><Lock className="w-3.5 h-3.5" /> Update Password</>}
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#eee]">Two-Factor Authentication</p>
            <p className="text-[10px] text-[#555] mt-0.5">Require TOTP code on every login</p>
          </div>
          <Toggle on={twoFA} onChange={() => setTwoFA(s => !s)} />
        </div>
        {twoFA && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl p-3">
            <p className="text-[10px] text-[#10b981]">✓ 2FA will be enabled on next login. You'll receive a QR code by email.</p>
          </motion.div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-[rgba(182,51,46,0.15)]">
        <p className="text-xs font-bold text-[#b6332e] mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Danger Zone</p>
        <div className="space-y-2">
          <button onClick={logout} className="btn-secondary text-xs border-[rgba(182,51,46,0.3)] text-[#b6332e] hover:bg-[rgba(182,51,46,0.08)] w-full justify-start">
            <LogOut className="w-3.5 h-3.5" /> Sign Out of All Devices
          </button>
          <button className="btn-ghost text-xs text-[#444] w-full justify-start hover:text-[#b6332e]">
            <Trash2 className="w-3.5 h-3.5" /> Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState<'oled' | 'dark' | 'system'>('oled');
  const [accent, setAccent] = useState('#b6332e');
  const [density, setDensity] = useState<'compact' | 'default' | 'comfortable'>('default');
  const [animations, setAnimations] = useState(true);
  const [font, setFont] = useState('inter');
  const [applied, setApplied] = useState(false);

  const ACCENTS = [
    { color: '#b6332e', name: 'Zenn Red' },
    { color: '#3b82f6', name: 'Cobalt' },
    { color: '#10b981', name: 'Emerald' },
    { color: '#8b5cf6', name: 'Violet' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#ec4899', name: 'Fuchsia' },
  ];

  const FONTS: Record<string, string> = {
    inter: "'Inter', sans-serif",
    outfit: "'Outfit', sans-serif",
    roboto: "'Roboto', sans-serif",
    mono: "'JetBrains Mono', monospace",
  };

  const applySettings = () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    // Accent color
    root.style.setProperty('--color-primary', accent);
    // Theme bg
    const bg = theme === 'oled' ? '#000000' : theme === 'dark' ? '#111111' : '';
    if (bg) root.style.setProperty('background-color', bg);
    else root.style.removeProperty('background-color');
    // Font
    root.style.setProperty('--font-sans', FONTS[font] ?? FONTS.inter);
    document.body.style.fontFamily = FONTS[font] ?? FONTS.inter;
    // Animations
    if (!animations) {
      root.style.setProperty('--tw-transition-duration', '0ms');
      document.body.classList.add('no-animations');
    } else {
      root.style.removeProperty('--tw-transition-duration');
      document.body.classList.remove('no-animations');
    }
    // Density: adjust base spacing
    const spacing = density === 'compact' ? '0.85' : density === 'comfortable' ? '1.15' : '1';
    root.style.setProperty('--density', spacing);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-sm font-bold text-[#eee]">Appearance</h2>

      {/* Theme */}
      <div className="glass-panel rounded-2xl p-5">
        <p className="text-xs font-bold text-[#eee] mb-3">Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {([['oled', '⬛ OLED Black'], ['dark', '🌑 Dark'], ['system', '⚙ System']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`text-xs py-2.5 rounded-xl border transition-all ${theme === t ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent */}
      <div className="glass-panel rounded-2xl p-5">
        <p className="text-xs font-bold text-[#eee] mb-3">Accent Color</p>
        <div className="flex gap-3 flex-wrap">
          {ACCENTS.map(a => (
            <button key={a.color} onClick={() => setAccent(a.color)} title={a.name}
              className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${accent === a.color ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
              style={{ background: a.color }} />
          ))}
        </div>
        <p className="text-[10px] text-[#444] mt-2">Selected: <span style={{ color: accent }}>{ACCENTS.find(a => a.color === accent)?.name}</span></p>
      </div>

      {/* Font */}
      <div className="glass-panel rounded-2xl p-5">
        <p className="text-xs font-bold text-[#eee] mb-3">Font Family</p>
        <div className="grid grid-cols-2 gap-2">
          {[['inter', 'Inter (Default)'], ['outfit', 'Outfit'], ['roboto', 'Roboto'], ['mono', 'JetBrains Mono']].map(([k, label]) => (
            <button key={k} onClick={() => setFont(k)}
              className={`text-[11px] py-2.5 rounded-xl border transition-all ${font === k ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
              style={{ fontFamily: FONTS[k] }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-[#eee]">Interface Options</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-[#888]">Animations & Transitions</span>
            <p className="text-[10px] text-[#555]">Disable for reduced motion</p>
          </div>
          <Toggle on={animations} onChange={() => setAnimations(s => !s)} />
        </div>
        <div>
          <p className="text-xs text-[#888] mb-2">UI Density</p>
          <div className="flex gap-2">
            {(['compact', 'default', 'comfortable'] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)}
                className={`flex-1 text-[11px] py-1.5 rounded-xl border capitalize transition-all ${density === d ? 'border-[rgba(182,51,46,0.4)] text-[#b6332e] bg-[rgba(182,51,46,0.08)]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={applySettings} className="btn-primary text-xs">
        <Save className="w-3.5 h-3.5" />
        {applied ? '✓ Applied!' : 'Apply Settings'}
      </button>
    </div>
  );
}

function SessionsTab() {
  const sessions = [
    { id: 1, device: 'MacBook Pro 14"', location: 'Toronto, ON', lastActive: 'Active now', browser: 'Chrome 123', current: true },
    { id: 2, device: 'iPhone 15 Pro', location: 'Toronto, ON', lastActive: '2 hours ago', browser: 'Safari Mobile', current: false },
    { id: 3, device: 'Windows PC', location: 'Vancouver, BC', lastActive: '3 days ago', browser: 'Edge 121', current: false },
  ];
  const [revoked, setRevoked] = useState<number[]>([]);

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-sm font-bold text-[#eee]">Active Sessions</h2>
      <div className="glass-panel rounded-2xl divide-y divide-[rgba(255,255,255,0.05)]">
        {sessions.filter(s => !revoked.includes(s.id)).map(s => (
          <div key={s.id} className="p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-[#555]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-bold text-[#eee] truncate">{s.device}</p>
                {s.current && <span className="text-[9px] text-[#10b981] bg-[rgba(16,185,129,0.1)] px-1.5 py-0.5 rounded-full">Current</span>}
              </div>
              <p className="text-[10px] text-[#555]">{s.browser} · {s.location}</p>
              <p className="text-[10px] text-[#444] mt-0.5">{s.lastActive}</p>
            </div>
            {!s.current && (
              <button onClick={() => setRevoked(r => [...r, s.id])} className="text-[10px] text-[#b6332e] hover:underline px-2 py-1 flex-shrink-0">
                Revoke
              </button>
            )}
          </div>
        ))}
        {revoked.length > 0 && (
          <div className="p-3 text-center">
            <p className="text-[10px] text-[#555]">{revoked.length} session{revoked.length > 1 ? 's' : ''} revoked</p>
          </div>
        )}
      </div>
      <button className="btn-secondary text-xs text-[#b6332e] border-[rgba(182,51,46,0.3)]">
        <LogOut className="w-3.5 h-3.5" /> Sign Out All Other Sessions
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const CONTENT: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab user={user} />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
    sessions: <SessionsTab />,
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-[#eee]">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${activeTab === t.id ? 'bg-[rgba(182,51,46,0.1)] text-[#b6332e]' : 'text-[#888] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#eee]'}`}
            >
              <t.icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{t.label}</span>
              {activeTab === t.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-panel rounded-2xl p-6">
              {CONTENT[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
