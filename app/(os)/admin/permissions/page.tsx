'use client';

import { useState } from 'react';
import { Shield, Check, X, Info, Save, RotateCcw } from 'lucide-react';
import type { UserRole } from '@/lib/types';

type Permission = {
  id: string;
  label: string;
  category: string;
  defaultRoles: UserRole[];
};

const PERMISSIONS: Permission[] = [
  { id: 'view_ledger',         label: 'View Financial Ledger',       category: 'Finance',  defaultRoles: ['admin'] },
  { id: 'edit_ledger',         label: 'Edit Transactions',           category: 'Finance',  defaultRoles: ['admin'] },
  { id: 'run_payout',          label: 'Run Payout Allocator',        category: 'Finance',  defaultRoles: ['admin'] },
  { id: 'view_own_payout',     label: 'View Own Payout',             category: 'Finance',  defaultRoles: ['admin', 'employee', 'affiliate'] },
  { id: 'create_project',      label: 'Create Projects',             category: 'Projects', defaultRoles: ['admin'] },
  { id: 'assign_team',         label: 'Assign Team Members',         category: 'Projects', defaultRoles: ['admin', 'employee'] },
  { id: 'view_all_projects',   label: 'View All Projects',           category: 'Projects', defaultRoles: ['admin', 'employee'] },
  { id: 'view_own_projects',   label: 'View Assigned Projects',      category: 'Projects', defaultRoles: ['admin', 'employee', 'affiliate'] },
  { id: 'submit_proof',        label: 'Submit Deliverable Proof',    category: 'Projects', defaultRoles: ['admin', 'employee', 'affiliate'] },
  { id: 'approve_milestone',   label: 'Approve Milestones',          category: 'Projects', defaultRoles: ['admin'] },
  { id: 'view_client_list',    label: 'View Client Directory',       category: 'CRM',      defaultRoles: ['admin', 'employee'] },
  { id: 'manage_leads',        label: 'Manage Lead Pipeline',        category: 'CRM',      defaultRoles: ['admin', 'employee'] },
  { id: 'view_own_workspace',  label: 'View Own Workspace',          category: 'CRM',      defaultRoles: ['admin', 'employee', 'affiliate', 'client'] },
  { id: 'approve_proofs',      label: 'Approve Deliverables',        category: 'CRM',      defaultRoles: ['admin', 'client'] },
  { id: 'manage_users',        label: 'Manage Users & Roles',        category: 'System',   defaultRoles: ['admin'] },
  { id: 'send_nudges',         label: 'Send Nudges',                 category: 'System',   defaultRoles: ['admin'] },
  { id: 'view_audit_log',      label: 'View Audit Log',              category: 'System',   defaultRoles: ['admin'] },
  { id: 'access_vault',        label: 'Access Project Vault',        category: 'System',   defaultRoles: ['admin', 'employee', 'affiliate'] },
  { id: 'access_contracts',    label: 'Manage Contracts',            category: 'System',   defaultRoles: ['admin'] },
];

const ROLES: UserRole[] = ['admin', 'employee', 'affiliate', 'client'];
const ROLE_COLOR: Record<UserRole, string> = {
  admin: '#b6332e', employee: '#3b82f6', affiliate: '#8b5cf6', client: '#10b981',
};

const CATEGORIES = [...new Set(PERMISSIONS.map(p => p.category))];

type PermMap = Record<string, Record<UserRole, boolean>>;

function buildDefault(): PermMap {
  const m: PermMap = {};
  for (const p of PERMISSIONS) {
    m[p.id] = {} as Record<UserRole, boolean>;
    for (const role of ROLES) {
      m[p.id][role] = p.defaultRoles.includes(role);
    }
  }
  return m;
}

export default function PermissionMatrix() {
  const [perm, setPerm] = useState<PermMap>(buildDefault);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (permId: string, role: UserRole) => {
    if (!editMode || role === 'admin') return;
    setPerm(prev => ({
      ...prev,
      [permId]: { ...prev[permId], [role]: !prev[permId][role] },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
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
              <button onClick={handleSave} className="btn-primary text-xs">
                <Save className="w-3.5 h-3.5" /> {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="btn-secondary text-xs">
              <Shield className="w-3.5 h-3.5" /> Edit Permissions
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="flex items-center gap-2 text-xs bg-[rgba(182,51,46,0.08)] border border-[rgba(182,51,46,0.2)] rounded-lg px-3 py-2 text-[#b6332e]">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          Edit mode active — click any cell to toggle. Admin always retains full access.
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
                  <th
                    key={role}
                    className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-center w-28"
                    style={{ color: ROLE_COLOR[role] }}
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat => (
                <>
                  {/* Category row */}
                  <tr key={`cat-${cat}`} className="border-t border-[rgba(255,255,255,0.04)]">
                    <td
                      colSpan={5}
                      className="px-5 py-2 bg-[#080808] text-[10px] font-bold uppercase tracking-widest text-[#333]"
                    >
                      {cat}
                    </td>
                  </tr>
                  {/* Permission rows */}
                  {PERMISSIONS.filter(p => p.category === cat).map(pItem => (
                    <tr
                      key={pItem.id}
                      className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[#0d0d0d] transition-colors"
                    >
                      <td className="px-5 py-3 text-xs text-[#ccc] min-w-[220px]">
                        {pItem.label}
                      </td>
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
                              style={
                                has
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
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 text-xs text-[#555] glass-panel rounded-xl p-4">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#333]" />
        <p>Permissions are enforced server-side in production. Admin always retains full access regardless of matrix settings. Changes here affect all users of that role.</p>
      </div>
    </div>
  );
}
