'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Edit, Download, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, StatusBadge, Card, CardHeader, CardContent } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Proposal, ProposalStatus, Currency, BillingType } from '@/types';
import { BILLING_TYPE_CONFIG } from '@/constants';
import { ProposalApprovalActions } from './components/ProposalApprovalActions';
import { use } from 'react';

interface ProposalDetailPageProps {
  params: Promise<{ id: string }>;
}

// Check if user can approve based on role
function canUserApproveProposal(productUser: { role_id: number } | null): boolean {
  if (!productUser) return false;
  // Role IDs that can approve: super-admin, admin, manager
  const approvalRoleIds = [1, 2, 3];
  return approvalRoleIds.includes(productUser.role_id);
}

export default function ProposalDetailPage({ params }: ProposalDetailPageProps) {
  const { id } = use(params);
  const { productUser } = useAuth();

  // Mock data for demonstration
  const proposal: Proposal = {
    id,
    organization_id: 'org-1',
    pdf_code: 'PRO-ABC12345',
    title: 'Website Redesign Project',
    client_name: 'Acme Corporation',
    client_email: 'contact@acme.com',
    industry: 'Technology',
    summary:
      'A comprehensive website redesign project aimed at modernizing the digital presence of Acme Corporation. This includes a complete overhaul of the user interface, improved user experience, and integration with modern web technologies.',
    goals:
      '1. Increase website traffic by 50% within 6 months\n2. Improve user engagement metrics\n3. Reduce bounce rate by 30%\n4. Implement responsive design for all devices\n5. Optimize for search engines',
    scope:
      'The project scope includes:\n- Complete UI/UX redesign of all pages\n- Development of new responsive templates\n- Content migration from existing website\n- SEO optimization\n- Performance optimization\n- Analytics integration\n\nOut of scope:\n- Content creation (client will provide)\n- Ongoing maintenance after launch',
    deliverables: [
      { id: '1', title: 'Design Mockups', description: 'High-fidelity designs for all pages', due_date: '2024-02-15' },
      { id: '2', title: 'Frontend Development', description: 'Responsive HTML/CSS/JS implementation', due_date: '2024-03-15' },
      { id: '3', title: 'Backend Integration', description: 'CMS integration and API development', due_date: '2024-04-01' },
      { id: '4', title: 'Testing & QA', description: 'Comprehensive testing across devices', due_date: '2024-04-15' },
      { id: '5', title: 'Launch', description: 'Production deployment and handover', due_date: '2024-04-30' },
    ],
    milestones: [
      { id: '1', title: 'Design Approval' },
      { id: '2', title: 'Development Phase 1' },
      { id: '3', title: 'Development Phase 2' },
      { id: '4', title: 'Final Delivery' },
    ],
    start_date: '2024-02-01',
    end_date: '2024-04-30',
    date_of_proposal: '2024-01-15',
    total_budget: 25000,
    currency: Currency.USD,
    billing_type: BillingType.MILESTONE,
    team_members: [
      { id: '1', role: 'Project Manager', experience: '10 years' },
      { id: '2', role: 'Lead Designer', experience: '8 years' },
      { id: '3', role: 'Senior Developer', experience: '7 years' },
      { id: '4', role: 'QA Engineer', experience: '5 years' },
    ],
    submitted_to: [
      { id: '1', salutation: 'Mr.', name: 'John Contact' },
      { id: '2', salutation: 'Dr.', name: 'Sarah CTO' },
    ],
    links: [
      { id: '1', label: 'Design Mockups', url: 'https://figma.com/file/example' },
      { id: '2', label: 'Project Brief', url: 'https://docs.google.com/document/example' },
    ],
    audio_path: [],
    document_path: [],
    status: ProposalStatus.APPROVAL_PENDING,
    created_by: 'user-1',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  };

  if (!proposal) {
    notFound();
  }

  const canApprove = canUserApproveProposal(productUser);
  const showApprovalActions = canApprove && proposal.status === ProposalStatus.APPROVAL_PENDING;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/proposals"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Proposals
        </Link>
      </div>

      <PageHeader
        title={proposal.title}
        description={`${proposal.pdf_code} • Created ${formatDate(proposal.created_at)}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={proposal.status} size="lg" />
            {proposal.status !== ProposalStatus.COMPLETED && (
              <Link href={`/proposals/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Approval Actions */}
      {showApprovalActions && (
        <div className="mb-6">
          <ProposalApprovalActions proposalId={proposal.id} />
        </div>
      )}

      {/* Client Information */}
      <Card className="mb-6">
        <CardHeader title="Client Information" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Client Name</p>
              <p className="mt-1 text-slate-900">{proposal.client_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="mt-1 text-slate-900">{proposal.client_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Industry</p>
              <p className="mt-1 text-slate-900">{proposal.industry || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card className="mb-6">
        <CardHeader title="Project Details" />
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Summary</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{proposal.summary}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Goals</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{proposal.goals}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Scope</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{proposal.scope}</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card className="mb-6">
        <CardHeader title="Timeline & Budget" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Start Date</p>
              <p className="mt-1 text-slate-900">{formatDate(proposal.start_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">End Date</p>
              <p className="mt-1 text-slate-900">{formatDate(proposal.end_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Budget</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(proposal.total_budget, proposal.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Billing Type</p>
              <p className="mt-1 text-slate-900">
                {BILLING_TYPE_CONFIG[proposal.billing_type].label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      {proposal.deliverables.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Deliverables" />
          <CardContent>
            <div className="divide-y divide-slate-200">
              {proposal.deliverables.map((deliverable, index) => (
                <div key={deliverable.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{deliverable.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{deliverable.description}</p>
                  </div>
                  {deliverable.due_date && (
                    <p className="text-sm text-slate-500">Due: {formatDate(deliverable.due_date)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {proposal.milestones.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Milestones" />
          <CardContent>
            <div className="divide-y divide-slate-200">
              {proposal.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{milestone.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      {proposal.team_members.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Team Members" />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {proposal.team_members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium">
                    {member.role.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{member.role}</p>
                    <p className="text-sm text-slate-500">{member.experience}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {proposal.links.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Reference Links" />
          <CardContent>
            <div className="space-y-2">
              {proposal.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <p className="font-medium text-primary-600">{link.label}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{link.url}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted To */}
      {proposal.submitted_to.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Submitted To" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {proposal.submitted_to.map((recipient) => (
                <span
                  key={recipient.id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {recipient.salutation} {recipient.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {proposal.status === ProposalStatus.REJECTED && proposal.rejection_reason && (
        <Card className="mb-6 border-danger-200 bg-danger-50">
          <CardHeader title="Rejection Reason" />
          <CardContent>
            <p className="text-danger-700">{proposal.rejection_reason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
