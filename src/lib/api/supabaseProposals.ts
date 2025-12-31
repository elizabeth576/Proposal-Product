import { supabase } from './supabaseClient';
import { ProposalCreateInput, Proposal } from '@/types';
import { generateId } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface ProposalInsertData extends ProposalCreateInput {
  organization_id: string;
  created_by: string;
}

export interface InsertProposalResult {
  data: Proposal | null;
  error: string | null;
}

// ============================================================================
// Supabase Proposals Functions
// ============================================================================

/**
 * Insert a new proposal directly into Supabase proposals table
 */
export async function insertProposal(
  proposalData: ProposalInsertData
): Promise<InsertProposalResult> {
  const id = generateId();
  const now = new Date().toISOString();

  const insertData = {
    id,
    ...proposalData,
    pdf_code: `PROP-${Date.now()}`,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('proposals')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Update a proposal in Supabase
 */
export async function updateProposal(
  id: string,
  updateData: Partial<ProposalCreateInput>
): Promise<InsertProposalResult> {
  const { data, error } = await supabase
    .from('proposals')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get a proposal by ID from Supabase
 */
export async function getProposalById(
  id: string
): Promise<InsertProposalResult> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
