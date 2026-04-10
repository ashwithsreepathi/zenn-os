'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login, isLoading, detectEmailDomain } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [identityReveal, setIdentityReveal] = useState<null | 'admin' | 'client' | 'team'>(null);
  const [cardPulse, setCardPulse] = useState(false);

  // The "Identity Reveal" — fires on email blur
  const handleEmailBlur = () => {
    if (!email) return;
    const { role, isAdmin } = detectEmailDomain(email);

    if (isAdmin) {
      setIdentityReveal('admin');
      setCardPulse(true);
      setTimeout(() => setCardPulse(false), 2000);
    } else if (role === 'client') {
      setIdentityReveal('client');
    } else if (role === 'affiliate' || role === 'employee') {
      setIdentityReveal('team');
    } else {
      setIdentityReveal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      router.push(result.redirectTo);
    } else {
      setError(result.error ?? 'Authentication failed.');
    }
  };

  const borderClass = cardPulse
    ? 'border-[#b6332e] shadow-[0_0_30px_rgba(182,51,46,0.25)]'
    : identityReveal === 'admin'
    ? 'border-[rgba(182,51,46,0.4)]'
    : 'border-[rgba(255,255,255,0.06)]';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(182,51,46,0.06)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(182,51,46,0.04)_0%,_transparent_60%)] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo + Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-[#b6332e] flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none">Z</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white">ZENN OS</span>
          </motion.div>
          <p className="text-sm text-[#666] font-mono tracking-wider uppercase">Secure Unified Entry</p>
        </div>

        {/* Login Card */}
        <motion.div
          className={`glass-panel rounded-2xl p-8 transition-all duration-700 ${borderClass}`}
          animate={cardPulse ? { boxShadow: ['0 0 0px rgba(182,51,46,0)', '0 0 40px rgba(182,51,46,0.3)', '0 0 15px rgba(182,51,46,0.15)'] } : {}}
          transition={{ duration: 1.5 }}
        >
          {/* Identity Reveal Banner */}
          <AnimatePresence>
            {identityReveal && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className={`rounded-lg px-4 py-3 text-xs font-medium flex items-center gap-2 ${
                  identityReveal === 'admin'
                    ? 'bg-[rgba(182,51,46,0.12)] border border-[rgba(182,51,46,0.3)] text-[#b6332e]'
                    : identityReveal === 'client'
                    ? 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#aaa]'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#aaa]'
                }`}>
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  {identityReveal === 'admin' && 'Administrator identity recognized. Elevated security active.'}
                  {identityReveal === 'client' && 'Client portal access confirmed. Workspace loading...'}
                  {identityReveal === 'team' && 'Team member identity confirmed. Production board ready.'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="section-label mb-2 block">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="you@domain.com"
                required
                className="os-input"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="section-label mb-2 block">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="os-input pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-[#b6332e] text-xs bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.2)] rounded-lg px-3 py-2.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              id="enter-ecosystem-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#b6332e] hover:bg-[#d03e39] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(182,51,46,0.2)] hover:shadow-[0_0_30px_rgba(182,51,46,0.35)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Ecosystem
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="mt-6 flex items-center justify-between text-xs">
            <button className="text-[#555] hover:text-[#888] transition-colors">
              Forgot Password?
            </button>
            <AnimatePresence mode="wait">
              {identityReveal === 'client' ? (
                <motion.button
                  key="support"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[#555] hover:text-[#888] transition-colors"
                >
                  Contact Support
                </motion.button>
              ) : (
                <motion.button
                  key="request"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[#555] hover:text-[#888] transition-colors"
                >
                  Request Access
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-8 text-[#333] text-xs"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>AES-256 Encrypted Environment</span>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 glass-panel rounded-xl px-4 py-3 text-xs text-[#444]"
        >
          <p className="font-mono mb-3 text-[#444] uppercase tracking-wider text-[10px]">Demo Credentials — click any to auto-fill</p>
          <div className="space-y-1.5">
            {[
              { label: '👑 Admin', email: 'ash@zennstudios.ca', desc: 'Full access + View As' },
              { label: '🏢 Client (Web + BizDev)', email: 'info@montax.ca', desc: 'Montax Financial' },
              { label: '🎬 Client (Video + Social + Photo)', email: 'team@blackfridaybins.ca', desc: 'Black Friday Bins' },
              { label: '👤 Employee', email: 'sam.ko@zennstudios.ca', desc: 'Project Manager' },
              { label: '🎨 Affiliate', email: 'mia.chen@design.co', desc: 'Brand & UI Designer' },
              { label: '🎥 Affiliate', email: 'jordan@freelance.io', desc: 'Lead Video Editor' },
            ].map(cred => (
              <button key={cred.email}
                onClick={() => { setEmail(cred.email); setPassword('demo123'); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group text-left">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-[#666] font-semibold flex-shrink-0">{cred.label}</span>
                  <span className="text-[10px] text-[#3a3a3a] truncate">{cred.desc}</span>
                </div>
                <span className="text-[10px] text-[#3a3a3a] font-mono group-hover:text-[#666] transition-colors flex-shrink-0 ml-2">{cred.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[#2a2a2a] mt-2 text-[10px] font-mono">Password: any value</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
