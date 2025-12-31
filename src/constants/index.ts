import {
  ProposalStatus,
  Currency,
  BillingType,
  UserRole,
  SubscriptionPlan,
} from '@/types';

// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',

  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',

  // Proposals
  PROPOSALS: '/proposals',
  PROPOSAL_BY_ID: (id: string) => `/proposals/${id}`,
  PROPOSAL_APPROVE: (id: string) => `/proposals/${id}/approve`,
  PROPOSAL_REJECT: (id: string) => `/proposals/${id}/reject`,

  // Templates
  TEMPLATES: '/templates',
  TEMPLATE_BY_ID: (id: string) => `/templates/${id}`,

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Organizations
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_BY_ID: (id: string) => `/organizations/${id}`,

  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_BY_ID: (id: string) => `/subscriptions/${id}`,
  SUBSCRIPTION_INVOICES: (id: string) => `/subscriptions/${id}/invoices`,
} as const;

// ============================================================================
// Status Labels & Colors
// ============================================================================

export const PROPOSAL_STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  [ProposalStatus.PENDING]: {
    label: 'Pending',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
  },
  [ProposalStatus.APPROVAL_PENDING]: {
    label: 'Awaiting Approval',
    color: 'text-warning-700',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
  },
  [ProposalStatus.COMPLETED]: {
    label: 'Approved',
    color: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
  },
  [ProposalStatus.REJECTED]: {
    label: 'Rejected',
    color: 'text-danger-700',
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-200',
  },
};

export const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string }> = {
  [Currency.USD]: { symbol: '$', name: 'US Dollar' },
  [Currency.EUR]: { symbol: '€', name: 'Euro' },
  [Currency.GBP]: { symbol: '£', name: 'British Pound' },
  [Currency.CAD]: { symbol: 'C$', name: 'Canadian Dollar' },
  [Currency.AUD]: { symbol: 'A$', name: 'Australian Dollar' },
  [Currency.INR]: { symbol: '₹', name: 'Indian Rupee' },
  [Currency.JPY]: { symbol: '¥', name: 'Japanese Yen' },
};

export const BILLING_TYPE_CONFIG: Record<BillingType, { label: string; description: string }> = {
  [BillingType.FIXED]: {
    label: 'Fixed Price',
    description: 'One-time payment for the entire project',
  },
  [BillingType.HOURLY]: {
    label: 'Hourly Rate',
    description: 'Billed based on hours worked',
  },
  [BillingType.MILESTONE]: {
    label: 'Milestone-Based',
    description: 'Payment tied to project milestones',
  },
  [BillingType.RETAINER]: {
    label: 'Retainer',
    description: 'Recurring monthly payment',
  },
};

// ============================================================================
// Role Permissions
// ============================================================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MANAGER]: 60,
  [UserRole.MEMBER]: 40,
  [UserRole.VIEWER]: 20,
};

export const APPROVAL_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
];

export const ROLE_CONFIG: Record<UserRole, { label: string; description: string; canApprove: boolean }> = {
  [UserRole.SUPER_ADMIN]: {
    label: 'Super Admin',
    description: 'Full system access across all organizations',
    canApprove: true,
  },
  [UserRole.ADMIN]: {
    label: 'Admin',
    description: 'Full access within the organization',
    canApprove: true,
  },
  [UserRole.MANAGER]: {
    label: 'Manager',
    description: 'Can manage proposals and approve/reject',
    canApprove: true,
  },
  [UserRole.MEMBER]: {
    label: 'Member',
    description: 'Can create and edit proposals',
    canApprove: false,
  },
  [UserRole.VIEWER]: {
    label: 'Viewer',
    description: 'Read-only access to proposals',
    canApprove: false,
  },
};

// ============================================================================
// Subscription Plans
// ============================================================================

export const SUBSCRIPTION_PLAN_CONFIG: Record<
  SubscriptionPlan,
  {
    label: string;
    price: number;
    proposalLimit: number;
    userLimit: number;
    features: string[];
  }
> = {
  [SubscriptionPlan.FREE]: {
    label: 'Free',
    price: 0,
    proposalLimit: 5,
    userLimit: 1,
    features: ['5 proposals/month', 'Basic templates', 'Email support'],
  },
  [SubscriptionPlan.STARTER]: {
    label: 'Starter',
    price: 29,
    proposalLimit: 50,
    userLimit: 5,
    features: ['50 proposals/month', '5 team members', 'Custom templates', 'PDF export'],
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    label: 'Professional',
    price: 99,
    proposalLimit: 200,
    userLimit: 20,
    features: [
      '200 proposals/month',
      '20 team members',
      'Custom branding',
      'API access',
      'Priority support',
    ],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    label: 'Enterprise',
    price: 299,
    proposalLimit: -1, // Unlimited
    userLimit: -1, // Unlimited
    features: [
      'Unlimited proposals',
      'Unlimited team members',
      'Multi-level approvals',
      'Audit logs',
      'SSO',
      'Dedicated support',
    ],
  },
};

// ============================================================================
// Industry Options
// ============================================================================

export const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Legal',
  'Non-Profit',
  'Government',
  'Entertainment',
  'Transportation',
  'Energy',
  'Other',
] as const;

// ============================================================================
// Pagination Defaults
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// Date Formats
// ============================================================================

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_DISPLAY_FORMAT = 'MMM d, yyyy';
export const DATETIME_DISPLAY_FORMAT = 'MMM d, yyyy h:mm a';

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  SUMMARY_MIN_LENGTH: 10,
  SUMMARY_MAX_LENGTH: 2000,
  GOALS_MIN_LENGTH: 10,
  GOALS_MAX_LENGTH: 5000,
  SCOPE_MIN_LENGTH: 10,
  SCOPE_MAX_LENGTH: 5000,
  MIN_BUDGET: 0,
  MAX_BUDGET: 999999999,
  MAX_DELIVERABLES: 50,
  MAX_MILESTONES: 20,
  MAX_TEAM_MEMBERS: 50,
  MAX_LINKS: 20,
  MAX_AUDIO_FILES: 10,
  MAX_DOCUMENTS: 10,
} as const;

// ============================================================================
// Status Transitions
// ============================================================================

export const VALID_STATUS_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  [ProposalStatus.PENDING]: [ProposalStatus.APPROVAL_PENDING],
  [ProposalStatus.APPROVAL_PENDING]: [ProposalStatus.COMPLETED, ProposalStatus.REJECTED],
  [ProposalStatus.COMPLETED]: [], // Terminal state
  [ProposalStatus.REJECTED]: [ProposalStatus.APPROVAL_PENDING], // Can be resubmitted
};
