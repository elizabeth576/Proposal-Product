# ProposalGen - Proposal Generator SaaS

A production-ready, multi-tenant SaaS application for creating, managing, and tracking professional proposals.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Authentication**: JWT with refresh token rotation
- **State Management**: React Context + Server Components
- **Icons**: Lucide React

## Features

### Core Modules

- **Dashboard**: Summary cards, recent proposals, status filters
- **Proposal Management**: Create, list, view, edit proposals
- **Approval Workflow**: Role-based approve/reject actions
- **Multi-Tenant**: Organization-scoped data isolation

### Proposal Features

- Comprehensive form with all fields
- Deliverables and milestones management
- Team members assignment
- Reference links and attachments
- Status lifecycle management

### Security

- JWT authentication with auto-refresh
- Role-based access control (RBAC)
- Middleware-based route protection
- API-level permission enforcement

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   └── proposals/       # Proposal CRUD pages
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── layout/              # Layout components
│   └── proposals/           # Proposal-specific components
├── lib/
│   ├── api/                 # API client and services
│   ├── auth/                # Auth utilities
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── validations/         # Zod schemas
├── types/                   # TypeScript types
├── constants/               # App constants
└── contexts/                # React contexts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see API contracts)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
JWT_SECRET=your-secret-key-change-in-production
```

## API Integration

The frontend communicates with the backend via REST APIs. See `docs/api-contracts.md` for full API documentation.

### Key Endpoints

```
# Auth
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET  /api/auth/me

# Dashboard
GET /api/dashboard/summary

# Proposals
GET    /api/proposals
POST   /api/proposals
GET    /api/proposals/:id
PUT    /api/proposals/:id
DELETE /api/proposals/:id
POST   /api/proposals/:id/approve
POST   /api/proposals/:id/reject
```

## Status Lifecycle

```
pending → approval_pending → completed
                          ↘ rejected
```

### Status Transitions

| From | To | Actor |
|------|------|-------|
| `pending` | `approval_pending` | System (auto) |
| `approval_pending` | `completed` | Privileged user |
| `approval_pending` | `rejected` | Privileged user |
| `rejected` | `approval_pending` | Any user (resubmit) |

## Role-Based Access Control

### Roles

| Role | Can Approve | Description |
|------|-------------|-------------|
| `super_admin` | Yes | Full system access |
| `admin` | Yes | Organization admin |
| `manager` | Yes | Team manager |
| `member` | No | Regular team member |
| `viewer` | No | Read-only access |

## Data Models

### Core Entities

- **Organizations**: Multi-tenant root entity
- **Users**: Organization members with roles
- **Proposals**: Main business entity
- **Templates**: Reusable proposal templates
- **Subscriptions**: Billing and limits

See `src/types/index.ts` for complete type definitions.

## Component Library

### UI Components

- `Button` - Primary, secondary, danger, outline variants
- `Input` - Text input with icons and validation
- `Textarea` - Multi-line text input
- `Select` - Dropdown select
- `Card` - Content container
- `Badge` - Status indicators
- `Table` - Data tables with pagination
- `Modal` - Dialog overlays
- `Loading` - Spinners and skeletons
- `EmptyState` - Empty data placeholders

### Usage Example

```tsx
import { Button, Input, Card, StatusBadge } from '@/components/ui';

export function ProposalCard({ proposal }) {
  return (
    <Card>
      <h3>{proposal.title}</h3>
      <StatusBadge status={proposal.status} />
      <Button onClick={handleView}>View Details</Button>
    </Card>
  );
}
```

## Development

### Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Feature-based folder structure
- Server Components by default
- Client Components only for interactivity

## Future Extensions

See `docs/future-extensions.md` for planned features:

- PDF Generation
- Multi-Level Approvals
- Stripe Integration
- Audit Logs
- Email Notifications
- Client Portal
- Analytics Dashboard

## License

MIT
