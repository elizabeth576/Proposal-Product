'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Textarea, Modal, ModalFooter } from '@/components/ui';
import { proposalsApi, ApiRequestError } from '@/lib/api';
import { proposalRejectSchema } from '@/lib/validations';

// ============================================================================
// Types
// ============================================================================

interface ProposalApprovalActionsProps {
  proposalId: string;
}

// ============================================================================
// Component
// ============================================================================

export function ProposalApprovalActions({ proposalId }: ProposalApprovalActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setError(null);
    setIsApproving(true);

    try {
      await proposalsApi.approve(proposalId, {
        comments: 'Approved',
      });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Failed to approve proposal. Please try again.');
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setRejectError(null);

    // Validate rejection reason
    const result = proposalRejectSchema.safeParse({ reason: rejectReason });
    if (!result.success) {
      setRejectError(result.error.errors[0].message);
      return;
    }

    setIsRejecting(true);

    try {
      await proposalsApi.reject(proposalId, {
        reason: rejectReason,
      });
      setShowRejectModal(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setRejectError(err.message);
      } else {
        setRejectError('Failed to reject proposal. Please try again.');
      }
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <Card className="border-warning-200 bg-warning-50">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-warning-800">
              Approval Required
            </h3>
            <p className="mt-1 text-sm text-warning-700">
              This proposal is awaiting your approval. Please review the details and take action.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(true)}
              disabled={isApproving || isRejecting}
              className="border-danger-300 text-danger-700 hover:bg-danger-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              isLoading={isApproving}
              disabled={isRejecting}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
        {error && (
          <div className="border-t border-warning-200 bg-danger-50 px-6 py-3">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Proposal"
        description="Please provide a reason for rejecting this proposal."
        size="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            error={rejectError || undefined}
            placeholder="Enter the reason for rejection..."
            rows={4}
            required
          />
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowRejectModal(false)}
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            isLoading={isRejecting}
          >
            Reject Proposal
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
