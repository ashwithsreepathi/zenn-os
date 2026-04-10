'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockContracts, mockUsers, mockProjects } from '@/lib/mock-data';
import {
  FileText, Send, CheckCircle, Eye, Clock, Shield, Plus, Download,
  Edit3, X, Save, Building, User, Hash, ChevronRight, AlertTriangle,
  BookOpen, PenTool
} from 'lucide-react';
import type { Contract, ContractType, ContractStatus } from '@/lib/types';

const TYPE_LABELS: Record<ContractType, string> = {
  msa: 'Master Service Agreement',
  nda: 'Non-Disclosure Agreement',
  ip_transfer: 'IP Transfer Deed',
  contractor: 'Contractor Agreement',
  sow: 'Statement of Work',
};

const TYPE_DESC: Record<ContractType, string> = {
  msa: 'Governs the overall client relationship, scope, and IP ownership.',
  nda: 'Mutual confidentiality protection for both parties.',
  ip_transfer: 'Transfers creative asset ownership upon full payment.',
  contractor: 'Terms for freelancer / affiliate engagement.',
  sow: 'Detailed deliverables, timeline, and payment schedule.',
};

const CONTRACT_TEMPLATES: Record<ContractType, string> = {
  msa: `MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into as of [DATE], between:

SERVICE PROVIDER: Zenn Studios Inc., [ADDRESS]
CLIENT: [CLIENT_NAME], [CLIENT_ADDRESS]

1. SCOPE OF SERVICES
Zenn Studios agrees to provide creative and digital services as outlined in individual Statements of Work ("SOWs") attached hereto.

2. PAYMENT TERMS
Invoices are due within 14 days of issue. Late payments incur a 1.5% monthly interest charge.

3. INTELLECTUAL PROPERTY
All creative deliverables remain the exclusive property of Zenn Studios until full payment is received and an IP Transfer Deed is executed.

4. CONFIDENTIALITY
Both parties agree to hold all proprietary information in strict confidence.

5. TERM & TERMINATION
This Agreement commences on the Effective Date and continues until terminated by either party with 30 days written notice.

6. LIMITATION OF LIABILITY
Zenn Studios' total liability shall not exceed the fees paid in the preceding 3 months.

Signed: _________________________ Date: _____________
        [CLIENT_NAME]

Signed: _________________________ Date: _____________
        Ashwith Sreepathi, Zenn Studios Inc.`,

  nda: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("NDA") is entered into as of [DATE] between Zenn Studios Inc. ("Disclosing Party") and [CLIENT_NAME] ("Receiving Party").

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information related to business plans, pricing, client lists, trade secrets, and creative assets.

2. OBLIGATIONS
The Receiving Party shall:
(a) Hold all Confidential Information in strict confidence;
(b) Not disclose to any third party without prior written consent;
(c) Use Confidential Information only for purposes of evaluating a potential business relationship.

3. TERM
This NDA is effective for 3 years from the Effective Date.

4. EXCEPTIONS
Obligations do not apply to information that is: publicly known, independently developed, or required by law to be disclosed.

5. REMEDIES
Breach of this Agreement may cause irreparable harm, entitling injunctive relief without bond.

Signed: _________________________ Date: _____________
        [CLIENT_NAME]

Signed: _________________________ Date: _____________
        Ashwith Sreepathi, Zenn Studios Inc.`,

  ip_transfer: `IP TRANSFER DEED

This Intellectual Property Transfer Deed ("Deed") is executed as of [DATE].

ASSIGNOR: Zenn Studios Inc.
ASSIGNEE: [CLIENT_NAME]

WHEREAS the Assignee has fulfilled all payment obligations under the Statement of Work dated [SOW_DATE]:

1. TRANSFER OF RIGHTS
Assignor hereby irrevocably assigns to Assignee all right, title, and interest in the following deliverables:
[DELIVERABLES_LIST]

2. CONSIDERATION
In consideration of CAD $[AMOUNT] (receipt acknowledged), Assignor transfers all copyrights, moral rights (waived), and related IP.

3. WARRANTIES
Assignor warrants that the Work is original and does not infringe any third-party rights.

4. GOVERNING LAW
This Deed shall be governed by the laws of Ontario, Canada.

Signed: _________________________ Date: _____________
        [CLIENT_NAME] (Assignee)

Signed: _________________________ Date: _____________
        Ashwith Sreepathi, Zenn Studios Inc. (Assignor)`,

  contractor: `INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is made as of [DATE] between Zenn Studios Inc. ("Company") and [CONTRACTOR_NAME] ("Contractor").

1. INDEPENDENT CONTRACTOR STATUS
Contractor is an independent contractor. Nothing herein creates an employment relationship.

2. SERVICES
Contractor agrees to provide: [SERVICES_DESCRIPTION]

3. COMPENSATION
Company shall pay Contractor $[RATE] per [hour/project], payable within 7 days of invoice submission.

4. INTELLECTUAL PROPERTY
Any work product created for the Company is a "work made for hire." Contractor assigns all rights to the Company upon payment.

5. CONFIDENTIALITY
Contractor shall not disclose any client or Company information during or after the engagement.

6. NON-SOLICITATION
Contractor agrees not to directly solicit Company's clients for 12 months after termination.

7. TERM
This Agreement begins [START_DATE] and continues until either party provides 14 days written notice.

Signed: _________________________ Date: _____________
        [CONTRACTOR_NAME]

Signed: _________________________ Date: _____________
        Ashwith Sreepathi, Zenn Studios Inc.`,

  sow: `STATEMENT OF WORK

Project: [PROJECT_NAME]
Client: [CLIENT_NAME]
SOW Date: [DATE]
Project Start: [START_DATE]  Project End: [END_DATE]

1. PROJECT OVERVIEW
[PROJECT_DESCRIPTION]

2. DELIVERABLES
Phase 1 – [MILESTONE_1]: Due [DATE_1]
Phase 2 – [MILESTONE_2]: Due [DATE_2]
Phase 3 – [MILESTONE_3]: Due [DATE_3]

3. INVESTMENT & PAYMENT SCHEDULE
Total: CAD $[TOTAL]
  • 30% Deposit due on signing: $[DEPOSIT]
  • 40% at Phase 2 completion: $[MID_PAYMENT]
  • 30% on final delivery: $[FINAL_PAYMENT]

4. REVISION POLICY
Each phase includes 2 rounds of revisions. Additional revisions billed at $[HOURLY_RATE]/hr.

5. CLIENT RESPONSIBILITIES
Client to provide all source materials by [MATERIALS_DUE_DATE]. Delays caused by late client feedback may affect delivery dates.

6. APPROVAL PROCESS
Proofs submitted via Zenn OS portal. Client has 5 business days to approve or request revisions.

Signed: _________________________ Date: _____________
        [CLIENT_NAME]

Signed: _________________________ Date: _____________
        Ashwith Sreepathi, Zenn Studios Inc.`,
};

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Draft', color: '#555', icon: FileText },
  sent: { label: 'Sent', color: '#3b82f6', icon: Send },
  viewed: { label: 'Viewed', color: '#f59e0b', icon: Eye },
  partially_signed: { label: 'Partial', color: '#f59e0b', icon: Clock },
  executed: { label: 'Executed', color: '#10b981', icon: CheckCircle },
};

type Tab = 'contracts' | 'templates' | 'legal_docs';

function generateId() { return `con_${Date.now().toString(36)}`; }

export default function IPContracts() {
  const [activeTab, setActiveTab] = useState<Tab>('contracts');
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Contract | null>(null);
  const [editingDoc, setEditingDoc] = useState(false);
  const [docContent, setDocContent] = useState('');

  // New contract form
  const [newForm, setNewForm] = useState({
    type: 'msa' as ContractType,
    recipientName: '',
    projectId: '',
    expiresAt: '',
  });

  const executedCount = contracts.filter(c => c.status === 'executed').length;
  const pendingCount = contracts.filter(c => c.status !== 'executed' && c.status !== 'draft').length;
  const draftCount = contracts.filter(c => c.status === 'draft').length;

  const createContract = () => {
    if (!newForm.recipientName.trim()) return;
    const project = mockProjects.find(p => p.id === newForm.projectId);
    const newContract: Contract = {
      id: generateId(), type: newForm.type, status: 'draft',
      recipientName: newForm.recipientName, projectName: project?.name,
      expiresAt: newForm.expiresAt || undefined, createdAt: new Date().toISOString().split('T')[0],
    };
    setContracts(prev => [newContract, ...prev]);
    setSelected(newContract);
    setShowNewModal(false);
    setNewForm({ type: 'msa', recipientName: '', projectId: '', expiresAt: '' });
  };

  const exportAll = () => {
    const headers = ['ID', 'Type', 'Recipient', 'Project', 'Status', 'Created', 'Expires'];
    const rows = contracts.map(c => [
      c.id, TYPE_LABELS[c.type], c.recipientName, c.projectName ?? 'N/A',
      c.status, c.createdAt ?? '', c.expiresAt ?? '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zenn-contracts.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };


  const openDoc = (c: Contract) => {
    const template = CONTRACT_TEMPLATES[c.type];
    const filled = template.replace(/\[CLIENT_NAME\]/g, c.recipientName).replace(/\[DATE\]/g, new Date().toLocaleDateString()).replace(/\[PROJECT_NAME\]/g, c.projectName ?? 'Project');
    setDocContent(filled);
    setViewingDoc(c);
    setEditingDoc(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">IP &amp; Contract Vault</h1>
          <p className="text-xs text-[#555] mt-0.5">Legal documentation, NDA tracker &amp; IP transfer registry</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportAll} className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Export All</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> New Contract</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Contracts', value: contracts.length, icon: FileText, color: '#888' },
          { label: 'Executed', value: executedCount, icon: CheckCircle, color: '#10b981' },
          { label: 'Drafts', value: draftCount, icon: Edit3, color: '#555' },
          { label: 'IP Transfers', value: contracts.filter(c => c.type === 'ip_transfer').length, icon: Shield, color: '#b6332e' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${kpi.color}15` }}>
              <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
            </div>
            <div><p className="section-label">{kpi.label}</p><p className="text-2xl font-black text-[#eee] mt-0.5">{kpi.value}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[rgba(255,255,255,0.06)] pb-0">
        {([
          { id: 'contracts', label: 'All Contracts', icon: FileText },
          { id: 'templates', label: 'Templates', icon: BookOpen },
          { id: 'legal_docs', label: 'Legal Docs / NDAs', icon: Shield },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeTab === tab.id ? 'border-[#b6332e] text-[#eee]' : 'border-transparent text-[#555] hover:text-[#888]'}`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: All Contracts */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-[#0a0a0a]">
              <h2 className="text-sm font-bold text-[#eee]">All Contracts</h2>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {contracts.map((c, i) => {
                const statusCfg = STATUS_CONFIG[c.status];
                const isSelected = selected?.id === c.id;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(isSelected ? null : c)}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-[rgba(182,51,46,0.06)]' : 'hover:bg-[#111]'}`}>
                    <div className="w-10 h-10 rounded-xl bg-[#111] border border-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#555]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#eee] truncate">{TYPE_LABELS[c.type]}</p>
                      <p className="text-xs text-[#555] mt-0.5">{c.recipientName}{c.projectName ? ` · ${c.projectName}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <statusCfg.icon className="w-3.5 h-3.5" style={{ color: statusCfg.color }} />
                      <span className="text-xs font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                    </div>
                    {c.expiresAt && new Date(c.expiresAt) < new Date(Date.now() + 90 * 86400e3) && (
                      <span className="text-[9px] text-[#f59e0b] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 rounded">Expiring</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="space-y-4">
            {selected ? (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#eee]">Contract Detail</h3>
                  <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
                </div>
                <div className="kpi-card text-center">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(182,51,46,0.1)] flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-[#b6332e]" />
                  </div>
                  <p className="text-sm font-bold text-[#eee]">{TYPE_LABELS[selected.type]}</p>
                  <p className="text-xs text-[#555] mt-1">{selected.recipientName}</p>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Status', value: STATUS_CONFIG[selected.status].label },
                    { label: 'Project', value: selected.projectName ?? 'N/A' },
                    { label: 'Created', value: selected.createdAt ?? 'N/A' },
                    { label: 'Expires', value: selected.expiresAt ?? 'No expiry' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-2">
                      <span className="text-[#444]">{row.label}</span>
                      <span className="text-[#ccc]">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <button onClick={() => openDoc(selected)} className="btn-primary w-full justify-center text-xs">
                    <Eye className="w-3.5 h-3.5" /> View Document
                  </button>
                  {selected.status === 'draft' && (
                    <button className="btn-secondary w-full justify-center text-xs">
                      <Send className="w-3.5 h-3.5" /> Send for Signature
                    </button>
                  )}
                  {selected.status !== 'executed' && selected.status !== 'draft' && (
                    <button className="btn-secondary w-full justify-center text-xs">
                      <Send className="w-3.5 h-3.5" /> Resend
                    </button>
                  )}
                  <button className="btn-ghost w-full justify-center text-xs" onClick={() => {
                    const template = CONTRACT_TEMPLATES[selected.type];
                    const filled = template
                      .replace(/\[CLIENT_NAME\]/g, selected.recipientName)
                      .replace(/\[DATE\]/g, new Date().toLocaleDateString())
                      .replace(/\[PROJECT_NAME\]/g, selected.projectName ?? 'Project');
                    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${TYPE_LABELS[selected.type]} – ${selected.recipientName}</title>
<style>body{font-family:Arial,sans-serif;max-width:740px;margin:0 auto;padding:48px;color:#111;line-height:1.7;white-space:pre-wrap;font-size:13px}h1{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #b6332e;padding-bottom:8px;color:#b6332e}footer{margin-top:40px;font-size:10px;color:#aaa}</style>
</head><body><h1>${TYPE_LABELS[selected.type]}</h1>${filled.replace(/\n/g, '<br/>')}
<footer>Document ID: ${selected.id} · Generated by Zenn OS · ${new Date().toLocaleString()}</footer></body></html>`;
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const win = window.open(url, '_blank');
                    if (win) win.addEventListener('load', () => setTimeout(() => win.print(), 400));
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                  }}>
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center">
                <Shield className="w-8 h-8 text-[#333] mx-auto mb-3" />
                <p className="text-xs text-[#555]">Select a contract to view details.</p>
              </div>
            )}
            <div className="glass-panel rounded-2xl p-4 border border-[rgba(182,51,46,0.15)]">
              <p className="text-xs font-bold text-[#b6332e] mb-2 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> IP Protection Policy</p>
              <p className="text-[10px] text-[#555] leading-relaxed">All creative deliverables remain property of Zenn Studios until full payment is received and IP Transfer Deed is executed.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(Object.entries(TYPE_LABELS) as [ContractType, string][]).map(([type, label]) => (
            <div key={type} className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(182,51,46,0.1)] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#b6332e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#eee] truncate">{label}</p>
                  <p className="text-[10px] text-[#555] mt-1 leading-relaxed">{TYPE_DESC[type]}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setViewingDoc({ id: 'tmpl', type, status: 'draft', recipientName: '[CLIENT_NAME]', recipientId: undefined }); setDocContent(CONTRACT_TEMPLATES[type]); setEditingDoc(false); }}
                  className="flex-1 btn-secondary text-[11px] justify-center">
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button onClick={() => { setNewForm(f => ({ ...f, type })); setShowNewModal(true); }}
                  className="flex-1 btn-primary text-[11px] justify-center">
                  <Plus className="w-3 h-3" /> Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Legal Docs */}
      {activeTab === 'legal_docs' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            <p className="text-xs text-[#888]">Legal docs include all drafted NDAs, executed IP deeds, and operator agreements.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.filter(c => ['nda', 'ip_transfer', 'msa'].includes(c.type)).map((c, i) => {
              const statusCfg = STATUS_CONFIG[c.status];
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111] flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.06)]">
                    {c.type === 'nda' ? <Shield className="w-6 h-6 text-[#8b5cf6]" /> :
                     c.type === 'ip_transfer' ? <Shield className="w-6 h-6 text-[#b6332e]" /> :
                     <Building className="w-6 h-6 text-[#3b82f6]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#eee]">{TYPE_LABELS[c.type]}</p>
                    <p className="text-xs text-[#555] mt-0.5">{c.recipientName}{c.projectName ? ` · ${c.projectName}` : ''}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <statusCfg.icon className="w-3 h-3" style={{ color: statusCfg.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => openDoc(c)} className="text-[10px] text-[#888] hover:text-[#eee] flex items-center gap-1 whitespace-nowrap transition-colors">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button onClick={() => { openDoc(c); setEditingDoc(true); }} className="text-[10px] text-[#555] hover:text-[#b6332e] flex items-center gap-1 whitespace-nowrap transition-colors">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Contract Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#eee]">New Contract</h2>
                <button onClick={() => setShowNewModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Contract Type</label>
                <select className="os-input cursor-pointer" value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value as ContractType }))}>
                  {(Object.entries(TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Recipient Name *</label>
                <input type="text" className="os-input" value={newForm.recipientName} onChange={e => setNewForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="Client or contractor name" autoFocus />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Linked Project (optional)</label>
                <select className="os-input cursor-pointer" value={newForm.projectId} onChange={e => setNewForm(f => ({ ...f, projectId: e.target.value }))}>
                  <option value="">None</option>
                  {mockProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Expiry Date (optional)</label>
                <input type="date" className="os-input" value={newForm.expiresAt} onChange={e => setNewForm(f => ({ ...f, expiresAt: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNewModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={createContract} disabled={!newForm.recipientName.trim()} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> Create Draft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Viewer/Editor Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingDoc(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl h-[85vh] glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] flex flex-col shadow-2xl overflow-hidden">
              {/* Doc Header */}
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#b6332e]" />
                  <div>
                    <p className="text-sm font-bold text-[#eee]">{TYPE_LABELS[viewingDoc.type]}</p>
                    <p className="text-[10px] text-[#555]">{viewingDoc.id === 'tmpl' ? 'Template Preview' : viewingDoc.recipientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editingDoc ? (
                    <button onClick={() => setEditingDoc(true)} className="btn-secondary text-xs">
                      <PenTool className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <button onClick={() => setEditingDoc(false)} className="btn-primary text-xs">
                      <Save className="w-3 h-3" /> Save
                    </button>
                  )}
                  <button className="btn-ghost text-xs"><Download className="w-3 h-3" /> PDF</button>
                  <button onClick={() => setViewingDoc(null)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
                </div>
              </div>
              {/* Doc Body */}
              <div className="flex-1 overflow-auto bg-[#020202] p-0 m-0">
                {editingDoc ? (
                  <textarea
                    className="w-full h-full bg-transparent text-[#ccc] text-sm font-mono leading-relaxed p-6 resize-none focus:outline-none"
                    value={docContent}
                    onChange={e => setDocContent(e.target.value)}
                  />
                ) : (
                  <pre className="text-[#ccc] text-sm font-mono leading-relaxed p-6 whitespace-pre-wrap">{docContent}</pre>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
