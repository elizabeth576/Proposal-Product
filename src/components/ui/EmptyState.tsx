import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, Search, AlertCircle, FolderOpen } from 'lucide-react';
import { Button } from './Button';

// ============================================================================
// Types
// ============================================================================

type EmptyStateVariant = 'default' | 'search' | 'error' | 'empty';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// ============================================================================
// Default Icons
// ============================================================================

const defaultIcons: Record<EmptyStateVariant, React.ReactNode> = {
  default: <FolderOpen className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  error: <AlertCircle className="h-12 w-12" />,
  empty: <FileText className="h-12 w-12" />,
};

// ============================================================================
// Component
// ============================================================================

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="mb-4 text-slate-300">
        {icon || defaultIcons[variant]}
      </div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Preset Empty States
// ============================================================================

interface PresetEmptyStateProps {
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function NoProposalsState({ action, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      variant="empty"
      title="No proposals yet"
      description="Get started by creating your first proposal."
      action={action}
      className={className}
    />
  );
}

export function NoSearchResultsState({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try adjusting your search or filter criteria."
      className={className}
    />
  );
}

export function ErrorState({
  action,
  className,
}: PresetEmptyStateProps & { message?: string }) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description="We couldn't load this content. Please try again."
      action={action}
      className={className}
    />
  );
}
