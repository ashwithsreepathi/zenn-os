// ─── Zenn OS Supabase Query Hooks ────────────────────────────────────────────
// Replace AppStoreProvider calls with these hooks one module at a time.
// Each hook auto-refetches on window focus and broadcasts Realtime changes.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client';
import type { TablesInsert, TablesUpdate } from './types';

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_projects')
        .select('*, os_milestones(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_projects')
        .select('*, os_milestones(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useAddProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: TablesInsert<'os_projects'>) => {
      const { data, error } = await supabase.from('os_projects').insert(project).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_projects'> }) => {
      const { data, error } = await supabase.from('os_projects').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ['projects', id] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('os_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ─── MILESTONES ───────────────────────────────────────────────────────────────

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_milestones'> }) => {
      const { data, error } = await supabase.from('os_milestones').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ─── USERS / PERSONNEL ────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_users').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_users'> }) => {
      const { data, error } = await supabase.from('os_users').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('os_users').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
  });
}

// ─── TRANSACTIONS / LEDGER ────────────────────────────────────────────────────

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_transactions').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txn: TablesInsert<'os_transactions'>) => {
      const { data, error } = await supabase.from('os_transactions').insert(txn).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_contracts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_contracts'> }) => {
      const { data, error } = await supabase.from('os_contracts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

// ─── NUDGES ───────────────────────────────────────────────────────────────────

export function useNudges() {
  return useQuery({
    queryKey: ['nudges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_nudges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nudge: TablesInsert<'os_nudges'>) => {
      const { data, error } = await supabase.from('os_nudges').insert(nudge).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nudges'] }),
  });
}

export function useUpdateNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_nudges'> }) => {
      const { data, error } = await supabase.from('os_nudges').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nudges'] }),
  });
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_quotes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quote: TablesInsert<'os_quotes'>) => {
      const { data, error } = await supabase.from('os_quotes').insert(quote).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_quotes'> }) => {
      const { data, error } = await supabase.from('os_quotes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('os_quotes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

// ─── ENQUIRIES ────────────────────────────────────────────────────────────────

export function useEnquiries() {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_enquiries'> }) => {
      const { data, error } = await supabase.from('os_enquiries').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enquiries'] }),
  });
}

// ─── LEADS ────────────────────────────────────────────────────────────────────

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_leads'> }) => {
      const { data, error } = await supabase.from('os_leads').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('os_leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

// ─── EQUIPMENT ────────────────────────────────────────────────────────────────

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_equipment').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'os_equipment'> }) => {
      const { data, error } = await supabase.from('os_equipment').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  });
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_channels').select('*').order('last_message_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMessages(channelId: string) {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!channelId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: TablesInsert<'os_messages'>) => {
      const { data, error } = await supabase.from('os_messages').insert(msg).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['messages', data.channel_id] }),
  });
}

// ─── VAULT ────────────────────────────────────────────────────────────────────

export function useVaultAssets(projectId: string) {
  return useQuery({
    queryKey: ['vault', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_vault_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

// ─── PERMISSIONS ──────────────────────────────────────────────────────────────

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('os_permissions').select('*').order('role').order('resource');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ role, resource, action, granted }: { role: string; resource: string; action: string; granted: boolean }) => {
      const { data, error } = await supabase
        .from('os_permissions')
        .update({ granted, updated_at: new Date().toISOString() })
        .match({ role, resource, action })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions'] }),
  });
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────

export function useActivity(limit = 50) {
  return useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

// ─── PAYOUTS ──────────────────────────────────────────────────────────────────

export function usePayouts(userId?: string) {
  return useQuery({
    queryKey: ['payouts', userId],
    queryFn: async () => {
      let query = supabase.from('os_payouts').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ─── INVITES ──────────────────────────────────────────────────────────────────

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invite: TablesInsert<'os_invites'>) => {
      const { data, error } = await supabase.from('os_invites').insert(invite).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
  });
}
