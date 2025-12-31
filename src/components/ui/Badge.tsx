import React from 'react';
import { cn } from '@/lib/utils';
import { ProposalStatus } from '@/types';
import { PROPOSAL_STATUS_CONFIG } from '@/constants';

// ============================================================================
// Types
// ============================================================================

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

// ============================================================================
// Badge Component
// ============================================================================

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  status: ProposalStatus;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = PROPOSAL_STATUS_CONFIG[status];

  const variantMap: Record<ProposalStatus, BadgeVariant> = {
    [ProposalStatus.PENDING]: 'default',
    [ProposalStatus.APPROVAL_PENDING]: 'warning',
    [ProposalStatus.COMPLETED]: 'success',
    [ProposalStatus.REJECTED]: 'danger',
  };

  return (
    <Badge variant={variantMap[status]} size={size} className={className}>
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === ProposalStatus.PENDING && 'bg-slate-500',
          status === ProposalStatus.APPROVAL_PENDING && 'bg-warning-500',
          status === ProposalStatus.COMPLETED && 'bg-success-500',
          status === ProposalStatus.REJECTED && 'bg-danger-500'
        )}
      />
      {config.label}
    </Badge>
  );
}
