'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, Upload, FileText, Music, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui';
import { proposalsApi, ApiRequestError } from '@/lib/api';
import { insertProposal } from '@/lib/api/supabaseProposals';
import { proposalCreateSchema } from '@/lib/validations';
import { generateId } from '@/lib/utils';
import { supabase } from '@/lib/api/supabaseClient';
import {
  generateAllSignedUrls,
  STORAGE_BUCKETS,
} from '@/lib/storage';
import {
  Currency,
  BillingType,
  Deliverable,
  Milestone,
  TeamMember,
  ProposalLink,
  Recipient,
} from '@/types';
import {
  CURRENCY_CONFIG,
  BILLING_TYPE_CONFIG,
  INDUSTRY_OPTIONS,
} from '@/constants';

// ============================================================================
// File Upload Types & Constants
// ============================================================================

interface UploadedFile {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
}

const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const AUDIO_ACCEPT = '.mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4';

// ============================================================================
// Types
// ============================================================================

interface FormErrors {
  [key: string]: string | undefined;
}

interface DeliverableInput extends Omit<Deliverable, 'id'> {
  id: string;
}

interface MilestoneInput extends Omit<Milestone, 'id'> {
  id: string;
}

interface TeamMemberInput extends Omit<TeamMember, 'id'> {
  id: string;
}

interface LinkInput extends Omit<ProposalLink, 'id'> {
  id: string;
}

interface RecipientInput extends Omit<Recipient, 'id'> {
  id: string;
}

// ============================================================================
// Initial Values
// ============================================================================

const getInitialDeliverable = (): DeliverableInput => ({
  id: generateId(),
  title: '',
  description: '',
  due_date: '',
});

const getInitialMilestone = (): MilestoneInput => ({
  id: generateId(),
  title: '',
});

const getInitialTeamMember = (): TeamMemberInput => ({
  id: generateId(),
  role: '',
  experience: '',
});

const getInitialRecipient = (): RecipientInput => ({
  id: generateId(),
  salutation: '',
  name: '',
});

const getInitialLink = (): LinkInput => ({
  id: generateId(),
  label: '',
  url: '',
});

// ============================================================================
// Component
// ============================================================================

export function ProposalForm() {
  const router = useRouter();
  const { productUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // File upload refs and state
  const documentInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<UploadedFile[]>([]);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [summary, setSummary] = useState('');
  const [goals, setGoals] = useState('');
  const [scope, setScope] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateOfProposal, setDateOfProposal] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [billingType, setBillingType] = useState<BillingType>(BillingType.FIXED);
  const [recipients, setRecipients] = useState<RecipientInput[]>([]);

  // Array fields
  const [deliverables, setDeliverables] = useState<DeliverableInput[]>([
    getInitialDeliverable(),
  ]);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([]);
  const [links, setLinks] = useState<LinkInput[]>([]);

  // ============================================================================
  // File Upload Handlers
  // ============================================================================

  // Get storage path based on organization_id and user_id
  const getStoragePath = (fileName: string): string => {
    if (!productUser) {
      throw new Error('User not authenticated');
    }
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${generateId()}.${fileExt}`;
    return `${productUser.organization_id}/${productUser.user_id}/${uniqueFileName}`;
  };

  const uploadFileToSupabase = async (
    file: File,
    bucket: string
  ): Promise<{ path: string; url: string; error: string | null }> => {
    try {
      const filePath = getStoragePath(file.name);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        return { path: '', url: '', error: error.message };
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { path: filePath, url: urlData.publicUrl, error: null };
    } catch (err) {
      return { path: '', url: '', error: err instanceof Error ? err.message : 'Upload failed' };
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!productUser) {
      setUploadError('You must be logged in to upload files');
      return;
    }

    setIsUploadingDocuments(true);
    setUploadError(null);

    const newUploads: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      const { path, url, error } = await uploadFileToSupabase(
        file,
        STORAGE_BUCKETS.DOCUMENTS
      );

      if (error) {
        setUploadError(`Failed to upload ${file.name}: ${error}`);
        continue;
      }

      newUploads.push({
        id: generateId(),
        name: file.name,
        path,
        url,
        size: file.size,
      });
    }

    setUploadedDocuments((prev) => [...prev, ...newUploads]);
    setIsUploadingDocuments(false);

    // Reset input
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!productUser) {
      setUploadError('You must be logged in to upload files');
      return;
    }

    setIsUploadingAudio(true);
    setUploadError(null);

    const newUploads: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      const { path, url, error } = await uploadFileToSupabase(
        file,
        STORAGE_BUCKETS.AUDIO
      );

      if (error) {
        setUploadError(`Failed to upload ${file.name}: ${error}`);
        continue;
      }

      newUploads.push({
        id: generateId(),
        name: file.name,
        path,
        url,
        size: file.size,
      });
    }

    setUploadedAudio((prev) => [...prev, ...newUploads]);
    setIsUploadingAudio(false);

    // Reset input
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const removeDocument = async (fileId: string) => {
    const file = uploadedDocuments.find((f) => f.id === fileId);
    if (file) {
      await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).remove([file.path]);
      setUploadedDocuments((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const removeAudioFile = async (fileId: string) => {
    const file = uploadedAudio.find((f) => f.id === fileId);
    if (file) {
      await supabase.storage.from(STORAGE_BUCKETS.AUDIO).remove([file.path]);
      setUploadedAudio((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    if (!productUser) {
      setSubmitError('You must be logged in to create a proposal');
      return;
    }

    // Collect file URLs from uploaded files (full Supabase storage URLs)
    const documentUrls = uploadedDocuments.map((f) => f.url);
    const audioUrls = uploadedAudio.map((f) => f.url);

    const formData = {
      title,
      client_name: clientName,
      client_email: clientEmail,
      industry: industry || undefined,
      summary,
      goals,
      scope,
      deliverables: deliverables.map(({ id, ...d }) => d),
      milestones: milestones.map(({ id, ...m }) => m),
      start_date: startDate,
      end_date: endDate,
      date_of_proposal: dateOfProposal,
      total_budget: totalBudget,
      currency,
      billing_type: billingType,
      team_members: teamMembers.map(({ id, ...t }) => t),
      submitted_to: recipients.map(({ id, ...r }) => r),
      links: links.map(({ id, ...l }) => l),
      audio_path: audioUrls,
      document_path: documentUrls,
    };

    // Validate form data
    const result = proposalCreateSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Save proposal to Supabase proposals table with file URLs
      const { data: proposal, error: insertError } = await insertProposal({
        ...result.data,
        organization_id: productUser.organization_id,
        created_by: productUser.user_id,
      });

      if (insertError || !proposal) {
        throw new Error(insertError || 'Failed to save proposal');
      }

      const proposalId = proposal.id;

      // Step 2: Generate signed URLs for uploaded documents and audio files
      const documentPaths = uploadedDocuments.map((f) => f.path);
      const audioPaths = uploadedAudio.map((f) => f.path);

      const { documentUrls: signedDocUrls, audioUrls: signedAudioUrls, errors: signedUrlErrors } =
        await generateAllSignedUrls(documentPaths, audioPaths);

      if (signedUrlErrors.length > 0) {
        console.warn('Some signed URLs failed to generate:', signedUrlErrors);
      }

      // Step 3: POST form data + signed URLs to backend generate endpoint
      await proposalsApi.generate({
        ...result.data,
        proposal_id: proposalId,
        document_signed_urls: signedDocUrls,
        audio_signed_urls: signedAudioUrls,
      });

      // Navigate to the proposal detail page
      router.push(`/proposals/${proposalId}`);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setSubmitError(error.message);
        if (error.details) {
          setErrors(
            Object.fromEntries(
              Object.entries(error.details).map(([key, msgs]) => [key, msgs[0]])
            )
          );
        }
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, getInitialDeliverable()]);
  };

  const removeDeliverable = (id: string) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((d) => d.id !== id));
    }
  };

  const updateDeliverable = (
    id: string,
    field: keyof DeliverableInput,
    value: string
  ) => {
    setDeliverables(
      deliverables.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const addMilestone = () => {
    setMilestones([...milestones, getInitialMilestone()]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (
    id: string,
    field: keyof MilestoneInput,
    value: string | number
  ) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, getInitialTeamMember()]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((t) => t.id !== id));
  };

  const updateTeamMember = (
    id: string,
    field: keyof TeamMemberInput,
    value: string | number | undefined
  ) => {
    setTeamMembers(
      teamMembers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const addLink = () => {
    setLinks([...links, getInitialLink()]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: keyof LinkInput, value: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addRecipient = () => {
    setRecipients([...recipients, getInitialRecipient()]);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  const updateRecipient = (
    id: string,
    field: keyof RecipientInput,
    value: string
  ) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {submitError && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700">
          {submitError}
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700">
          {uploadError}
        </div>
      )}

      {/* File Uploads - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Document Upload */}
        <Card>
          <CardHeader
            title="Document Upload"
            description="PDF, DOC, DOCX"
          />
          <CardContent className="space-y-4">
            <input
              ref={documentInputRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              multiple
              onChange={handleDocumentUpload}
              className="hidden"
            />
            <div
              onClick={() => documentInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {isUploadingDocuments ? 'Uploading...' : 'Click to upload'}
              </p>
            </div>
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                {uploadedDocuments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(file.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-danger-600 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Upload */}
        <Card>
          <CardHeader
            title="Audio Upload"
            description="MP3, WAV, M4A"
          />
          <CardContent className="space-y-4">
            <input
              ref={audioInputRef}
              type="file"
              accept={AUDIO_ACCEPT}
              multiple
              onChange={handleAudioUpload}
              className="hidden"
            />
            <div
              onClick={() => audioInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors"
            >
              <Music className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {isUploadingAudio ? 'Uploading...' : 'Click to upload'}
              </p>
            </div>
            {uploadedAudio.length > 0 && (
              <div className="space-y-2">
                {uploadedAudio.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <Music className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAudioFile(file.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-danger-600 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader title="Basic Information" description="Enter the proposal details" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Proposal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                placeholder="e.g., Website Redesign Project"
                required
              />
            </div>
            <Input
              label="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              error={errors.client_name}
              placeholder="e.g., Acme Corporation"
              required
            />
            <Input
              label="Client Email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              error={errors.client_email}
              placeholder="e.g., contact@acme.com"
              required
            />
            <Select
              label="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={INDUSTRY_OPTIONS.map((ind) => ({ value: ind, label: ind }))}
              placeholder="Select industry"
            />
            <Input
              label="Proposal Date"
              type="date"
              value={dateOfProposal}
              onChange={(e) => setDateOfProposal(e.target.value)}
              error={errors.date_of_proposal}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Description */}
      <Card>
        <CardHeader
          title="Project Description"
          description="Describe the project in detail"
        />
        <CardContent className="space-y-6">
          <Textarea
            label="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            error={errors.summary}
            placeholder="Brief overview of the project..."
            rows={3}
            required
          />
          <Textarea
            label="Goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            error={errors.goals}
            placeholder="What are the key objectives of this project?"
            rows={4}
            required
          />
          <Textarea
            label="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            error={errors.scope}
            placeholder="Define what is included and excluded from this project..."
            rows={4}
            required
          />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader title="Timeline" description="Set the project schedule" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.start_date}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.end_date}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader title="Budget & Billing" description="Set the project budget" />
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Input
              label="Total Budget"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              error={errors.total_budget}
              min={0}
              step={0.01}
              required
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              options={Object.entries(CURRENCY_CONFIG).map(([value, config]) => ({
                value,
                label: `${config.symbol} ${config.name}`,
              }))}
              required
            />
            <Select
              label="Billing Type"
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as BillingType)}
              options={Object.entries(BILLING_TYPE_CONFIG).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader
          title="Deliverables"
          description="List the project deliverables"
          action={
            <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {deliverables.map((deliverable, index) => (
            <div
              key={deliverable.id}
              className="flex gap-4 rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center text-slate-400">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex-1 grid gap-4 md:grid-cols-3">
                <Input
                  label="Title"
                  value={deliverable.title}
                  onChange={(e) =>
                    updateDeliverable(deliverable.id, 'title', e.target.value)
                  }
                  error={errors[`deliverables.${index}.title`]}
                  required
                />
                <Input
                  label="Description"
                  value={deliverable.description}
                  onChange={(e) =>
                    updateDeliverable(deliverable.id, 'description', e.target.value)
                  }
                  error={errors[`deliverables.${index}.description`]}
                  required
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={deliverable.due_date || ''}
                  onChange={(e) =>
                    updateDeliverable(deliverable.id, 'due_date', e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeDeliverable(deliverable.id)}
                className="self-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-danger-600"
                disabled={deliverables.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader
          title="Milestones"
          description="Define milestones (optional)"
          action={
            <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {milestones.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No milestones added. Click "Add" to create a milestone.
            </p>
          ) : (
            milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex gap-4 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center text-slate-400">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <Input
                    label="Title"
                    value={milestone.title}
                    onChange={(e) =>
                      updateMilestone(milestone.id, 'title', e.target.value)
                    }
                    error={errors[`milestones.${index}.title`]}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="self-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-danger-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader
          title="Team Members"
          description="Add team members working on this project (optional)"
          action={
            <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No team members added. Click "Add" to add a team member.
            </p>
          ) : (
            teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex gap-4 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Role"
                    value={member.role}
                    onChange={(e) =>
                      updateTeamMember(member.id, 'role', e.target.value)
                    }
                    error={errors[`team_members.${index}.role`]}
                    placeholder="e.g., Lead Developer"
                    required
                  />
                  <Input
                    label="Experience"
                    value={member.experience}
                    onChange={(e) =>
                      updateTeamMember(member.id, 'experience', e.target.value)
                    }
                    error={errors[`team_members.${index}.experience`]}
                    placeholder="e.g., 5 years or Senior level"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTeamMember(member.id)}
                  className="self-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-danger-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader
          title="Reference Links"
          description="Add relevant links (optional)"
          action={
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {links.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No links added. Click "Add" to add a reference link.
            </p>
          ) : (
            links.map((link, index) => (
              <div
                key={link.id}
                className="flex gap-4 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Label"
                    value={link.label}
                    onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                    error={errors[`links.${index}.label`]}
                    placeholder="e.g., Design Mockups"
                    required
                  />
                  <Input
                    label="URL"
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    error={errors[`links.${index}.url`]}
                    placeholder="https://..."
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  className="self-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-danger-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Submit To */}
      <Card>
        <CardHeader
          title="Submit To"
          description="Add recipients for this proposal (optional)"
          action={
            <Button type="button" variant="outline" size="sm" onClick={addRecipient}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {recipients.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No recipients added. Click "Add" to add a recipient.
            </p>
          ) : (
            recipients.map((recipient, index) => (
              <div
                key={recipient.id}
                className="flex gap-4 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <Select
                    label="Salutation"
                    value={recipient.salutation}
                    onChange={(e) =>
                      updateRecipient(recipient.id, 'salutation', e.target.value)
                    }
                    options={[
                      { value: 'Mr.', label: 'Mr.' },
                      { value: 'Ms.', label: 'Ms.' },
                      { value: 'Mrs.', label: 'Mrs.' },
                      { value: 'Dr.', label: 'Dr.' },
                    ]}
                    error={errors[`submitted_to.${index}.salutation`]}
                    placeholder="Select salutation"
                    required
                  />
                  <Input
                    label="Name"
                    value={recipient.name}
                    onChange={(e) =>
                      updateRecipient(recipient.id, 'name', e.target.value)
                    }
                    error={errors[`submitted_to.${index}.name`]}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRecipient(recipient.id)}
                  className="self-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-danger-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create Proposal
        </Button>
      </div>
    </form>
  );
}
