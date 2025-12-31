import { Suspense } from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StatsCard, StatsCardSkeleton, TableSkeleton } from '@/components/ui';
import { DashboardSummaryCards } from './components/DashboardSummaryCards';
import { RecentProposalsTable } from './components/RecentProposalsTable';

export const metadata = {
  title: 'Dashboard - ProposalGen',
  description: 'View your proposal statistics and recent activity',
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your proposal activity and performance"
      />

      {/* Summary Cards */}
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <DashboardSummaryCards />
      </Suspense>

      {/* Recent Proposals */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Proposals
        </h2>
        <Suspense fallback={<TableSkeleton rows={5} columns={5} />}>
          <RecentProposalsTable />
        </Suspense>
      </div>
    </div>
  );
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
