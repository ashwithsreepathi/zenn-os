/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { dbAddEquipment, dbUpdateEquipment, dbDeleteEquipment } from '@/lib/supabase/db';
import {
  Package, Plus, AlertTriangle, CheckCircle, Wrench, Camera,
  Laptop, Volume2, Lightbulb, Edit3, X, Save, Trash2, Loader2
} from 'lucide-react';

type EquipmentStatus = 'available' | 'checked_out' | 'in_repair' | 'missing';
type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';
type EquipmentType = 'camera' | 'lens' | 'lighting' | 'audio' | 'computer' | 'storage' | 'other';

interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  owner: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  value?: number;
  serial_number?: string;
  purchase_date?: string;
  is_verified: boolean;
  checked_out_to?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  camera: Camera, lens: Camera, lighting: Lightbulb,
  audio: Volume2, computer: Laptop, storage: Package, other: Package,
};
const STATUS_CFG: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Available', color: '#10b981' },
  checked_out: { label: 'Checked Out', color: '#3b82f6' },
  in_repair: { label: 'In Repair', color: '#f59e0b' },
  missing: { label: 'Missing', color: '#b6332e' },
};
const CONDITION_COLOR: Record<EquipmentCondition, string> = {
  excellent: '#10b981', good: '#3b82f6', fair: '#f59e0b', needs_repair: '#b6332e',
};

const EMPTY_FORM = {
  name: '', type: 'camera' as EquipmentType, owner: 'agency',
  status: 'available' as EquipmentStatus, condition: 'good' as EquipmentCondition,
  value: '', serial_number: '', purchase_date: '',
};

export default function EquipmentTracker() {
  const [filter, setFilter] = useState<'all' | EquipmentStatus>('all');
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('os_equipment').select('*').order('created_at', { ascending: false });
    if (!error && data) setItems(data as Equipment[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

  const totalValue = items.reduce((s, e) => s + (e.value ?? 0), 0);
  const filtered = items.filter(e => filter === 'all' || e.status === filter);

  const openAdd = () => { setEditingItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item: Equipment) => {
    setEditingItem(item);
    setForm({
      name: item.name, type: item.type, owner: item.owner,
      status: item.status, condition: item.condition,
      value: String(item.value ?? ''), serial_number: item.serial_number ?? '',
      purchase_date: item.purchase_date ?? '',
    });
    setSelected(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name, type: form.type, owner: form.owner,
        status: form.status, condition: form.condition,
        value: form.value ? Number(form.value) : null,
        serial_number: form.serial_number || null,
        purchase_date: form.purchase_date || null,
        is_verified: true,
      };
      if (editingItem) {
        await dbUpdateEquipment(editingItem.id, payload);
      } else {
        await dbAddEquipment(payload);
      }
      setSaved(true);
      await loadEquipment();
      setTimeout(() => { setSaved(false); setShowModal(false); }, 800);
    } catch (err) {
      console.error('Equipment save error:', err);
      alert('Failed to save. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this equipment item?')) return;
    await dbDeleteEquipment(id);
    setSelected(null);
    await loadEquipment();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Equipment Tracker</h1>
          <p className="text-xs text-[#555] mt-0.5">Agency gear, personal gear & check-out log</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> Add Equipment</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: items.length },
          { label: 'Agency Owned', value: items.filter(e => e.owner === 'agency').length },
          { label: 'Checked Out', value: items.filter(e => e.status === 'checked_out').length },
          { label: 'Total Value', value: `$${totalValue.toLocaleString()}` },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="kpi-card">
            <p className="section-label mb-1">{k.label}</p>
            <p className="text-2xl font-black text-[#eee]">{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'available', 'checked_out', 'in_repair'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${filter === f ? 'bg-[rgba(182,51,46,0.15)] text-[#b6332e] border border-[rgba(182,51,46,0.3)]' : 'border border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#444]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading equipment...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Package className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="text-[#555] text-sm mb-3">No equipment found.</p>
          <button onClick={openAdd} className="btn-primary text-xs mx-auto"><Plus className="w-3 h-3" /> Add First Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const status = STATUS_CFG[item.status];
            const Icon = TYPE_ICONS[item.type] ?? Package;
            const isSelected = selected?.id === item.id;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(isSelected ? null : item)}
                className={`glass-panel rounded-2xl p-5 cursor-pointer transition-all ${isSelected ? 'ring-1 ring-[rgba(182,51,46,0.4)]' : 'glass-panel-hover'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#555]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#eee] truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: status.color }} />
                      <span className="text-[10px]" style={{ color: status.color }}>{status.label}</span>
                    </div>
                  </div>
                  {!item.is_verified && <span title="Unverified"><AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0" /></span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="glass-panel-elevated rounded-lg p-2">
                    <p className="text-[#444]">Owner</p>
                    <p className="text-[#ccc] font-semibold mt-0.5 truncate">{item.owner === 'agency' ? 'Agency' : item.owner}</p>
                  </div>
                  <div className="glass-panel-elevated rounded-lg p-2">
                    <p className="text-[#444]">Condition</p>
                    <p className="font-semibold mt-0.5 capitalize" style={{ color: CONDITION_COLOR[item.condition] }}>{item.condition.replace('_', ' ')}</p>
                  </div>
                  {item.value && (
                    <div className="glass-panel-elevated rounded-lg p-2">
                      <p className="text-[#444]">Value</p>
                      <p className="text-[#ccc] font-semibold mt-0.5">${item.value.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-4 flex gap-2 overflow-hidden">
                      <button onClick={e => { e.stopPropagation(); openEdit(item); }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[10px] border border-[rgba(255,255,255,0.08)] text-[#888] hover:text-[#eee] hover:border-[rgba(255,255,255,0.15)] rounded-xl py-2 transition-all">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                        className="flex items-center justify-center gap-1.5 text-[10px] border border-[rgba(182,51,46,0.2)] text-[#b6332e] hover:bg-[rgba(182,51,46,0.08)] rounded-xl py-2 px-3 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#eee]">{editingItem ? 'Edit Equipment' : 'Add Equipment'}</h2>
                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="section-label mb-1.5 block">Item Name *</label>
                  <input type="text" className="os-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sony FX3 Camera" autoFocus />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Type</label>
                  <select className="os-input cursor-pointer" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EquipmentType }))}>
                    {['camera', 'lens', 'lighting', 'audio', 'computer', 'storage', 'other'].map(t => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Status</label>
                  <select className="os-input cursor-pointer" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EquipmentStatus }))}>
                    {Object.entries(STATUS_CFG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Condition</label>
                  <select className="os-input cursor-pointer" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as EquipmentCondition }))}>
                    {['excellent', 'good', 'fair', 'needs_repair'].map(c => <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Value ($)</label>
                  <input type="number" className="os-input" min={0} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Serial Number</label>
                  <input type="text" className="os-input" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} placeholder="Optional" />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Purchase Date</label>
                  <input type="date" className="os-input" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={handleSave} disabled={!form.name.trim() || saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : saved ? '✓ Saved!' : <><Save className="w-3.5 h-3.5" /> {editingItem ? 'Update' : 'Add Item'}</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
