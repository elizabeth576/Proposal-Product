// ============================================================================
// Core Enums
// ============================================================================

export enum ProposalStatus {
  PENDING = 'pending',
  APPROVAL_PENDING = 'approval_pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  INR = 'INR',
  JPY = 'JPY',
}

export enum BillingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  MILESTONE = 'milestone',
  RETAINER = 'retainer',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// ============================================================================
// User & Organization Types
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  settings: OrganizationSettings;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  default_currency: Currency;
  proposal_prefix?: string;
  require_approval: boolean;
  auto_approve_under_amount?: number;
}

export interface ProductRole {
  id: string;
  name: string;
  slug: UserRole;
  permissions: Permission[];
  description?: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  organization_id: string;
  role_id: string;
  role: ProductRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokenPayload {
  sub: string; // user_id
  email: string;
  organization_id: string;
  role_id: string;
  role_slug: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

// ============================================================================
// Proposal Types
// ============================================================================

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  due_date?: string;
}

export interface Milestone {
  id: string;
  title: string;
}

export interface TeamMember {
  id: string;
  user_id?: string;
  role: string;
  experience: string;
}

export interface ProposalLink {
  id: string;
  label: string;
  url: string;
}

export interface Recipient {
  id: string;
  salutation: string;
  name: string;
}

export interface Proposal {
  id: string;
  organization_id: string;
  pdf_code: string;
  title: string;
  client_name: string;
  client_email: string;
  industry?: string;
  summary: string;
  goals: string;
  scope: string;
  deliverables: Deliverable[];
  milestones: Milestone[];
  start_date: string;
  end_date: string;
  date_of_proposal: string;
  total_budget: number;
  currency: Currency;
  billing_type: BillingType;
  team_members: TeamMember[];
  submitted_to: Recipient[];
  links: ProposalLink[];
  audio_path: string[];
  document_path: string[];
  status: ProposalStatus;
  created_by: string;
  created_by_user?: User;
  approved_by?: string;
  approved_by_user?: User;
  generated_pdf_path?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalCreateInput {
  title: string;
  client_name: string;
  client_email: string;
  industry?: string;
  summary: string;
  goals: string;
  scope: string;
  deliverables: Omit<Deliverable, 'id'>[];
  milestones: Omit<Milestone, 'id'>[];
  start_date: string;
  end_date: string;
  date_of_proposal: string;
  total_budget: number;
  currency: Currency;
  billing_type: BillingType;
  team_members: Omit<TeamMember, 'id'>[];
  submitted_to: Omit<Recipient, 'id'>[];
  links: Omit<ProposalLink, 'id'>[];
  audio_path: string[];
  document_path: string[];
}

export interface ProposalUpdateInput extends Partial<ProposalCreateInput> {
  id: string;
}

// ============================================================================
// Template Types
// ============================================================================

export interface Template {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  content: Partial<ProposalCreateInput>;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Subscription & Billing Types
// ============================================================================

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  proposal_limit: number;
  proposals_used: number;
  user_limit: number;
  users_count: number;
  features: SubscriptionFeatures;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeatures {
  pdf_generation: boolean;
  custom_branding: boolean;
  api_access: boolean;
  priority_support: boolean;
  audit_logs: boolean;
  multi_level_approval: boolean;
}

export interface SubscriptionEvent {
  id: string;
  subscription_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  amount: number;
  currency: Currency;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  invoice_url?: string;
  pdf_url?: string;
  created_at: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProposalFilters extends PaginationParams {
  status?: ProposalStatus;
  client_name?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardSummary {
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  total_count: number;
  total_value: number;
  currency: Currency;
  month_over_month_change: number;
}

// ============================================================================
// Audit Log Types (Future Extension)
// ============================================================================

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  user?: User;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
