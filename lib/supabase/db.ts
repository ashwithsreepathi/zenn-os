// ─── Zenn OS — Direct Supabase Mutation Layer ──────────────────────────────────
// All CREATE / UPDATE / DELETE operations go through these functions.
// Pages import what they need. No hooks — just async functions.
// Note: `as any` casts are required because Supabase's strict generated types
// occasionally reject valid column names (e.g. updated_at on some tables).
// The actual schema is correct; this is a codegen limitation.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from './client';

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function dbAddProject(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_projects')
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateProject(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_projects')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function dbDeleteProject(id: string) {
  const { error } = await supabase.from('os_projects').delete().eq('id', id);
  if (error) throw error;
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function dbAddMilestone(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_milestones')
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateMilestone(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_milestones')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export async function dbAddEquipment(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_equipment')
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateEquipment(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_equipment')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function dbDeleteEquipment(id: string) {
  const { error } = await supabase.from('os_equipment').delete().eq('id', id);
  if (error) throw error;
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function dbLoadPermissions() {
  const { data, error } = await supabase.from('os_permissions').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function dbSavePermission(resource: string, action: string, role: string, granted: boolean) {
  const { error } = await supabase
    .from('os_permissions')
    .update({ granted, updated_at: new Date().toISOString() } as any)
    .eq('resource', resource)
    .eq('action', action)
    .eq('role', role);
  if (error) throw error;
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function dbAddEnquiry(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_enquiries')
    .insert({ ...data, status: 'new', created_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateEnquiry(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_enquiries')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function dbAddLead(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_leads')
    .insert({ ...data, created_at: new Date().toISOString(), last_activity_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateLead(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_leads')
    .update({ ...updates, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function dbDeleteLead(id: string) {
  const { error } = await supabase.from('os_leads').delete().eq('id', id);
  if (error) throw error;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function dbAddQuote(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_quotes')
    .insert({ ...data, status: 'draft', created_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateQuote(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_quotes')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function dbDeleteQuote(id: string) {
  const { error } = await supabase.from('os_quotes').delete().eq('id', id);
  if (error) throw error;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function dbAddTransaction(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_transactions')
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateTransaction(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_transactions')
    .update(updates as any)
    .eq('id', id);
  if (error) throw error;
}

// ─── Nudges ───────────────────────────────────────────────────────────────────

export async function dbAddNudge(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_nudges')
    .insert({ ...data, created_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateNudge(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_nudges')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

// ─── Users / Personnel ────────────────────────────────────────────────────────

export async function dbGetUsers() {
  const { data, error } = await supabase
    .from('os_users')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function dbUpdateUser(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_users')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export async function dbAddInvite(data: Record<string, unknown>) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  const { data: row, error } = await supabase
    .from('os_invites')
    .insert({
      ...data,
      token: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: expires.toISOString(),
    } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export async function dbAddContract(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_contracts')
    .insert({ ...data, status: 'draft', created_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

export async function dbUpdateContract(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('os_contracts')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

// ─── Channels / Messages ──────────────────────────────────────────────────────

export async function dbSendMessage(data: Record<string, unknown>) {
  const { data: row, error } = await supabase
    .from('os_messages')
    .insert({ ...data, created_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return row as Record<string, unknown>;
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function dbLogActivity(data: {
  action: string;
  detail?: string;
  user_id?: string;
  user_name?: string;
  project_id?: string;
  project_name?: string;
  category: 'financial' | 'legal' | 'production' | 'access' | 'system' | 'communication';
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase
    .from('os_activity')
    .insert({ ...data, created_at: new Date().toISOString() } as any);
  // Non-critical — swallow errors silently
  if (error) console.warn('Activity log failed:', error.message);
}
