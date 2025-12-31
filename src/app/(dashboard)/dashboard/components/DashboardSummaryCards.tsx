import { CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Currency } from '@/types';

export function DashboardSummaryCards() {
  // Mock data for demonstration
  const summary = {
    approved_count: 24,
    pending_count: 8,
    rejected_count: 3,
    total_count: 35,
    total_value: 245000,
    currency: Currency.USD,
    month_over_month_change: 12,
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Approved Proposals"
        value={summary.approved_count}
        icon={<CheckCircle className="h-6 w-6" />}
        trend={{ value: 15, isPositive: true }}
      />
      <StatsCard
        title="Pending Approval"
        value={summary.pending_count}
        icon={<Clock className="h-6 w-6" />}
      />
      <StatsCard
        title="Rejected"
        value={summary.rejected_count}
        icon={<XCircle className="h-6 w-6" />}
      />
      <StatsCard
        title="Total Value"
        value={formatCurrency(summary.total_value, summary.currency)}
        icon={<TrendingUp className="h-6 w-6" />}
        trend={{
          value: summary.month_over_month_change,
          isPositive: summary.month_over_month_change > 0,
        }}
      />
    </div>
  );
}
