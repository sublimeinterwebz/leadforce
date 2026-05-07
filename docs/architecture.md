# LeadForce CRM: Project Architecture & Documentation

This document serves as the single source of truth for the LeadForce CRM project. It outlines the core architecture, technology stack, system features, and database schema to help any developer quickly onboard and start contributing.

---

## 1. Technology Stack

LeadForce is built using a modern, scalable, and type-safe stack:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules) with CSS Variables for a dynamic theming system. Tailwind CSS is intentionally avoided in favor of raw CSS control.
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma
- **Icons**: `lucide-react`
- **AI Integration**: Google Gemini 2.5 Flash via `@google/genai` (used for intelligent task parsing from user notes).
- **Deployment**: Vercel

---

## 2. Core Architecture & Features

### 2.1 Thematic & Responsive UI
- **Design Philosophy**: The application is designed to be mobile-first but fully fluid up to `1200px` for desktop users. It prioritizes a premium look using standard brand colors (primary red: `#e10800`).
- **Global CSS Variables**: All core colors, spacing, and border radii are defined in `globals.css` using native CSS variables (`--primary`, `--neutral-100`, etc.), making the app highly consistent and easily themeable.

### 2.2 Authentication Middleware
Authentication is handled via a lightweight custom session cookie (`leadforce_session`). 
- All frontend and `/api/` routes are protected by Next.js `middleware.ts`.
- The middleware redirects unauthenticated frontend users to `/login` and blocks authenticated users from accessing the login page.
- Unauthenticated requests to `/api/` endpoints immediately return a `401 Unauthorized` response.

### 2.3 Intelligent Notes & Task Parsing
The CRM features an AI-powered note logging system (`/api/history`):
- Users input unstructured notes (e.g., "Had a great call, need to send the contract by Friday").
- The backend queries **Gemini 2.5 Flash**, passing the raw note and the current system date.
- The AI responds with a structured JSON payload predicting actionable tasks with formatted `dueDate`s.
- The system automatically creates `Action` items (tasks) for the partner alongside a standard `HistoryLog` entry for the note itself.

### 2.4 Excel/CSV Bulk Import Engine
LeadForce supports robust bulk importing (`/partners/import`):
- **Library**: `xlsx`
- **Fuzzy Matching**: The importer intelligently maps columns (e.g., "Company Name", "Client", "Org") to database fields.
- **Dynamic Service Assignments**: It auto-detects columns for the 8 core services (e.g., "Card Acceptance", "Wallet Acceptance"). If a cell contains a stage (e.g., "Contracting"), the importer automatically creates a junction record assigning that service and stage to the partner.
- **Stage Normalization**: The backend API cleanly maps legacy spreadsheet terms (e.g., "Proposal", "Contract") into system-standard stages ("Commitment", "Contracting").

### 2.5 Task & Pipeline Management
- **Pipeline Stages**: The global system operates on standard stages: `Discovery`, `Scope Alignment`, `Commitment`, `Contracting`, `Delivery`, `No Feedback`.
- **Task CRUD**: Users can manually create tasks or manage them interactively (check off, delete) from both the individual Partner's UI and the global `/tasks` page. This is powered by interactive client-side React components communicating with `PATCH`/`DELETE`/`POST` API endpoints (`/api/actions`).
- **Partner Management**: Full CRUD is supported via `EditPartnerClient` and `DeletePartnerClient`, ensuring accurate and maintainable records.

### 2.6 Document Management
- **Uploads**: Users can upload contracts or supporting documents directly to a Partner's profile using the `DocumentManagerClient`. Files are currently stored and served locally.

---

## 3. Database Schema

The database is managed via Prisma and hosted on PostgreSQL. The relational structure handles complex multi-product assignments, task tracking, and audit histories.

### Models Overview

#### 1. `Partner`
The core entity representing a client or lead.
- **Fields:**
  - `id`: CUID
  - `companyName`: String
  - `keyContact`: String
  - `contactEmail`: String (optional)
  - `contactPhone`: String (optional)
  - `source`: String (optional)
  - `industryCategory`: String (optional)
  - `overallStage`: String (Defaults to "Discovery")
  - `lastActivityAt`: DateTime
  - `createdAt`, `updatedAt`: DateTime
- **Relations:** 1-to-many with `PartnerProduct`, `Action`, `HistoryLog`, `Document`.

#### 2. `Product`
A master list of services LeadForce offers. This is statically seeded.
- **Fixed List:** Card Acceptance, Wallet Acceptance, Erada Financing, Loyalty, EBU, Cash Collection, HR Payroll, HR Salary in Advance.
- **Fields:**
  - `id`: CUID
  - `name`: String (Unique)

#### 3. `PartnerProduct` (Junction Table)
Tracks *which* services are assigned to *which* partner, and what pipeline stage that specific service is in.
- **Fields:**
  - `id`: CUID
  - `partnerId`: String (FK)
  - `productId`: String (FK)
  - `stage`: String (Defaults to "Discovery")
  - `discussionNotes`: String (optional)
- **Constraints:** Unique composite key on `[partnerId, productId]`.

#### 4. `Action`
Follow-up tasks or to-do items linked to a partner.
- **Fields:**
  - `id`: CUID
  - `partnerId`: String (FK)
  - `description`: String
  - `dueDate`: DateTime
  - `status`: String ("Pending" or "Completed")

#### 5. `HistoryLog`
A comprehensive audit trail tracking both system events (like stage changes or imports) and manual user comments.
- **Fields:**
  - `id`: CUID
  - `partnerId`: String (FK)
  - `type`: String ("System" or "UserComment")
  - `content`: String

#### 6. `Document`
A reference to files or contracts uploaded for a partner.
- **Fields:**
  - `id`: CUID
  - `partnerId`: String (FK)
  - `fileName`: String
  - `fileUrl`: String
  - `mimeType`: String (optional)

---

## 4. Operational Best Practices
- **UI Modifications:** When updating or adding UI components, stick strictly to the established CSS module pattern and use global CSS variables (`var(--primary)`, `var(--radius-md)`). Do not install Tailwind CSS or styled-components.
- **Prisma Migrations:** When changing the database schema (`schema.prisma`), always run `npx prisma db push` to sync the cloud database, followed by `npx prisma generate` to update the local TypeScript client.
- **AI Integrations:** Because LeadForce uses Gemini's free tier, always wrap AI calls in `try/catch` blocks. Implement graceful fallback behavior (e.g., saving the note normally without extracting tasks) to handle rate limits or `503 Service Unavailable` API errors.
