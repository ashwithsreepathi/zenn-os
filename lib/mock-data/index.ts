import type { OSUser, Project, Transaction, Lead, ActivityEvent, Nudge, Equipment, Contract, ChatMessage, ChatChannel } from '@/lib/types';

// ─── Users ────────────────────────────────────────────────────────────────────
export const mockUsers: OSUser[] = [
  {
    id: 'usr_admin_01',
    email: 'ash@zennstudios.ca',
    name: 'Ashwith Sreepathi',
    role: 'admin',
    title: 'Founder & Creative Director',
    isOnboarded: true,
    timezone: 'America/Toronto',
    joinedAt: '2023-01-01',
    status: 'active',
    reliabilityScore: 100,
    nudgeCount: 0,
    currentLoad: 6,
  },
  {
    id: 'usr_aff_01',
    email: 'jordan@freelance.io',
    name: 'Jordan Vance',
    role: 'affiliate',
    title: 'Lead Video Editor',
    isOnboarded: true,
    timezone: 'America/Vancouver',
    joinedAt: '2024-03-15',
    status: 'active',
    skills: ['Color Grading', 'DaVinci Resolve', '4K Editing', 'Motion Graphics'],
    reliabilityScore: 87,
    nudgeCount: 3,
    currentLoad: 2,
  },
  {
    id: 'usr_aff_02',
    email: 'mia.chen@design.co',
    name: 'Mia Chen',
    role: 'affiliate',
    title: 'Brand & UI Designer',
    isOnboarded: true,
    timezone: 'America/New_York',
    joinedAt: '2024-05-20',
    status: 'active',
    skills: ['Figma', 'Brand Identity', 'UI/UX', 'Motion Design'],
    reliabilityScore: 94,
    nudgeCount: 1,
    currentLoad: 3,
  },
  {
    id: 'usr_emp_01',
    email: 'sam.ko@zennstudios.ca',
    name: 'Sam Ko',
    role: 'employee',
    title: 'Project Manager',
    isOnboarded: true,
    timezone: 'America/Toronto',
    joinedAt: '2024-01-10',
    status: 'active',
    reliabilityScore: 96,
    nudgeCount: 0,
    currentLoad: 5,
  },
  {
    id: 'usr_client_01',
    email: 'info@montax.ca',
    name: 'Marcus Bellamy',
    role: 'client',
    title: 'CEO, Montax Financial',
    company: 'Montax Financial',
    isOnboarded: true,
    timezone: 'America/Toronto',
    joinedAt: '2024-11-01',
    status: 'active',
    currentLoad: 1,
    serviceSubscriptions: [
      { type: 'web', projectId: 'proj_001', projectName: 'Montax Platform V2', startedAt: '2025-10-01' },
      { type: 'business_dev', projectId: 'proj_001', projectName: 'Montax Platform V2', startedAt: '2025-10-01' },
    ],
  },
  {
    id: 'usr_client_02',
    email: 'team@blackfridaybins.ca',
    name: 'Taylor Brooks',
    role: 'client',
    title: 'Marketing Director, Black Friday Bins',
    company: 'Black Friday Bins',
    isOnboarded: true,
    timezone: 'America/Edmonton',
    joinedAt: '2025-01-15',
    status: 'active',
    currentLoad: 1,
    serviceSubscriptions: [
      { type: 'video', projectId: 'proj_002', projectName: 'Black Friday Bins — Spring Campaign', startedAt: '2025-01-15' },
      { type: 'social_media', projectId: 'proj_002', projectName: 'Black Friday Bins — Spring Campaign', startedAt: '2025-01-15' },
      { type: 'photography', projectId: 'proj_002', projectName: 'Black Friday Bins — Spring Campaign', startedAt: '2025-01-15' },
    ],
  },
  {
    id: 'usr_aff_03',
    email: 'rex.audio@studio.com',
    name: 'Rex Drummond',
    role: 'affiliate',
    title: 'Sound Designer',
    isOnboarded: false,
    timezone: 'America/Chicago',
    joinedAt: '2025-12-01',
    status: 'limited',
    skills: ['Pro Tools', 'Logic Pro', 'Sound Design', 'Music Composition'],
    reliabilityScore: 72,
    nudgeCount: 8,
    currentLoad: 1,
  },
];

export function getUserById(id: string): OSUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getUsersByRole(role: string): OSUser[] {
  return mockUsers.filter((u) => u.role === role);
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    name: 'Montax Platform V2',
    clientId: 'usr_client_01',
    clientName: 'Montax Financial',
    type: 'web',
    status: 'active',
    totalValue: 28000,
    paidToDate: 14000,
    startDate: '2025-10-01',
    endDate: '2026-02-28',
    healthStatus: 'green',
    completionPercent: 62,
    assignedTeam: ['usr_admin_01', 'usr_emp_01', 'usr_aff_02'],
    milestones: [
      { id: 'ms_001_1', name: 'Discovery & Architecture', status: 'approved', assignedTo: ['usr_admin_01'], startDate: '2025-10-01', endDate: '2025-10-14', progress: 100, isClientVisible: true, dependencies: [], payout: 2000 },
      { id: 'ms_001_2', name: 'UI/UX Design System', status: 'approved', assignedTo: ['usr_aff_02'], startDate: '2025-10-15', endDate: '2025-11-01', progress: 100, isClientVisible: true, dependencies: ['ms_001_1'], payout: 3500 },
      { id: 'ms_001_3', name: 'Frontend Development', status: 'in_progress', assignedTo: ['usr_emp_01'], startDate: '2025-11-02', endDate: '2026-01-15', progress: 70, isClientVisible: true, dependencies: ['ms_001_2'], payout: 8000 },
      { id: 'ms_001_4', name: 'Backend & API Integration', status: 'locked', assignedTo: ['usr_admin_01'], startDate: '2026-01-16', endDate: '2026-02-10', progress: 0, isClientVisible: false, dependencies: ['ms_001_3'], payout: 6000 },
      { id: 'ms_001_5', name: 'QA & Launch', status: 'locked', assignedTo: ['usr_emp_01', 'usr_admin_01'], startDate: '2026-02-11', endDate: '2026-02-28', progress: 0, isClientVisible: true, dependencies: ['ms_001_4'], payout: 1500 },
    ],
    vaultId: 'vault_001',
  },
  {
    id: 'proj_002',
    name: 'Black Friday Bins — Spring Campaign',
    clientId: 'usr_client_02',
    clientName: 'Black Friday Bins',
    type: 'video',
    status: 'active',
    totalValue: 15500,
    paidToDate: 7750,
    startDate: '2026-01-10',
    endDate: '2026-03-31',
    healthStatus: 'amber',
    completionPercent: 45,
    assignedTeam: ['usr_admin_01', 'usr_aff_01', 'usr_aff_03'],
    milestones: [
      { id: 'ms_002_1', name: 'Pre-Production & Scripting', status: 'approved', assignedTo: ['usr_admin_01'], startDate: '2026-01-10', endDate: '2026-01-24', progress: 100, isClientVisible: true, dependencies: [], payout: 1500 },
      { id: 'ms_002_2', name: 'Shoot Days (3)', status: 'approved', assignedTo: ['usr_admin_01', 'usr_aff_01'], startDate: '2026-01-25', endDate: '2026-02-05', progress: 100, isClientVisible: true, dependencies: ['ms_002_1'], payout: 4000 },
      { id: 'ms_002_3', name: 'Edit & Color Grade', status: 'submitted', assignedTo: ['usr_aff_01'], startDate: '2026-02-06', endDate: '2026-02-28', progress: 100, isClientVisible: true, dependencies: ['ms_002_2'], payout: 3500 },
      { id: 'ms_002_4', name: 'Sound Design & Mix', status: 'in_progress', assignedTo: ['usr_aff_03'], startDate: '2026-02-20', endDate: '2026-03-10', progress: 40, isClientVisible: false, dependencies: ['ms_002_3'], payout: 2000 },
      { id: 'ms_002_5', name: 'Final Delivery', status: 'locked', assignedTo: ['usr_admin_01'], startDate: '2026-03-11', endDate: '2026-03-31', progress: 0, isClientVisible: true, dependencies: ['ms_002_4'], payout: 1000 },
    ],
    vaultId: 'vault_002',
  },
  {
    id: 'proj_003',
    name: 'MyCrossCanada Brand Identity',
    clientId: 'usr_client_01',
    clientName: 'MyCrossCanada',
    type: 'branding',
    status: 'completed',
    totalValue: 12000,
    paidToDate: 12000,
    startDate: '2025-06-01',
    endDate: '2025-09-30',
    healthStatus: 'green',
    completionPercent: 100,
    assignedTeam: ['usr_admin_01', 'usr_aff_02'],
    milestones: [],
    vaultId: 'vault_003',
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getProjectsByClientId(clientId: string): Project[] {
  return mockProjects.filter((p) => p.clientId === clientId);
}

export function getProjectsByUserId(userId: string): Project[] {
  return mockProjects.filter((p) => p.assignedTeam.includes(userId));
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const mockTransactions: Transaction[] = [
  { id: 'txn_001', date: '2026-04-08', entity: 'Montax Financial', entityId: 'usr_client_01', projectId: 'proj_001', projectName: 'Montax Platform V2', type: 'incoming', amount: 14000, status: 'paid', description: 'Milestone 1-2 Payment', invoiceId: 'inv_0021', isReconciled: true },
  { id: 'txn_002', date: '2026-04-06', entity: 'Jordan Vance', entityId: 'usr_aff_01', projectId: 'proj_002', projectName: 'BFB Spring Campaign', type: 'outgoing', amount: 3500, status: 'pending', description: 'Edit & Color Grade Payout', invoiceId: 'po_0018' },
  { id: 'txn_003', date: '2026-04-05', entity: 'Black Friday Bins', entityId: 'usr_client_02', projectId: 'proj_002', projectName: 'BFB Spring Campaign', type: 'incoming', amount: 7750, status: 'paid', description: 'Deposit + Milestone 2', invoiceId: 'inv_0020', isReconciled: true },
  { id: 'txn_004', date: '2026-04-01', entity: 'Mia Chen', entityId: 'usr_aff_02', projectId: 'proj_001', projectName: 'Montax Platform V2', type: 'outgoing', amount: 3500, status: 'paid', description: 'UI/UX Design System Payout', invoiceId: 'po_0017', isReconciled: true },
  { id: 'txn_005', date: '2026-03-28', entity: 'Rex Drummond', entityId: 'usr_aff_03', projectId: 'proj_002', projectName: 'BFB Spring Campaign', type: 'outgoing', amount: 800, status: 'pending', description: 'Partial Sound Design advance', isFlagged: true },
  { id: 'txn_006', date: '2026-03-15', entity: 'MyCrossCanada', entityId: 'usr_client_01', projectId: 'proj_003', projectName: 'Brand Identity', type: 'incoming', amount: 5000, status: 'paid', description: 'Final Balance', invoiceId: 'inv_0019', isReconciled: true },
  { id: 'txn_007', date: '2026-05-01', entity: 'Montax Financial', entityId: 'usr_client_01', projectId: 'proj_001', projectName: 'Montax Platform V2', type: 'incoming', amount: 14000, status: 'overdue', description: 'Milestone 3-4 Payment', invoiceId: 'inv_0022' },
];

// ─── Leads ────────────────────────────────────────────────────────────────────
export const mockLeads: Lead[] = [
  { id: 'lead_001', companyName: 'Apex Ventures', contactName: 'Diana Cho', email: 'diana@apexventures.co', projectType: 'web', estimatedBudget: 35000, source: 'referral', stage: 'qualification', score: 82, temperature: 'hot', createdAt: '2026-04-07', lastActivity: '2026-04-09', notes: 'Looking for full SaaS platform. Decision maker confirmed.' },
  { id: 'lead_002', companyName: 'Drift Coffee Co.', contactName: 'Amir Hassan', email: 'amir@driftcoffee.com', projectType: 'branding', estimatedBudget: 8500, source: 'instagram', stage: 'estimate_sent', score: 65, temperature: 'warm', createdAt: '2026-04-05', lastActivity: '2026-04-08' },
  { id: 'lead_003', companyName: 'Generic LLC', contactName: 'Unknown Sender', email: 'noreply123@gmail.com', projectType: 'video', estimatedBudget: 50000, source: 'direct', stage: 'new', score: 12, temperature: 'cold', createdAt: '2026-04-09', lastActivity: '2026-04-09', isSpamFlag: true },
  { id: 'lead_004', companyName: 'Solstice Wellness', contactName: 'Priya Mehta', email: 'priya@solsticewellness.ca', projectType: 'social', estimatedBudget: 4800, source: 'seo', stage: 'negotiation', score: 73, temperature: 'warm', createdAt: '2026-03-28', lastActivity: '2026-04-06' },
  { id: 'lead_005', companyName: 'Northfield Properties', contactName: 'Tyler Booth', email: 'tyler@northfield.ca', projectType: 'full_brand', estimatedBudget: 62000, source: 'referral', stage: 'new', score: 88, temperature: 'hot', createdAt: '2026-04-10', lastActivity: '2026-04-10', notes: 'Referred by Montax. High budget, serious.' },
];

// ─── Activity Feed ─────────────────────────────────────────────────────────────
export const mockActivity: ActivityEvent[] = [
  { id: 'act_001', timestamp: '2026-04-10T11:45:00Z', userId: 'usr_client_01', userName: 'Marcus Bellamy', userRole: 'client', action: 'Signed IP Transfer Deed', detail: 'Executed IP transfer for Montax Platform V2 - Phase 1', projectId: 'proj_001', projectName: 'Montax Platform V2', category: 'legal' },
  { id: 'act_002', timestamp: '2026-04-10T10:22:00Z', userId: 'usr_aff_01', userName: 'Jordan Vance', userRole: 'affiliate', action: 'Submitted Milestone Proof', detail: 'Edit & Color Grade v02 submitted for review', projectId: 'proj_002', projectName: 'BFB Spring Campaign', category: 'production' },
  { id: 'act_003', timestamp: '2026-04-10T09:05:00Z', userId: 'usr_admin_01', userName: 'Ashwith Sreepathi', userRole: 'admin', action: 'New Inquiry Received', detail: 'Lead from Northfield Properties — $62,000 full brand', category: 'system' },
  { id: 'act_004', timestamp: '2026-04-09T16:30:00Z', userId: 'usr_client_02', userName: 'Taylor Brooks', userRole: 'client', action: 'Payment Confirmed', detail: '$7,750 deposit received — Inv #0020', projectId: 'proj_002', projectName: 'BFB Spring Campaign', category: 'financial' },
  { id: 'act_005', timestamp: '2026-04-09T14:10:00Z', userId: 'usr_aff_02', userName: 'Mia Chen', userRole: 'affiliate', action: 'Milestone Approved', detail: 'UI/UX Design System approved by client', projectId: 'proj_001', projectName: 'Montax Platform V2', category: 'production' },
  { id: 'act_006', timestamp: '2026-04-08T11:00:00Z', userId: 'usr_admin_01', userName: 'Ashwith Sreepathi', userRole: 'admin', action: 'Permission Override', detail: 'Manually unlocked Vault access for Rex Drummond without dependency completion', projectId: 'proj_002', projectName: 'BFB Spring Campaign', category: 'access', isRedFlag: true },
];

// ─── Nudges ───────────────────────────────────────────────────────────────────
export const mockNudges: Nudge[] = [
  { id: 'nudge_001', recipientId: 'usr_aff_03', recipientName: 'Rex Drummond', triggerType: 'talent_reminder', level: 2, status: 'sent', sentAt: '2026-04-09T09:00:00Z', projectId: 'proj_002', projectName: 'BFB Spring Campaign', message: 'This is now the primary bottleneck for BFB Spring Campaign. Sound design is 40% — please update your status.' },
  { id: 'nudge_002', recipientId: 'usr_client_02', recipientName: 'Taylor Brooks', triggerType: 'client_approval', level: 1, status: 'delivered', sentAt: '2026-04-08T10:00:00Z', projectId: 'proj_002', projectName: 'BFB Spring Campaign', message: 'Jordan has submitted the Edit & Color Grade for your review. Please take a look when you have a moment!' },
  { id: 'nudge_003', recipientId: 'usr_client_01', recipientName: 'Marcus Bellamy', triggerType: 'payment_chaser', level: 1, status: 'scheduled', projectId: 'proj_001', projectName: 'Montax Platform V2', message: 'Invoice #0022 for $14,000 is due. Please confirm your payment schedule.' },
];

// ─── Equipment ────────────────────────────────────────────────────────────────
export const mockEquipment: Equipment[] = [
  { id: 'eq_001', name: 'Sony FX6 Cinema Camera', type: 'camera', owner: 'agency', status: 'checked_out', checkedOutTo: 'usr_admin_01', checkedOutProject: 'proj_002', expectedReturn: '2026-04-15', value: 6000, isVerified: true, condition: 'excellent', serialNumber: 'SN-FX6-2024-001' },
  { id: 'eq_002', name: 'DJI Mavic 3 Pro (4K Drone)', type: 'camera', owner: 'usr_aff_01', status: 'available', value: 2200, isVerified: true, condition: 'excellent', serialNumber: 'DJI-M3P-JV-01' },
  { id: 'eq_003', name: 'Aputure 600D Pro (LED)', type: 'lighting', owner: 'agency', status: 'available', value: 1500, isVerified: true, condition: 'good' },
  { id: 'eq_004', name: 'MacBook Pro M3 Max (96GB)', type: 'computer', owner: 'agency', status: 'checked_out', checkedOutTo: 'usr_emp_01', expectedReturn: '2026-04-30', value: 4500, condition: 'excellent' },
  { id: 'eq_005', name: 'Rode NTG5 Shotgun Mic', type: 'audio', owner: 'agency', status: 'in_repair', value: 600, condition: 'needs_repair' },
];

// ─── Contracts ────────────────────────────────────────────────────────────────
export const mockContracts: Contract[] = [
  { id: 'con_001', type: 'ip_transfer', recipientId: 'usr_client_01', recipientName: 'Marcus Bellamy', projectId: 'proj_001', projectName: 'Montax Platform V2', status: 'executed', sentAt: '2026-04-01', executedAt: '2026-04-10' },
  { id: 'con_002', type: 'nda', recipientId: 'usr_aff_01', recipientName: 'Jordan Vance', projectId: 'proj_002', projectName: 'BFB Spring Campaign', status: 'executed', sentAt: '2026-01-08', executedAt: '2026-01-09', expiresAt: '2027-01-09' },
  { id: 'con_003', type: 'contractor', recipientId: 'usr_aff_03', recipientName: 'Rex Drummond', projectId: 'proj_002', projectName: 'BFB Spring Campaign', status: 'viewed', sentAt: '2026-04-05' },
  { id: 'con_004', type: 'msa', recipientId: 'usr_client_02', recipientName: 'Taylor Brooks', projectId: 'proj_002', projectName: 'BFB Spring Campaign', status: 'executed', sentAt: '2026-01-09', executedAt: '2026-01-10' },
];

// ─── Chat Channels ─────────────────────────────────────────────────────────────
export const mockChatChannels: ChatChannel[] = [
  { id: 'ch_001', name: 'montax-platform-v2', type: 'client_shared', projectId: 'proj_001', members: ['usr_admin_01', 'usr_emp_01', 'usr_aff_02', 'usr_client_01'], lastMessageAt: '2026-04-10T11:45:00Z' },
  { id: 'ch_002', name: 'bfb-spring-campaign', type: 'client_shared', projectId: 'proj_002', members: ['usr_admin_01', 'usr_aff_01', 'usr_aff_03', 'usr_client_02'], lastMessageAt: '2026-04-10T11:15:00Z', unreadCount: 2 },
  { id: 'ch_003', name: 'production-crew', type: 'agency_internal', members: ['usr_admin_01', 'usr_emp_01', 'usr_aff_01', 'usr_aff_02', 'usr_aff_03'], lastMessageAt: '2026-04-09T16:00:00Z' },
  { id: 'ch_004', name: 'exec-ops', type: 'executive_only', members: ['usr_admin_01'], lastMessageAt: '2026-04-08T09:00:00Z' },
];

// ─── Chat Messages ─────────────────────────────────────────────────────────────
export const mockChatMessages: ChatMessage[] = [
  { id: 'msg_001', channelId: 'ch_002', senderId: 'usr_admin_01', senderName: 'Ashwith', senderRole: 'admin', content: 'Jordan — the v02 color grade looks great. The warmth on the bin reveal shots is perfect.', timestamp: '2026-04-10T10:30:00Z' },
  { id: 'msg_002', channelId: 'ch_002', senderId: 'usr_aff_01', senderName: 'Jordan Vance', senderRole: 'affiliate', content: 'Thanks! I pushed the shadows a touch cooler in the wide shots to contrast. Let me know if the client wants anything tweaked.', timestamp: '2026-04-10T10:35:00Z' },
  { id: 'msg_003', channelId: 'ch_002', senderId: 'usr_admin_01', senderName: 'Ashwith', senderRole: 'admin', content: "Hey Taylor 👋 Jordan's color grade for the Spring Campaign is ready for your review! Check the Proof Review section when you can.", timestamp: '2026-04-10T10:50:00Z' },
  { id: 'msg_004', channelId: 'ch_002', senderId: 'usr_client_02', senderName: 'Taylor Brooks', senderRole: 'client', content: "Awesome, I'll take a look this afternoon. The shoot days footage looked incredible, very excited to see the final.", timestamp: '2026-04-10T11:15:00Z' },
  { id: 'msg_005', channelId: 'ch_001', senderId: 'usr_emp_01', senderName: 'Sam Ko', senderRole: 'employee', content: 'Marcus, Phase 3 frontend is 70% complete. On track for Jan 15 delivery.', timestamp: '2026-04-09T14:00:00Z' },
  { id: 'msg_006', channelId: 'ch_001', senderId: 'usr_client_01', senderName: 'Marcus Bellamy', senderRole: 'client', content: 'Perfect, thank you for the update. The dashboard mockups looked sharp — very excited.', timestamp: '2026-04-09T14:30:00Z' },
  { id: 'msg_007', channelId: 'ch_003', senderId: 'usr_admin_01', senderName: 'Ashwith', senderRole: 'admin', content: 'Team reminder — please update your milestone statuses by EOD Friday.', timestamp: '2026-04-08T09:00:00Z', isActionRequired: true },
];

// ─── KPI / Dashboard ──────────────────────────────────────────────────────────
export const mockKPIs = {
  grossRevenue: 43500,
  grossRevenueTrend: [28000, 31000, 29500, 35000, 38000, 43500],
  netProfit: 22100,
  netProfitTrend: [14000, 15500, 13000, 17000, 19500, 22100],
  projectVelocity: 34, // avg days per milestone
  projectVelocityTrend: [42, 38, 45, 36, 34, 34],
  activePipeline: 97800,
  activePipelineTrend: [55000, 68000, 72000, 80000, 91000, 97800],
  plData: [
    { month: 'Nov', revenue: 28000, expenses: 13000 },
    { month: 'Dec', revenue: 31000, expenses: 15000 },
    { month: 'Jan', revenue: 29500, expenses: 16000 },
    { month: 'Feb', revenue: 35000, expenses: 16500 },
    { month: 'Mar', revenue: 38000, expenses: 16400 },
    { month: 'Apr', revenue: 43500, expenses: 21400 },
  ],
};
