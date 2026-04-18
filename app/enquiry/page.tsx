/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

const PROJECT_TYPES = [
  'Brand Identity',
  'Web Platform / App',
  'Video Production',
  'Social Media & Content',
  'Marketing Campaign',
  'Full Brand Package',
  'Other',
];

const BUDGETS = [
  'Under $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000 – $50,000',
  '$50,000 – $100,000',
  '$100,000+',
];

const SOURCES = ['Referral', 'Instagram', 'LinkedIn', 'Google', 'Direct', 'Cold Outreach', 'Other'];

const GRID_LINES = Array.from({ length: 40 }, (_, i) => i);

export default function PublicEnquiryForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    source: '',
    message: '',
  });

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isStep1Valid = form.name && form.email;
  const isStep2Valid = form.projectType && form.budget;
  const isStep3Valid = form.message;

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('os_enquiries').insert({
        name: form.name,
        email: form.email,
        company: form.company || null,
        project_type: form.projectType || null,
        budget: form.budget || null,
        source: form.source || null,
        message: form.message
      } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,51,46,0.06)_0%,transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-[#10b981]" />
          </motion.div>
          <h1 className="text-2xl font-black text-white mb-3">We've got your message</h1>
          <p className="text-[#555] text-sm leading-relaxed mb-6">
            Thanks {form.name.split(' ')[0]}. We&apos;ll review your enquiry and get back to you within 1 business day.
          </p>
          <p className="text-[10px] text-[#333] font-mono">Reference: ENQ-{Date.now().toString(36).toUpperCase()}</p>
          <Link href="/" className="btn-secondary inline-flex mt-6 text-xs">← Back to Zenn Studios</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(182,51,46,0.07)_0%,transparent_60%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#b6332e] flex items-center justify-center">
              <span className="text-white font-black text-base">Z</span>
            </div>
            <span className="text-lg font-black tracking-tight text-white">ZENN STUDIOS</span>
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">Let's build something.</h1>
          <p className="text-[#555] text-sm mt-2">Tell us about your project and we&apos;ll be in touch.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-[#b6332e]' : 'w-3 bg-[rgba(255,255,255,0.08)]'}`} />
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-2xl p-8 border border-[rgba(255,255,255,0.06)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-sm font-bold text-[#eee] mb-4">Who's reaching out?</h2>
                <div>
                  <label className="section-label mb-1.5 block">Your Name *</label>
                  <input type="text" className="os-input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Jane Doe" autoFocus />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Email Address *</label>
                  <input type="email" className="os-input" value={form.email} onChange={e => update('email', e.target.value)} placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Company (optional)</label>
                  <input type="text" className="os-input" value={form.company} onChange={e => update('company', e.target.value)} placeholder="Your company name" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">How did you find us?</label>
                  <select className="os-input cursor-pointer" value={form.source} onChange={e => update('source', e.target.value)}>
                    <option value="">Select source...</option>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-sm font-bold text-[#eee] mb-4">What are you building?</h2>
                <div>
                  <label className="section-label mb-2 block">Project Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROJECT_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => update('projectType', t)}
                        className={`text-xs text-left p-3 rounded-xl border transition-all ${form.projectType === t ? 'border-[rgba(182,51,46,0.5)] bg-[rgba(182,51,46,0.08)] text-[#b6332e]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888] hover:border-[rgba(255,255,255,0.12)]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="section-label mb-2 block">Budget Range *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGETS.map(b => (
                      <button
                        key={b}
                        onClick={() => update('budget', b)}
                        className={`text-xs text-center p-2.5 rounded-xl border transition-all ${form.budget === b ? 'border-[rgba(182,51,46,0.5)] bg-[rgba(182,51,46,0.08)] text-[#b6332e]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-sm font-bold text-[#eee] mb-4">Tell us more.</h2>
                <div>
                  <label className="section-label mb-1.5 block">Your Message *</label>
                  <textarea
                    className="os-input resize-none"
                    rows={6}
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Describe your vision, timeline, any specific requirements, or just say hi..."
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.2)] rounded-lg px-3 py-2 text-xs text-[#b6332e]">
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                  </div>
                )}
                {/* Summary */}
                <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] text-xs space-y-1 text-[#555]">
                  <p><span className="text-[#333]">Name:</span> {form.name}</p>
                  <p><span className="text-[#333]">Email:</span> {form.email}</p>
                  <p><span className="text-[#333]">Project:</span> {form.projectType}</p>
                  <p><span className="text-[#333]">Budget:</span> {form.budget}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary text-xs">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !isStep3Valid}
                className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
              >
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : <>Send Enquiry <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[#333] text-[10px] mt-4">
          By submitting, you agree to our{' '}
          <span className="text-[#444] underline cursor-pointer">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
