import Link from 'next/link';
import { Eye, Edit } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  StatusBadge,
  Button,
  PaginationInfo,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Proposal, ProposalStatus, Currency, BillingType, ProposalFilters } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { ProposalsTablePagination } from './ProposalsTablePagination';

// ============================================================================
// Types
// ============================================================================

interface ProposalsTableProps {
  filters: ProposalFilters;
}

// ============================================================================
// Component
// ============================================================================

export function ProposalsTable({ filters }: ProposalsTableProps) {
  // Mock data for demonstration
  const proposals: Proposal[] = [
    {
      id: '1',
      organization_id: 'org-1',
      pdf_code: 'PRO-ABC12345',
      title: 'Website Redesign Project',
      client_name: 'Acme Corp',
      client_email: 'contact@acme.com',
      industry: 'Technology',
      summary: 'Complete website redesign with modern UI/UX',
      goals: 'Improve user engagement and conversion rates',
      scope: 'Full website redesign including all pages',
      deliverables: [],
      milestones: [],
      start_date: '2024-02-01',
      end_date: '2024-04-30',
      date_of_proposal: '2024-01-15',
      total_budget: 25000,
      currency: Currency.USD,
      billing_type: BillingType.MILESTONE,
      team_members: [],
      submitted_to: [],
      links: [],
      audio_path: [],
      document_path: [],
      status: ProposalStatus.APPROVAL_PENDING,
      created_by: 'user-1',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      organization_id: 'org-1',
      pdf_code: 'PRO-DEF67890',
      title: 'Mobile App Development',
      client_name: 'TechStart Inc',
      client_email: 'hello@techstart.io',
      industry: 'Technology',
      summary: 'Native mobile app for iOS and Android',
      goals: 'Launch MVP within 3 months',
      scope: 'Full mobile app development',
      deliverables: [],
      milestones: [],
      start_date: '2024-03-01',
      end_date: '2024-06-30',
      date_of_proposal: '2024-01-20',
      total_budget: 75000,
      currency: Currency.USD,
      billing_type: BillingType.MILESTONE,
      team_members: [],
      submitted_to: [],
      links: [],
      audio_path: [],
      document_path: [],
      status: ProposalStatus.COMPLETED,
      created_by: 'user-1',
      approved_by: 'user-2',
      created_at: '2024-01-20T14:00:00Z',
      updated_at: '2024-01-22T09:15:00Z',
    },
    {
      id: '3',
      organization_id: 'org-1',
      pdf_code: 'PRO-GHI11111',
      title: 'Marketing Campaign Strategy',
      client_name: 'Global Brands Ltd',
      client_email: 'marketing@globalbrands.com',
      industry: 'Marketing',
      summary: 'Q2 digital marketing campaign',
      goals: 'Increase brand awareness by 40%',
      scope: 'Strategy, content, and execution',
      deliverables: [],
      milestones: [],
      start_date: '2024-04-01',
      end_date: '2024-06-30',
      date_of_proposal: '2024-01-25',
      total_budget: 50000,
      currency: Currency.USD,
      billing_type: BillingType.RETAINER,
      team_members: [],
      submitted_to: [],
      links: [],
      audio_path: [],
      document_path: [],
      status: ProposalStatus.REJECTED,
      created_by: 'user-1',
      approved_by: 'user-2',
      rejection_reason: 'Budget constraints',
      created_at: '2024-01-25T11:45:00Z',
      updated_at: '2024-01-26T16:30:00Z',
    },
    {
      id: '4',
      organization_id: 'org-1',
      pdf_code: 'PRO-JKL22222',
      title: 'E-commerce Platform',
      client_name: 'RetailMax',
      client_email: 'projects@retailmax.com',
      industry: 'Retail',
      summary: 'Custom e-commerce solution',
      goals: 'Launch online store with 1000+ products',
      scope: 'Full e-commerce development',
      deliverables: [],
      milestones: [],
      start_date: '2024-05-01',
      end_date: '2024-10-31',
      date_of_proposal: '2024-01-28',
      total_budget: 120000,
      currency: Currency.USD,
      billing_type: BillingType.MILESTONE,
      team_members: [],
      submitted_to: [],
      links: [],
      audio_path: [],
      document_path: [],
      status: ProposalStatus.PENDING,
      created_by: 'user-1',
      created_at: '2024-01-28T09:00:00Z',
      updated_at: '2024-01-28T09:00:00Z',
    },
    {
      id: '5',
      organization_id: 'org-1',
      pdf_code: 'PRO-MNO33333',
      title: 'Cloud Migration Services',
      client_name: 'Enterprise Solutions Co',
      client_email: 'it@enterprise.co',
      industry: 'Technology',
      summary: 'AWS cloud migration for legacy systems',
      goals: 'Migrate 50 applications to cloud',
      scope: 'Assessment, planning, and migration',
      deliverables: [],
      milestones: [],
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      date_of_proposal: '2024-01-30',
      total_budget: 200000,
      currency: Currency.USD,
      billing_type: BillingType.FIXED,
      team_members: [],
      submitted_to: [],
      links: [],
      audio_path: [],
      document_path: [],
      status: ProposalStatus.APPROVAL_PENDING,
      created_by: 'user-1',
      created_at: '2024-01-30T13:20:00Z',
      updated_at: '2024-01-30T13:20:00Z',
    },
  ];

  const meta = {
    page: filters.page || 1,
    limit: filters.limit || DEFAULT_PAGE_SIZE,
    total: 25,
    total_pages: 3,
  };

  // Apply client-side filtering for mock data
  let filteredProposals = proposals;
  if (filters.status) {
    filteredProposals = filteredProposals.filter(
      (p) => p.status === filters.status
    );
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredProposals = filteredProposals.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.client_name.toLowerCase().includes(search)
    );
  }

  if (filteredProposals.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableEmptyState
            title="No proposals found"
            description="Try adjusting your filters or create a new proposal."
            action={
              <Link href="/proposals/new">
                <Button>Create Proposal</Button>
              </Link>
            }
          />
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProposals.map((proposal) => (
            <TableRow key={proposal.id} isClickable>
              <TableCell>
                <Link
                  href={`/proposals/${proposal.id}`}
                  className="block hover:text-primary-600"
                >
                  <p className="font-medium text-slate-900">{proposal.title}</p>
                  <p className="text-xs text-slate-500">{proposal.pdf_code}</p>
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-slate-900">{proposal.client_name}</p>
                  <p className="text-xs text-slate-500">{proposal.client_email}</p>
                </div>
              </TableCell>
              <TableCell className="text-slate-500">
                {proposal.industry || '-'}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(proposal.total_budget, proposal.currency)}
              </TableCell>
              <TableCell>
                <StatusBadge status={proposal.status} />
              </TableCell>
              <TableCell className="text-slate-500">
                {formatDate(proposal.date_of_proposal)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/proposals/${proposal.id}`}>
                    <Button variant="ghost" size="sm" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/proposals/${proposal.id}/edit`}>
                    <Button variant="ghost" size="sm" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <PaginationInfo
          currentPage={meta.page}
          pageSize={meta.limit}
          totalItems={meta.total}
        />
        <ProposalsTablePagination
          currentPage={meta.page}
          totalPages={meta.total_pages}
        />
      </div>
    </div>
  );
}
