'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Check, X, Info, Save, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

// Map UI permission IDs to DB resource+action pairs
const PERMISSIONS = [
  { id: 'view_ledger',         label: 'View Financial Ledger',       category: 'Finance',  resource: 'ledger',       action: 'read'   },
  { id: 'edit_ledger',         label: 'Edit Transactions',           category: 'Finance',  resource: 'ledger',       action: 'write'  },
  { id: 'run_payout',          label: 'Run Payout Allocator',        category: 'Finance',  resource: 'payout',       action: 'run'    },
  { id: 'view_own_payout',     label: 'View Own Payout',             category: 'Finance',  resource: 'payout',       action: 'read'   },
  { id: 'create_project',      label: 'Create Projects',             category: 'Projects', resource: 'project',      action: 'create' },
  { id: 'assign_team',         label: 'Assign Team Members',         category: 'Projects', resource: 'project',      action: 'assign' },
  { id: 'view_all_projects',   label: 'View All Projects',           category: 'Projects', resource: 'project',      action: 'read_all' },
  { id: 'view_own_projects',   label: 'View Assigned Projects',      category: 'Projects', resource: 'project',      action: 'read_own' },
  { id: 'submit_proof',        label: 'Submit Deliverable Proof',    category: 'Projects', resource: 'milestone',    action: 'submit' },
  { id: 'approve_milestone',   label: 'Approve Milestones',          category: 'Projects', resource: 'milestone',    action: 'approve' },
  { id: 'view_client_list',    label: 'View Client Directory',       category: 'CRM',      resource: 'client',       action: 'read'   },
  { id: 'manage_leads',        label: 'Manage Lead Pipeline',        category: 'CRM',      resource: 'lead',         action: 'write'  },
  { id: 'view_own_workspace',  label: 'View Own Workspace',          category: 'CRM',      resource: 'workspace',    action: 'read'   },
  { id: 'approve_proofs',      label: 'Approve Deliverables',        category: 'CRM',      resource: 'proof',        action: 'approve' },
  { id: 'manage_users',        label: 'Manage Users & Roles',        category: 'System',   resource: 'user',         action: 'manage' },
  { id: 'send_nudges',         label: 'Send Nudges',                 category: 'System',   resource: 'nudge',        action: 'send'   },
  { id: 'view_audit_log',      label: 'View Audit Log',              category: 'System',   resource: 'activity',     action: 'read'   },
  { id: 'access_vault',        label: 'Access Project Vault',        category: 'System',   resource: 'vault',        action: 'read'   },
  { id: 'access_contracts',    label: 'Manage Contracts',            category: 'System',   resource: 'contract',     action: 'manage' },
] as const;

const ROLES: UserRole[] = ['admin', 'employee', 'affiliate', 'client'];
const ROLE_COLOR: Record<UserRole, string> = {
  admin: '#b6332e', employee: '#3b82f6', affiliate: '#8b5cf6', client: '#10b981',
};
const CATEGORIES = [...new Set(PERMISSIONS.map(p => p.category))];

type PermMap = Record<string, Record<UserRole, boolean>>;

// Default fallback if DB returns nothing
function buildDefault(): PermMap {
  const m: PermMap = {};
  const defaultRoles: Record<string, UserRole[]> = {
    view_ledger: ['admin'], edit_ledger: ['admin'], run_payout: ['admin'],
    view_own_payout: ['admin', 'employee', 'affiliate'], create_project: ['admin'],
    assign_team: ['admin', 'employee'], view_all_projects: ['admin', 'employee'],
    view_own_projects: ['admin', 'employee', 'affiliate'], submit_proof: ['admin', 'employee', 'affiliate'],
    approve_milestone: ['admin'], view_client_list: ['admin', 'employee'],
    manage_leads: ['admin', 'employee'], view_own_workspace: ['admin', 'employee', 'affiliate', 'client'],
    approve_proofs: ['admin', 'client'], manage_users: ['admin'], send_nudges: ['admin'],
    view_audit_log: ['admin'], access_vault: ['admin', 'employee', 'affiliate'], access_contracts: ['admin'],
  };
  for (const p of PERMISSIONS) {
    m[p.id] = {} as Record<UserRole, boolean>;
    for (const role of ROLES) {
      m[p.id][role] = (defaultRoles[p.id] ?? ['admin']).includes(role);
    }
  }
  return m;
}

export default function PermissionMatrix() {
  const [perm, setPerm] = useState<PermMap>(buildDefault);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('os_permissions').select('resource, action, role, granted');
    if (!error && data && data.length > 0) {
      const newPerm: PermMap = buildDefault();
      for (const row of data) {
        const match = PERMISSIONS.find(p => p.resource === row.resource && p.action === row.action);
        if (match && ROLES.includes(row.role as UserRole)) {
          newPerm[match.id][row.role as UserRole] = row.granted;
        }
      }
      setPerm(newPerm);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPermissions(); }, [loadPermissions]);

  const toggle = (permId: string, role: UserRole) => {
    if (!editMode || role === 'admin') return;
    setPerm(prev => ({
      ...prev,
      [permId]: { ...prev[permId], [role]: !prev[permId][role] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [];
      for (const p of PERMISSIONS) {
        for (const role of ROLES) {
          if (role === 'admin') continue; // admin always has full access
          updates.push(
            supabase.from('os_permissions')
              .update({ granted: perm[p.id][role], updated_at: new Date().toISOString() })
              .eq('resource', p.resource)
              .eq('action', p.action)
              .eq('role', role)
          );
        }
      }
      await Promise.all(updates);
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Permission save error:', err);
      alert('Failed to save permissions. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => { setPerm(buildDefault()); setEditMode(false); };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Permission Matrix</h1>
          <p className="text-xs text-[#555] mt-0.5">Role-based access control for Zenn OS</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleReset} className="btn-ghost text-xs">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs disabled:opacity-50">
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> {saved ? '✓ Saved' : 'Save Changes'}</>}
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="btn-secondary text-xs" disabled={loading}>
              <Shield className="w-3.5 h-3.5" /> Edit Permissions
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="flex items-center gap-2 text-xs bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.2)] rounded-lg px-3 py-2 text-[#b6332e]">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          Edit mode active — click any cell to toggle. Changes save to the database. Admin always retains full access.
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap">
        {ROLES.map(role => (
          <div key={role} className="flex items-center gap-2 text-xs capitalize text-[#888]">
            <span className="w-3 h-3 rounded" style={{ background: ROLE_COLOR[role] }} />
            {role}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-[#444]">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading from database...
          </div>
        )}
      </div>

      {/* Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
                <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#444] min-w-[220px]">
                  Permission
                </th>
                {ROLES.map(role => (
                  <th key={role} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-center w-28"
                    style={{ color: ROLE_COLOR[role] }}>
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat => (
                <React.Fragment key={cat}>
                  <tr className="border-t border-[rgba(255,255,255,0.04)]">
                    <td colSpan={5} className="px-5 py-2 bg-[#080808] text-[10px] font-bold uppercase tracking-widest text-[#333]">
                      {cat}
                    </td>
                  </tr>
                  {PERMISSIONS.filter(p => p.category === cat).map(pItem => (
                    <tr key={pItem.id} className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[#0d0d0d] transition-colors">
                      <td className="px-5 py-3 text-xs text-[#ccc] min-w-[220px]">{pItem.label}</td>
                      {ROLES.map(role => {
                        const has = perm[pItem.id]?.[role] ?? false;
                        const locked = role === 'admin';
                        const clickable = editMode && !locked;
                        return (
                          <td key={role} className="px-5 py-3 text-center w-28">
                            <button
                              type="button"
                              onClick={() => toggle(pItem.id, role)}
                              disabled={!clickable}
                              className={`mx-auto flex items-center justify-center w-7 h-7 rounded-md transition-all
                                ${clickable ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
                                ${locked ? 'opacity-80' : ''}
                              `}
                              style={has
                                ? { background: `${ROLE_COLOR[role]}22`, border: `1px solid ${ROLE_COLOR[role]}50` }
                                : { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }
                              }
                              title={locked ? 'Admin always has full access' : clickable ? (has ? 'Click to revoke' : 'Click to grant') : 'Enable edit mode to change'}
                            >
                              {has ? (
                                <Check className="w-3.5 h-3.5" style={{ color: ROLE_COLOR[role] }} />
                              ) : (
                                <X className="w-3 h-3 text-[#2a2a2a]" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 text-xs text-[#555] glass-panel rounded-xl p-4">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#333]" />
        <p>Permissions are stored in the database and enforced server-side. Admin always retains full access regardless of matrix settings.</p>
      </div>
    </div>
  );
}
