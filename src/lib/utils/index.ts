import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { Currency, ProposalStatus, UserRole } from '@/types';
import {
  CURRENCY_CONFIG,
  DATE_DISPLAY_FORMAT,
  DATETIME_DISPLAY_FORMAT,
  APPROVAL_ROLES,
  VALID_STATUS_TRANSITIONS,
} from '@/constants';

// ============================================================================
// Class Name Utilities
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Formatting Utilities
// ============================================================================

export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  return `${config.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, DATE_DISPLAY_FORMAT);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, DATETIME_DISPLAY_FORMAT);
  } catch {
    return dateString;
  }
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// ============================================================================
// String Utilities
// ============================================================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generatePdfCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PRO-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// Role & Permission Utilities
// ============================================================================

export function canApproveProposals(role: UserRole): boolean {
  return APPROVAL_ROLES.includes(role);
}

export function hasPermission(
  userPermissions: { resource: string; actions: string[] }[],
  resource: string,
  action: string
): boolean {
  const resourcePermission = userPermissions.find((p) => p.resource === resource);
  return resourcePermission?.actions.includes(action) ?? false;
}

// ============================================================================
// Status Utilities
// ============================================================================

export function isValidStatusTransition(
  currentStatus: ProposalStatus,
  newStatus: ProposalStatus
): boolean {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  return validTransitions.includes(newStatus);
}

export function getStatusVariant(status: ProposalStatus): 'default' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case ProposalStatus.PENDING:
      return 'default';
    case ProposalStatus.APPROVAL_PENDING:
      return 'warning';
    case ProposalStatus.COMPLETED:
      return 'success';
    case ProposalStatus.REJECTED:
      return 'danger';
    default:
      return 'default';
  }
}

// ============================================================================
// Object Utilities
// ============================================================================

export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

// ============================================================================
// ID Generation
// ============================================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// URL Utilities
// ============================================================================

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// Error Utilities
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}
