# REST API Contract Definitions

This document defines all REST API endpoints for the Proposal Generator SaaS application.

## Base URL

```
Production: https://api.proposalgen.com/api
Development: http://localhost:3001/api
```

## Authentication

All endpoints (except auth) require JWT Bearer token authentication:

```
Authorization: Bearer <access_token>
```

---

## Authentication APIs

### POST /auth/login

Authenticate a user and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "full_name": "John Smith",
      "organization_id": "org_456",
      "role_id": "role_789",
      "role": {
        "id": "role_789",
        "name": "Admin",
        "slug": "admin",
        "permissions": [...]
      }
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### POST /auth/register

Register a new user and organization.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Smith",
  "organization_name": "Acme Corp" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /auth/logout

Invalidate current tokens.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### GET /auth/me

Get current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "full_name": "John Smith",
    "organization_id": "org_456",
    "role": {...}
  }
}
```

---

## Dashboard APIs

### GET /dashboard/summary

Get dashboard summary statistics.

**Query Parameters:**
- `period` (optional): "day" | "week" | "month" | "year" (default: "month")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "approved_count": 24,
    "pending_count": 8,
    "rejected_count": 3,
    "total_count": 35,
    "total_value": 245000,
    "currency": "USD",
    "month_over_month_change": 12.5
  }
}
```

---

## Proposal APIs

### GET /proposals

List proposals with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status
- `client_name` (optional): Filter by client name
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `search` (optional): Search in title and client name

**Response (200):**
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "prop_123",
        "organization_id": "org_456",
        "pdf_code": "PRO-ABC12345",
        "title": "Website Redesign Project",
        "client_name": "Acme Corp",
        "client_email": "contact@acme.com",
        "industry": "Technology",
        "summary": "...",
        "goals": "...",
        "scope": "...",
        "deliverables": [...],
        "milestones": [...],
        "start_date": "2024-02-01",
        "end_date": "2024-04-30",
        "date_of_proposal": "2024-01-15",
        "total_budget": 25000,
        "currency": "USD",
        "billing_type": "milestone",
        "team_members": [...],
        "submitted_to": [...],
        "links": [...],
        "audio_path": [...],
        "status": "approval_pending",
        "created_by": "usr_789",
        "approved_by": null,
        "generated_pdf_path": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 35,
    "total_pages": 4
  }
}
```

---

### POST /proposals

Create a new proposal.

**Request:**
```json
{
  "title": "Website Redesign Project",
  "client_name": "Acme Corp",
  "client_email": "contact@acme.com",
  "industry": "Technology",
  "summary": "Complete website redesign...",
  "goals": "Increase traffic by 50%...",
  "scope": "Full website redesign...",
  "deliverables": [
    {
      "title": "Design Mockups",
      "description": "High-fidelity designs",
      "due_date": "2024-02-15"
    }
  ],
  "milestones": [
    {
      "title": "Design Approval",
      "description": "Client approval of designs",
      "amount": 5000,
      "due_date": "2024-02-15",
      "status": "pending"
    }
  ],
  "start_date": "2024-02-01",
  "end_date": "2024-04-30",
  "date_of_proposal": "2024-01-15",
  "total_budget": 25000,
  "currency": "USD",
  "billing_type": "milestone",
  "team_members": [
    {
      "name": "John Smith",
      "role": "Project Manager",
      "email": "john@company.com"
    }
  ],
  "submitted_to": ["contact@acme.com"],
  "links": [
    {
      "label": "Design Mockups",
      "url": "https://figma.com/..."
    }
  ],
  "audio_path": []
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "pdf_code": "PRO-ABC12345",
    "status": "approval_pending",
    "organization_id": "org_456",
    "created_by": "usr_789",
    ...
  }
}
```

**Note:** Status transitions:
1. On creation → `pending` (internal processing)
2. After server-side processing → `approval_pending` (automatic)

---

### GET /proposals/:id

Get a single proposal by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    ...
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Proposal not found"
  }
}
```

---

### PUT /proposals/:id

Update an existing proposal.

**Request:** (Same as POST, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

**Error (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Cannot edit approved proposals"
  }
}
```

---

### DELETE /proposals/:id

Delete a proposal.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

### POST /proposals/:id/approve

Approve a proposal. Requires privileged role.

**Request:**
```json
{
  "comments": "Approved with minor adjustments" // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "status": "completed",
    "approved_by": "usr_admin",
    "updated_at": "2024-01-16T14:30:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot approve proposal with status 'pending'"
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to approve proposals"
  }
}
```

---

### POST /proposals/:id/reject

Reject a proposal. Requires privileged role.

**Request:**
```json
{
  "reason": "Budget exceeds our current allocation"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "status": "rejected",
    "approved_by": "usr_admin",
    "rejection_reason": "Budget exceeds our current allocation",
    "updated_at": "2024-01-16T14:30:00Z"
  }
}
```

---

## User APIs

### GET /users

List organization users.

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [...]
  },
  "meta": {...}
}
```

---

### GET /users/:id

Get user by ID.

---

### PUT /users/:id

Update user.

---

### DELETE /users/:id

Deactivate user.

---

## Template APIs

### GET /templates

List proposal templates.

---

### POST /templates

Create a template.

---

### GET /templates/:id

Get template by ID.

---

### PUT /templates/:id

Update template.

---

### DELETE /templates/:id

Delete template.

---

## Subscription APIs

### GET /subscriptions

Get organization's subscription.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sub_123",
    "organization_id": "org_456",
    "plan": "professional",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "proposal_limit": 200,
    "proposals_used": 45,
    "user_limit": 20,
    "users_count": 8,
    "features": {
      "pdf_generation": true,
      "custom_branding": true,
      "api_access": true,
      "priority_support": true,
      "audit_logs": false,
      "multi_level_approval": false
    }
  }
}
```

---

### GET /subscriptions/:id/invoices

Get subscription invoices.

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_STATUS_TRANSITION` | 400 | Invalid status change |
| `SUBSCRIPTION_LIMIT` | 402 | Subscription limit reached |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Status Lifecycle

### Proposal Status Flow

```
pending → approval_pending → completed
                          ↘ rejected → approval_pending (resubmit)
```

### Valid Transitions

| From | To | Actor |
|------|------|-------|
| `pending` | `approval_pending` | System (automatic) |
| `approval_pending` | `completed` | Privileged user |
| `approval_pending` | `rejected` | Privileged user |
| `rejected` | `approval_pending` | Any user (resubmit) |

---

## Rate Limits

- Authentication endpoints: 10 requests/minute
- API endpoints: 100 requests/minute
- File uploads: 10 requests/minute

---

## Webhook Events (Future)

```json
{
  "event": "proposal.approved",
  "timestamp": "2024-01-16T14:30:00Z",
  "data": {
    "proposal_id": "prop_123",
    "organization_id": "org_456",
    "approved_by": "usr_admin"
  }
}
```

Events:
- `proposal.created`
- `proposal.updated`
- `proposal.approved`
- `proposal.rejected`
- `subscription.updated`
- `user.invited`
