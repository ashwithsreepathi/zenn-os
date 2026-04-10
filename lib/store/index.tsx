// ─── Zenn OS Mock Backend Store ────────────────────────────────────────────────
// Client-side persistent store using localStorage.
// Simulates API mutations with 300ms async delay.

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Project, Lead, OSUser, Nudge, Transaction, Equipment, Contract, ChatMessage } from '@/lib/types';
import {
  mockProjects as initialProjects,
  mockLeads as initialLeads,
  mockUsers as initialUsers,
  mockNudges as initialNudges,
  mockTransactions as initialTransactions,
  mockEquipment as initialEquipment,
  mockContracts as initialContracts,
  mockChatMessages as initialMessages,
} from '@/lib/mock-data';

// ─── Quotation Types ──────────────────────────────────────────────────────────
export interface QuoteLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  category: 'design' | 'development' | 'video' | 'strategy' | 'retainer' | 'other';
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  projectType: string;
  lineItems: QuoteLineItem[];
  notes: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  templateId?: string;
  createdAt: string;
  sentAt?: string;
  discount?: number; // percentage
  tax?: number; // percentage
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  projectType: string;
  lineItems: Omit<QuoteLineItem, 'id'>[];
  notes: string;
  estimatedDays: number;
}

// ─── Enquiry Types ─────────────────────────────────────────────────────────────
export interface Enquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget: string;
  message: string;
  source: string;
  createdAt: string;
  status: 'new' | 'read' | 'responded' | 'converted' | 'spam';
}

// ─── Store State ──────────────────────────────────────────────────────────────
interface StoreState {
  projects: Project[];
  leads: Lead[];
  users: OSUser[];
  nudges: Nudge[];
  transactions: Transaction[];
  equipment: Equipment[];
  contracts: Contract[];
  messages: ChatMessage[];
  quotes: Quote[];
  enquiries: Enquiry[];
  isLoading: boolean;
}

interface StoreActions {
  // Projects
  addProject: (p: Omit<Project, 'id'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Project['milestones'][0]>) => Promise<void>;
  // Leads
  addLead: (l: Omit<Lead, 'id' | 'createdAt' | 'lastActivity'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  // Users
  updateUser: (id: string, updates: Partial<OSUser>) => Promise<void>;
  // Enquiries
  addEnquiry: (e: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => Promise<Enquiry>;
  updateEnquiry: (id: string, updates: Partial<Enquiry>) => Promise<void>;
  // Quotes
  addQuote: (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  // Transactions
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<Transaction>;
  // Reset
  resetToDefaults: () => void;
}

type Store = StoreState & StoreActions;

const StoreContext = createContext<Store | null>(null);

// ─── Initial Enquiries ─────────────────────────────────────────────────────────
const initialEnquiries: Enquiry[] = [
  {
    id: 'enq_001',
    name: 'Diana Cho',
    email: 'diana@apexventures.co',
    company: 'Apex Ventures',
    projectType: 'SaaS Platform',
    budget: '$30,000 – $50,000',
    message: 'Looking for a full-stack agency to build a SaaS platform for HR analytics. We have a design brief ready.',
    source: 'Referral',
    createdAt: '2026-04-07T09:00:00Z',
    status: 'read',
  },
  {
    id: 'enq_002',
    name: 'Amir Hassan',
    email: 'amir@driftcoffee.com',
    company: 'Drift Coffee Co.',
    projectType: 'Brand Identity',
    budget: '$5,000 – $10,000',
    message: "We're a specialty coffee brand looking for a full brand identity — logo, packaging, brand guidelines.",
    source: 'Instagram',
    createdAt: '2026-04-05T14:30:00Z',
    status: 'new',
  },
  {
    id: 'enq_003',
    name: 'Tyler Booth',
    email: 'tyler@northfield.ca',
    company: 'Northfield Properties',
    projectType: 'Full Brand Package',
    budget: '$60,000+',
    message: 'Referred by Marcus at Montax. We need a complete rebrand — brand identity, website, marketing collateral. Serious, want to start ASAP.',
    source: 'Referral',
    createdAt: '2026-04-10T08:00:00Z',
    status: 'new',
  },
];

// ─── Initial Quotes ────────────────────────────────────────────────────────────
export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tpl_brand',
    name: 'Brand Identity Package',
    description: 'Logo, brand guidelines, color system, typography',
    projectType: 'Branding',
    estimatedDays: 21,
    notes: 'All source files (AI, PDF, PNG) delivered upon final payment. IP transfers upon full settlement.',
    lineItems: [
      { description: 'Brand Discovery Workshop (2 sessions)', qty: 1, unitPrice: 1500, category: 'strategy' },
      { description: 'Logo Design (3 concepts + revisions)', qty: 1, unitPrice: 3500, category: 'design' },
      { description: 'Brand Guidelines Document', qty: 1, unitPrice: 1200, category: 'design' },
      { description: 'Color System + Typography Spec', qty: 1, unitPrice: 800, category: 'design' },
      { description: 'Business Card + Letterhead Design', qty: 1, unitPrice: 600, category: 'design' },
      { description: 'Social Media Kit (6 templates)', qty: 1, unitPrice: 900, category: 'design' },
    ],
  },
  {
    id: 'tpl_web',
    name: 'Web Platform Build',
    description: 'Custom web app or multi-page marketing site',
    projectType: 'Web Development',
    estimatedDays: 60,
    notes: 'Built on Next.js + Tailwind. Performance-first, CMS-ready. 30-day post-launch support included.',
    lineItems: [
      { description: 'Discovery & Architecture Planning', qty: 1, unitPrice: 2500, category: 'strategy' },
      { description: 'UI/UX Design System (Figma)', qty: 1, unitPrice: 4000, category: 'design' },
      { description: 'Frontend Development (per page)', qty: 8, unitPrice: 800, category: 'development' },
      { description: 'CMS Integration (Sanity/Contentful)', qty: 1, unitPrice: 2000, category: 'development' },
      { description: 'Backend/API Integration', qty: 1, unitPrice: 3500, category: 'development' },
      { description: 'QA, Performance Audit & Launch', qty: 1, unitPrice: 1500, category: 'development' },
    ],
  },
  {
    id: 'tpl_video',
    name: 'Video Campaign Package',
    description: 'Hero video, social cuts, raw footage archival',
    projectType: 'Video Production',
    estimatedDays: 28,
    notes: 'All footage archived in 4K ProRes. Includes 3 rounds of revisions. Usage rights transferred upon final payment.',
    lineItems: [
      { description: 'Pre-Production & Storyboard', qty: 1, unitPrice: 1500, category: 'strategy' },
      { description: 'Shoot Day (Full Crew)', qty: 2, unitPrice: 3500, category: 'video' },
      { description: 'Primary Edit (Hero 60–90s)', qty: 1, unitPrice: 2500, category: 'video' },
      { description: 'Color Grade & Grade Master', qty: 1, unitPrice: 1200, category: 'video' },
      { description: 'Sound Design & Mix', qty: 1, unitPrice: 900, category: 'video' },
      { description: 'Social Cuts (3x :30 + 3x :15)', qty: 1, unitPrice: 1800, category: 'video' },
    ],
  },
  {
    id: 'tpl_retainer',
    name: 'Monthly Retainer',
    description: 'Ongoing social content, ads, and brand support',
    projectType: 'Retainer',
    estimatedDays: 30,
    notes: 'Month-to-month. 30-day notice required for cancellation. Hours do not roll over.',
    lineItems: [
      { description: 'Social Media Content (12 posts/mo)', qty: 1, unitPrice: 1800, category: 'retainer' },
      { description: 'Ad Creative (4 sets/mo)', qty: 1, unitPrice: 1200, category: 'retainer' },
      { description: 'Monthly Strategy Call', qty: 1, unitPrice: 300, category: 'strategy' },
      { description: 'Performance Report + Analytics', qty: 1, unitPrice: 200, category: 'strategy' },
    ],
  },
];

function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(`zenn_os_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`zenn_os_${key}`, JSON.stringify(value));
  } catch { /* quota exceeded, ignore */ }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', initialProjects));
  const [leads, setLeads] = useState<Lead[]>(() => loadFromStorage('leads', initialLeads));
  const [users, setUsers] = useState<OSUser[]>(() => loadFromStorage('users', initialUsers));
  const [nudges, setNudges] = useState<Nudge[]>(() => loadFromStorage('nudges', initialNudges));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('transactions', initialTransactions));
  const [equipment] = useState<Equipment[]>(initialEquipment);
  const [contracts] = useState<Contract[]>(initialContracts);
  const [messages] = useState<ChatMessage[]>(initialMessages);
  const [quotes, setQuotes] = useState<Quote[]>(() => loadFromStorage('quotes', []));
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => loadFromStorage('enquiries', initialEnquiries));
  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage on state changes
  useEffect(() => { saveToStorage('projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('leads', leads); }, [leads]);
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('nudges', nudges); }, [nudges]);
  useEffect(() => { saveToStorage('transactions', transactions); }, [transactions]);
  useEffect(() => { saveToStorage('quotes', quotes); }, [quotes]);
  useEffect(() => { saveToStorage('enquiries', enquiries); }, [enquiries]);

  const addProject = useCallback(async (p: Omit<Project, 'id'>) => {
    await delay();
    const newProject: Project = { ...p, id: generateId('proj') };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    await delay();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await delay();
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateMilestone = useCallback(async (projectId: string, milestoneId: string, updates: Partial<Project['milestones'][0]>) => {
    await delay();
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m),
      };
    }));
  }, []);

  const addLead = useCallback(async (l: Omit<Lead, 'id' | 'createdAt' | 'lastActivity'>) => {
    await delay();
    const now = new Date().toISOString().split('T')[0];
    const newLead: Lead = { ...l, id: generateId('lead'), createdAt: now, lastActivity: now };
    setLeads(prev => [newLead, ...prev]);
    return newLead;
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    await delay();
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await delay();
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<OSUser>) => {
    await delay();
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const addEnquiry = useCallback(async (e: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => {
    await delay();
    const newEnquiry: Enquiry = {
      ...e,
      id: generateId('enq'),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setEnquiries(prev => [newEnquiry, ...prev]);
    return newEnquiry;
  }, []);

  const updateEnquiry = useCallback(async (id: string, updates: Partial<Enquiry>) => {
    await delay();
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addQuote = useCallback(async (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    await delay();
    const newQuote: Quote = {
      ...q,
      id: generateId('qte'),
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  }, []);

  const updateQuote = useCallback(async (id: string, updates: Partial<Quote>) => {
    await delay();
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuote = useCallback(async (id: string) => {
    await delay();
    setQuotes(prev => prev.filter(q => q.id !== id));
  }, []);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    await delay();
    const newTxn: Transaction = { ...t, id: generateId('txn') };
    setTransactions(prev => [newTxn, ...prev]);
    return newTxn;
  }, []);

  const resetToDefaults = useCallback(() => {
    setProjects(initialProjects);
    setLeads(initialLeads);
    setUsers(initialUsers);
    setNudges(initialNudges);
    setTransactions(initialTransactions);
    setQuotes([]);
    setEnquiries(initialEnquiries);
    ['projects', 'leads', 'users', 'nudges', 'transactions', 'quotes', 'enquiries'].forEach(k =>
      localStorage.removeItem(`zenn_os_${k}`)
    );
  }, []);

  return (
    <StoreContext.Provider value={{
      projects, leads, users, nudges, transactions, equipment, contracts, messages, quotes, enquiries, isLoading,
      addProject, updateProject, deleteProject, updateMilestone,
      addLead, updateLead, deleteLead,
      updateUser,
      addEnquiry, updateEnquiry,
      addQuote, updateQuote, deleteQuote,
      addTransaction,
      resetToDefaults,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}
