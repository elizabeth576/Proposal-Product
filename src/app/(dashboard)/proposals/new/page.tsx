import { PageHeader } from '@/components/layout';
import { ProposalForm } from '@/components/forms/ProposalForm';

export const metadata = {
  title: 'Create Proposal - ProposalGen',
  description: 'Create a new professional proposal',
};

export default function NewProposalPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Create New Proposal"
        description="Fill in the details below to create a professional proposal"
        breadcrumbs={[
          { label: 'Proposals', href: '/proposals' },
          { label: 'New Proposal' },
        ]}
      />
      <ProposalForm />
    </div>
  );
}
