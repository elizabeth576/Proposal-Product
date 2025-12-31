'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import { ProposalStatus } from '@/types';
import { PROPOSAL_STATUS_CONFIG } from '@/constants';

// ============================================================================
// Types
// ============================================================================

interface ProposalFiltersProps {
  currentFilters: {
    status?: ProposalStatus;
    client_name?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
  };
}

// ============================================================================
// Component
// ============================================================================

export function ProposalFilters({ currentFilters }: ProposalFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/proposals?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/proposals');
  };

  const hasActiveFilters = Boolean(
    currentFilters.status ||
      currentFilters.client_name ||
      currentFilters.start_date ||
      currentFilters.end_date ||
      currentFilters.search
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(PROPOSAL_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="w-full sm:w-64">
          <Input
            type="search"
            placeholder="Search proposals..."
            leftIcon={<Search className="h-4 w-4" />}
            defaultValue={currentFilters.search}
            onChange={(e) => {
              const value = e.target.value;
              // Debounce search
              const timeout = setTimeout(() => {
                updateFilters({ search: value || undefined });
              }, 300);
              return () => clearTimeout(timeout);
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select
            label="Status"
            value={currentFilters.status || ''}
            onChange={(e) =>
              updateFilters({ status: e.target.value || undefined })
            }
            options={statusOptions}
          />
        </div>

        {/* Date Range */}
        <div className="w-full sm:w-40">
          <Input
            type="date"
            label="From Date"
            value={currentFilters.start_date || ''}
            onChange={(e) =>
              updateFilters({ start_date: e.target.value || undefined })
            }
          />
        </div>

        <div className="w-full sm:w-40">
          <Input
            type="date"
            label="To Date"
            value={currentFilters.end_date || ''}
            onChange={(e) =>
              updateFilters({ end_date: e.target.value || undefined })
            }
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {currentFilters.status && (
            <FilterTag
              label={`Status: ${PROPOSAL_STATUS_CONFIG[currentFilters.status].label}`}
              onRemove={() => updateFilters({ status: undefined })}
            />
          )}
          {currentFilters.client_name && (
            <FilterTag
              label={`Client: ${currentFilters.client_name}`}
              onRemove={() => updateFilters({ client: undefined })}
            />
          )}
          {currentFilters.start_date && (
            <FilterTag
              label={`From: ${currentFilters.start_date}`}
              onRemove={() => updateFilters({ start_date: undefined })}
            />
          )}
          {currentFilters.end_date && (
            <FilterTag
              label={`To: ${currentFilters.end_date}`}
              onRemove={() => updateFilters({ end_date: undefined })}
            />
          )}
          {currentFilters.search && (
            <FilterTag
              label={`Search: "${currentFilters.search}"`}
              onRemove={() => updateFilters({ search: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Filter Tag Component
// ============================================================================

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-primary-100"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
