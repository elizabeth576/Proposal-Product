import { z } from 'zod';
import { Currency, BillingType } from '@/types';
import { VALIDATION } from '@/constants';

// ============================================================================
// Shared Schemas
// ============================================================================

export const deliverableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  due_date: z.string().optional(),
});

export const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
});

export const teamMemberSchema = z.object({
  user_id: z.string().optional(),
  role: z.string().min(1, 'Role is required').max(100, 'Role is too long'),
  experience: z.string().min(1, 'Experience is required').max(200, 'Experience is too long'),
});

export const linkSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label is too long'),
  url: z.string().url('Invalid URL'),
});

export const recipientSchema = z.object({
  salutation: z.string().min(1, 'Salutation is required').max(10, 'Salutation is too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

// ============================================================================
// Proposal Create Schema
// ============================================================================

// Base object schema (without refinements) - used for .partial() operations
const proposalBaseSchema = z.object({
  title: z
    .string()
    .min(VALIDATION.TITLE_MIN_LENGTH, `Title must be at least ${VALIDATION.TITLE_MIN_LENGTH} characters`)
    .max(VALIDATION.TITLE_MAX_LENGTH, `Title must be less than ${VALIDATION.TITLE_MAX_LENGTH} characters`),
  client_name: z
    .string()
    .min(1, 'Client name is required')
    .max(200, 'Client name is too long'),
  client_email: z
    .string()
    .email('Invalid email address'),
  industry: z
    .string()
    .optional(),
  summary: z
    .string()
    .min(VALIDATION.SUMMARY_MIN_LENGTH, `Summary must be at least ${VALIDATION.SUMMARY_MIN_LENGTH} characters`)
    .max(VALIDATION.SUMMARY_MAX_LENGTH, `Summary must be less than ${VALIDATION.SUMMARY_MAX_LENGTH} characters`),
  goals: z
    .string()
    .min(VALIDATION.GOALS_MIN_LENGTH, `Goals must be at least ${VALIDATION.GOALS_MIN_LENGTH} characters`)
    .max(VALIDATION.GOALS_MAX_LENGTH, `Goals must be less than ${VALIDATION.GOALS_MAX_LENGTH} characters`),
  scope: z
    .string()
    .min(VALIDATION.SCOPE_MIN_LENGTH, `Scope must be at least ${VALIDATION.SCOPE_MIN_LENGTH} characters`)
    .max(VALIDATION.SCOPE_MAX_LENGTH, `Scope must be less than ${VALIDATION.SCOPE_MAX_LENGTH} characters`),
  deliverables: z
    .array(deliverableSchema)
    .min(1, 'At least one deliverable is required')
    .max(VALIDATION.MAX_DELIVERABLES, `Maximum ${VALIDATION.MAX_DELIVERABLES} deliverables allowed`),
  milestones: z
    .array(milestoneSchema)
    .max(VALIDATION.MAX_MILESTONES, `Maximum ${VALIDATION.MAX_MILESTONES} milestones allowed`),
  start_date: z
    .string()
    .min(1, 'Start date is required'),
  end_date: z
    .string()
    .min(1, 'End date is required'),
  date_of_proposal: z
    .string()
    .min(1, 'Proposal date is required'),
  total_budget: z
    .number()
    .min(VALIDATION.MIN_BUDGET, 'Budget must be positive')
    .max(VALIDATION.MAX_BUDGET, 'Budget exceeds maximum allowed'),
  currency: z
    .nativeEnum(Currency, { errorMap: () => ({ message: 'Invalid currency' }) }),
  billing_type: z
    .nativeEnum(BillingType, { errorMap: () => ({ message: 'Invalid billing type' }) }),
  team_members: z
    .array(teamMemberSchema)
    .max(VALIDATION.MAX_TEAM_MEMBERS, `Maximum ${VALIDATION.MAX_TEAM_MEMBERS} team members allowed`),
  submitted_to: z
    .array(recipientSchema)
    .default([]),
  links: z
    .array(linkSchema)
    .max(VALIDATION.MAX_LINKS, `Maximum ${VALIDATION.MAX_LINKS} links allowed`),
  audio_path: z
    .array(z.string())
    .max(VALIDATION.MAX_AUDIO_FILES, `Maximum ${VALIDATION.MAX_AUDIO_FILES} audio files allowed`),
  document_path: z
    .array(z.string())
    .max(VALIDATION.MAX_DOCUMENTS, `Maximum ${VALIDATION.MAX_DOCUMENTS} documents allowed`),
});

// Full create schema with date validation refinement
export const proposalCreateSchema = proposalBaseSchema.refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// ============================================================================
// Proposal Update Schema
// ============================================================================

export const proposalUpdateSchema = proposalBaseSchema.partial().extend({
  id: z.string().min(1, 'Proposal ID is required'),
});

// ============================================================================
// Approval Schemas
// ============================================================================

export const proposalApproveSchema = z.object({
  comments: z.string().max(1000, 'Comments are too long').optional(),
});

export const proposalRejectSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a reason for rejection (at least 10 characters)')
    .max(1000, 'Reason is too long'),
});

// ============================================================================
// Filter Schema
// ============================================================================

export const proposalFiltersSchema = z.object({
  status: z.nativeEnum(ProposalStatus).optional(),
  client_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Need to import this for the filter schema
import { ProposalStatus } from '@/types';

// ============================================================================
// Type Exports
// ============================================================================

export type ProposalCreateInput = z.infer<typeof proposalCreateSchema>;
export type ProposalUpdateInput = z.infer<typeof proposalUpdateSchema>;
export type ProposalApproveInput = z.infer<typeof proposalApproveSchema>;
export type ProposalRejectInput = z.infer<typeof proposalRejectSchema>;
export type ProposalFiltersInput = z.infer<typeof proposalFiltersSchema>;
