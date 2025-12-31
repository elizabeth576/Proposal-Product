# Future Extensions

This document outlines planned features and extensions for the Proposal Generator SaaS platform.

---

## 1. PDF Generation

### Overview
Automatically generate professional PDF documents from proposals with customizable templates.

### Implementation Notes

```typescript
// src/lib/api/pdf.ts
export const pdfApi = {
  generate: async (proposalId: string, templateId?: string): Promise<ApiResponse<PdfResult>> => {
    return apiClient.post<PdfResult>(`/proposals/${proposalId}/generate-pdf`, { templateId });
  },

  download: async (proposalId: string): Promise<Blob> => {
    // Return blob for download
  }
};
```

### Backend Requirements
- **Service**: Use Puppeteer or wkhtmltopdf for HTML-to-PDF conversion
- **Templates**: Handlebars or React-PDF for templating
- **Storage**: AWS S3 or similar for PDF storage
- **Queue**: Background job processing for generation

### Database Changes
```sql
ALTER TABLE proposals ADD COLUMN generated_pdf_path VARCHAR(500);
ALTER TABLE proposals ADD COLUMN pdf_generated_at TIMESTAMP;

CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(200) NOT NULL,
  content TEXT NOT NULL, -- HTML template
  styles TEXT, -- CSS styles
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend Changes
- Add "Generate PDF" button to proposal detail page
- Preview modal before generation
- Download link after generation
- Template selection dropdown

---

## 2. Multi-Level Approvals

### Overview
Support approval workflows with multiple levels (e.g., Manager → Director → VP).

### Implementation Notes

```typescript
// src/types/index.ts
export interface ApprovalWorkflow {
  id: string;
  organization_id: string;
  name: string;
  levels: ApprovalLevel[];
  conditions: ApprovalCondition[];
  is_default: boolean;
}

export interface ApprovalLevel {
  level: number;
  role_ids: string[];
  min_approvers: number;
  auto_approve_under?: number; // Amount threshold
}

export interface ApprovalCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number | string;
  workflow_id: string;
}

export interface ProposalApproval {
  id: string;
  proposal_id: string;
  level: number;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
}
```

### Database Changes
```sql
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(200) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE approval_levels (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES approval_workflows(id),
  level_number INTEGER NOT NULL,
  min_approvers INTEGER DEFAULT 1,
  auto_approve_under DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE approval_level_roles (
  level_id UUID REFERENCES approval_levels(id),
  role_id UUID REFERENCES product_roles(id),
  PRIMARY KEY (level_id, role_id)
);

CREATE TABLE proposal_approvals (
  id UUID PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id),
  level_id UUID REFERENCES approval_levels(id),
  approver_id UUID REFERENCES product_users(id),
  status VARCHAR(20) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Status Flow Enhancement
```
pending → approval_pending_l1 → approval_pending_l2 → approval_pending_l3 → completed
                             ↘ rejected
```

### Frontend Changes
- Approval progress indicator
- Level-specific approval buttons
- Approval history timeline
- Workflow configuration UI (admin)

---

## 3. Stripe Integration

### Overview
Integrate Stripe for subscription management and billing.

### Implementation Notes

```typescript
// src/lib/api/stripe.ts
export const stripeApi = {
  createCheckoutSession: async (priceId: string): Promise<ApiResponse<{ url: string }>> => {
    return apiClient.post('/subscriptions/checkout', { priceId });
  },

  createPortalSession: async (): Promise<ApiResponse<{ url: string }>> => {
    return apiClient.post('/subscriptions/portal');
  },

  getSubscription: async (): Promise<ApiResponse<Subscription>> => {
    return apiClient.get('/subscriptions/current');
  }
};
```

### Backend Requirements

```typescript
// Webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
});
```

### Database Changes
```sql
ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id VARCHAR(100);
ALTER TABLE subscriptions ADD COLUMN stripe_customer_id VARCHAR(100);
ALTER TABLE subscriptions ADD COLUMN stripe_price_id VARCHAR(100);

CREATE TABLE stripe_events (
  id UUID PRIMARY KEY,
  stripe_event_id VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend Changes
- Pricing page with plan comparison
- Upgrade/downgrade flow
- Billing portal link
- Usage meters and limits display
- Payment method management

---

## 4. Audit Logs

### Overview
Comprehensive logging of all system actions for compliance and debugging.

### Implementation Notes

```typescript
// src/types/index.ts
export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  user?: User;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'export'
  | 'invite_user'
  | 'remove_user';

// src/lib/api/audit.ts
export const auditApi = {
  list: async (filters: AuditLogFilters): Promise<ApiResponse<AuditLogsResponse>> => {
    return apiClient.get('/audit-logs', filters);
  },

  getByResource: async (resourceType: string, resourceId: string): Promise<ApiResponse<AuditLog[]>> => {
    return apiClient.get(`/audit-logs/${resourceType}/${resourceId}`);
  }
};
```

### Backend Implementation

```typescript
// Middleware for automatic audit logging
const auditMiddleware = (action: AuditAction, resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function(data) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog({
          organization_id: req.user.organization_id,
          user_id: req.user.id,
          action,
          resource_type: resourceType,
          resource_id: data.data?.id || req.params.id,
          new_values: req.body,
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};
```

### Database Changes
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES product_users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### Frontend Changes
- Audit log viewer page (admin only)
- Activity timeline on resource pages
- Export audit logs functionality
- Filters by date, user, action type

---

## 5. Additional Future Features

### Email Notifications
- Proposal submission notifications
- Approval request notifications
- Status change notifications
- Configurable notification preferences

### Client Portal
- Secure proposal viewing for clients
- Client comments and feedback
- Electronic signatures
- Status tracking for clients

### Analytics Dashboard
- Proposal success rates
- Average approval time
- Revenue forecasting
- Team performance metrics

### Template Library
- Pre-built industry templates
- Template marketplace
- Custom template builder
- Version control for templates

### API Integrations
- CRM integrations (Salesforce, HubSpot)
- Slack notifications
- Zapier webhooks
- Calendar integrations

### Mobile App
- React Native app
- Push notifications
- Offline access
- Quick proposal creation

---

## Implementation Priority

1. **Phase 1 (High Priority)**
   - PDF Generation
   - Stripe Integration
   - Email Notifications

2. **Phase 2 (Medium Priority)**
   - Audit Logs
   - Multi-Level Approvals
   - Analytics Dashboard

3. **Phase 3 (Future)**
   - Client Portal
   - Template Library
   - Mobile App
   - API Integrations

---

## Architecture Considerations

### Microservices Migration Path
```
Current: Monolith API
     ↓
Phase 1: PDF Service (separate worker)
     ↓
Phase 2: Notification Service
     ↓
Phase 3: Analytics Service
```

### Scaling Considerations
- Database read replicas for reporting
- Redis caching for frequently accessed data
- CDN for static assets and PDFs
- Queue system for background jobs (Bull, SQS)
- WebSocket for real-time updates
