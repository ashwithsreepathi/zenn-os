'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Check, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();

  const handleComplete = () => {
    // In a real app, API call to update isOnboarded=true
    if (user?.role === 'admin') router.push('/admin/executive-dashboard');
    else if (user?.role === 'client') router.push('/portal/client-dashboard');
    else router.push('/team/assigned-board');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_rgba(182,51,46,0.08)_0%,_transparent_70%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel rounded-3xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[rgba(182,51,46,0.1)] border border-[rgba(182,51,46,0.2)] mx-auto flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-[#b6332e]" />
        </div>
        <h1 className="text-2xl font-black text-[#eee] tracking-tight mb-2">Security Verification</h1>
        <p className="text-sm text-[#888] mb-8">Welcome to Zenn OS. Please verify your workspace identity to proceed.</p>

        <div className="space-y-3 mb-8 text-left">
          <div className="glass-panel-elevated p-4 rounded-xl flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#111] flex flex-shrink-0 items-center justify-center text-[#eee] font-bold border border-[rgba(255,255,255,0.05)]">
               {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#eee]">{user?.name}</p>
              <p className="text-xs text-[#555] capitalize">{user?.role} Access Configured</p>
            </div>
            <Check className="w-5 h-5 text-[#10b981] ml-auto" />
          </div>
        </div>

        <button onClick={handleComplete} className="btn-primary w-full justify-center text-sm py-3">
          Initialize Workspace <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </motion.div>
    </div>
  );
}
