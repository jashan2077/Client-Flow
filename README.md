# ClientFlow — Multi-Tenant SaaS Project Management Platform

ClientFlow is a full-featured project management platform built for marketing agencies, software agencies, creative agencies, consulting firms, and other service businesses. It supports four distinct user roles across a three-tier hierarchy: **Super Admin → Agency → Client**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (credentials provider, JWT sessions) |
| Styling | Tailwind CSS |
| Package Manager | npm |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally or remotely

### 1. Clone & Install

```bash
cd appzex
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/appzex"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Run migrations (creates the database schema)
npx prisma migrate dev --name init

# Generate the Prisma client
npx prisma generate

# Seed with demo data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@appzex.com | admin123 |
| Agency Admin | admin@brightmedia.com | agency123 |
| Team Member | alex@brightmedia.com | team123 |
| Client | client@acmecorp.com | client123 |
| Client | client@novatech.io | client123 |
| Suspended Agency | admin@stellardesign.co | agency123 |

---

## Application Structure

```
/app
  /login                     — Auth page
  /super-admin
    /dashboard               — Platform-wide stats & activity feed
    /agencies                — Searchable agency table
    /agencies/[id]           — Agency detail + support mode entry
    /activity                — Full platform activity log
  /agency
    /dashboard               — Agency overview (clients, projects, feedback)
    /team                    — Manage team members
    /clients                 — CRUD client companies
    /clients/[id]            — Client detail + projects + timeline
    /projects                — All projects (filterable)
    /projects/new            — Create project form
    /projects/[id]           — Project detail (progress, milestones, tabs)
    /projects/[id]/tasks     — Kanban task board
    /meetings                — Record meeting notes
    /feedback                — View & update client feedback
  /client-portal
    /dashboard               — Projects overview + open feedback
    /projects/[id]           — Read-only project view
    /feedback                — Submit and track feedback
  /api
    /auth/[...nextauth]      — NextAuth handlers
    /super-admin/agencies/[id]/status — PATCH agency status
    /support/enter/[agencyId]         — Enter support mode
    /support/exit                     — Exit support mode
    /agency/team             — Team member CRUD
    /agency/clients          — Client CRUD
    /agency/projects         — Project CRUD
    /agency/projects/[id]/tasks — Task CRUD
    /agency/tasks/[id]       — Task PATCH/DELETE
    /agency/meetings         — Meeting creation
    /agency/feedback/[id]    — Feedback status update
    /client/feedback         — Client feedback submission

/components
  /ui                        — Badge, Button, Card, ProgressBar
  /super-admin               — SuperAdminNav, AgencyActions
  /agency                    — AgencyNav, SupportModeBanner, forms, KanbanBoard, ProjectTabs
  /client-portal             — ClientNav, SubmitFeedbackForm

/lib
  auth.ts                    — NextAuth configuration
  prisma.ts                  — Singleton Prisma client
  permissions.ts             — Role-checking helpers

/prisma
  schema.prisma              — Full Prisma schema
  seed.ts                    — Demo data seed

/types
  next-auth.d.ts             — Session type augmentation

middleware.ts                — Route protection
```

---

## Architecture Decisions

### Why Next.js App Router

The App Router enables **server components by default**, which means database queries can run directly on the server without a round-trip API call. This eliminates an entire category of data-fetching boilerplate and makes page-level data fetching trivially secure — the session is checked at the top of every Server Component before any data is returned.

Client Components (`"use client"`) are used only where interactivity is required: forms, kanban drag/drop state, status update buttons. Everything else renders server-side.

### Multi-Tenancy Approach

Every record that belongs to an agency carries an `agencyId` foreign key directly on the model (`Project`, `Client`, `Task`, `File`, `ActivityLog`, etc.). Every agency workspace database query is scoped by the session user's `agencyId`:

```typescript
const agencyId = session.user.role === "SUPER_ADMIN"
  ? session.user.supportAgencyId!
  : session.user.agencyId!;

const projects = await prisma.project.findMany({
  where: { agencyId }, // ← always enforced server-side
});
```

The `agencyId` is **never accepted from the request body or URL parameters** for mutation operations — it is always derived from the authenticated session. This prevents horizontal privilege escalation (one agency accessing another agency's data).

### Derived Progress Calculation

Project progress is not stored in the database. It is calculated on demand:

```
progress = (tasks.filter(t => t.status === "DONE").length / tasks.length) * 100
```

- If the project has **no tasks**, progress is **0%**.
- This keeps the data model simple and the progress value always accurate — there is no risk of staleness from a denormalized field.
- The calculation is performed in Server Components (no extra API call) and in the Kanban board client component for instant feedback when a task is moved.

### Support Mode (Read-Write)

When a Super Admin enters an agency workspace via "Enter Workspace (Support Mode)":

1. A `SupportSession` record is created in the database with `startedAt`.
2. An `ActivityLog` entry (`ENTERED_SUPPORT_MODE`) is written.
3. The Super Admin navigates to `/agency/dashboard` and sees a **yellow banner** identifying them as a support viewer.
4. All agency data is loaded using `supportAgencyId` from the session.

**Support mode is read-write** by design. Super Admins need to be able to fix data issues (e.g., misconfigured projects, stuck tasks) on behalf of agencies. Every write action performed in support mode is logged in `ActivityLog` with the Super Admin's `userId`, creating a full audit trail. Agencies can see this activity in their own logs. When the Super Admin exits, the `SupportSession.endedAt` is stamped.

### Permission Matrix

| Route | SUPER_ADMIN | AGENCY_ADMIN | AGENCY_TEAM | CLIENT |
|---|---|---|---|---|
| `/super-admin/*` | ✅ | ❌ | ❌ | ❌ |
| `/agency/*` | ✅ (support mode only) | ✅ (own agency) | ✅ (own agency) | ❌ |
| `/client-portal/*` | ❌ | ❌ | ❌ | ✅ (own client) |
| Suspended agency | N/A | ❌ 403 | ❌ 403 | ❌ 403 |
| Team management | N/A | ✅ | ❌ | ❌ |
| Client data | N/A | ✅ all | ✅ all | own only |

### Session JWT Shape

The JWT token encodes:
- `id` — User ID
- `role` — `SUPER_ADMIN | AGENCY_ADMIN | AGENCY_TEAM | CLIENT`
- `agencyId` — For agency users; null for Super Admin and Clients
- `clientId` — For CLIENT role; null for others
- `supportAgencyId` — Set when Super Admin enters support mode; null otherwise

---

## Key Business Rules

- **Client isolation**: `project.clientId` must equal `session.user.clientId` for all client portal queries.
- **Suspended agency**: The agency workspace layout checks agency status and renders a 403 page for non-Super-Admin users.
- **Milestone workflow**: New projects automatically get 5 default milestones: Planning → Design → Development → Testing → Client Review.
- **Overdue tasks**: Tasks with `dueDate < now` and `status !== 'DONE'` are flagged with an "Overdue" badge in the Kanban board.
