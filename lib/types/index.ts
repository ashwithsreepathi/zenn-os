// ─── Zenn OS Type System ──────────────────────────────────────────────────────

export type UserRole = 'admin' | 'employee' | 'affiliate' | 'client';
export type ServiceType = 'web' | 'branding' | 'photography' | 'social_media' | 'video' | 'business_dev';

export interface ServiceSubscription {
  type: ServiceType;
  projectId?: string;
  projectName?: string;
  startedAt: string;
}

export interface OSUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  avatar?: string;
  isOnboarded: boolean;
  timezone: string;
  joinedAt: string;
  status: 'active' | 'limited' | 'ooo' | 'blacklisted';
  skills?: string[];
  reliabilityScore?: number; // 0-100
  nudgeCount?: number;
  currentLoad?: number; // active projects
  // Client-only
  serviceSubscriptions?: ServiceSubscription[];
  company?: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'awaiting_approval' | 'on_hold' | 'completed' | 'archived';
export type MilestoneStatus = 'locked' | 'unlocked' | 'in_progress' | 'submitted' | 'approved' | 'overdue';

export interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  assignedTo: string[]; // user IDs
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  isClientVisible: boolean;
  dependencies: string[]; // milestone IDs
  payout?: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: 'web' | 'video' | 'branding' | 'social' | 'full_brand';
  status: ProjectStatus;
  totalValue: number;
  paidToDate: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  assignedTeam: string[]; // user IDs
  healthStatus: 'green' | 'amber' | 'red';
  completionPercent: number;
  vaultId?: string;
  brief?: string;
  tags?: string[];
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export type TransactionType = 'incoming' | 'outgoing';
export type TransactionStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Transaction {
  id: string;
  date: string;
  entity: string;
  entityId: string;
  projectId: string;
  projectName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  invoiceId?: string;
  isFlagged?: boolean;
  isReconciled?: boolean;
}

export interface PayoutAllocation {
  userId: string;
  userName: string;
  role: string;
  allocationType: 'fixed' | 'percentage';
  amount: number;
  percentage?: number;
  notes?: string;
}

// ─── Leads / CRM ──────────────────────────────────────────────────────────────

export type LeadStage = 'new' | 'qualification' | 'estimate_sent' | 'negotiation' | 'converted' | 'lost';

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  projectType: string;
  estimatedBudget: number;
  source: 'seo' | 'referral' | 'instagram' | 'linkedin' | 'cold' | 'direct';
  stage: LeadStage;
  score: number; // 0-100
  temperature: 'cold' | 'warm' | 'hot';
  createdAt: string;
  lastActivity: string;
  notes?: string;
  isSpamFlag?: boolean;
}

// ─── Notifications / Nudges ───────────────────────────────────────────────────

export type NudgeLevel = 1 | 2 | 3;
export type NudgeStatus = 'scheduled' | 'sent' | 'delivered' | 'responded' | 'escalated';

export interface Nudge {
  id: string;
  recipientId: string;
  recipientName: string;
  triggerType: 'talent_reminder' | 'client_approval' | 'payment_chaser' | 'custom';
  level: NudgeLevel;
  status: NudgeStatus;
  sentAt?: string;
  respondedAt?: string;
  projectId: string;
  projectName: string;
  message: string;
}

// ─── Activity / Events ────────────────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  detail: string;
  projectId?: string;
  projectName?: string;
  category: 'financial' | 'legal' | 'production' | 'access' | 'system';
  isRedFlag?: boolean;
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  type: 'camera' | 'lens' | 'lighting' | 'audio' | 'computer' | 'storage' | 'other';
  owner: 'agency' | string; // agency or userId
  status: 'available' | 'checked_out' | 'in_repair' | 'missing';
  checkedOutTo?: string; // userId
  checkedOutProject?: string; // projectId
  expectedReturn?: string;
  serialNumber?: string;
  purchaseDate?: string;
  value?: number;
  isVerified?: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
}

// ─── Contracts / Legal ────────────────────────────────────────────────────────

export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'partially_signed' | 'executed';
export type ContractType = 'msa' | 'nda' | 'ip_transfer' | 'contractor' | 'sow';

export interface Contract {
  id: string;
  type: ContractType;
  recipientId?: string;
  recipientName: string;
  projectId?: string;
  projectName?: string;
  status: ContractStatus;
  sentAt?: string;
  executedAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ChannelType = 'client_shared' | 'agency_internal' | 'executive_only' | 'direct';

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  projectId?: string;
  members: string[]; // user IDs
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isPinned?: boolean;
  isActionRequired?: boolean;
  attachments?: { name: string; type: string; url: string }[];
}

// ─── Vault ────────────────────────────────────────────────────────────────────

export type AssetVisibility = 'internal' | 'client_visible';

export interface VaultAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'document' | 'audio' | 'archive' | 'design';
  size: number; // bytes
  uploadedBy: string;
  uploadedAt: string;
  milestoneId?: string;
  visibility: AssetVisibility;
  versions: { version: string; uploadedAt: string; url: string }[];
  thumbnailUrl?: string;
  isSubmittedAsProof?: boolean;
  proofVersion?: string;
  resolution?: string;
  duration?: string; // for video
  codec?: string;
}
