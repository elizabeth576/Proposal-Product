import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, TableSkeleton } from '@/components/ui';
import { ProposalFilters } from './components/ProposalFilters';
import { ProposalsTable } from './components/ProposalsTable';
import { ProposalStatus } from '@/types';

export const metadata = {
  title: 'Proposals - ProposalGen',
  description: 'View and manage all your proposals',
};

interface ProposalsPageProps {
  searchParams: {
    status?: string;
    client?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: string;
  };
}

export default function ProposalsPage({ searchParams }: ProposalsPageProps) {
  const filters = {
    status: searchParams.status as ProposalStatus | undefined,
    client_name: searchParams.client,
    start_date: searchParams.start_date,
    end_date: searchParams.end_date,
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
  };

  return (
    <div>
      <PageHeader
        title="Proposals"
        description="Manage and track all your proposals"
        actions={
          <Link href="/proposals/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Proposal
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <ProposalFilters currentFilters={filters} />

      {/* Table */}
      <div className="mt-6">
        <Suspense
          key={JSON.stringify(filters)}
          fallback={<TableSkeleton rows={10} columns={6} />}
        >
          <ProposalsTable filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
