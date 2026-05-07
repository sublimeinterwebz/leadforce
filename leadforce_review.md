# LeadForce CRM — Full Code Review & Feature Roadmap

> **Scope**: Every file in `/Users/hadya/Desktop/Projects/LeadForce` reviewed — 35+ source files across Prisma schema, 12 API routes, 5 pages, 10 components, all CSS modules, middleware, and configuration.

---

## Table of Contents
1. [Architecture Summary](#architecture-summary)
2. [🔴 Critical Issues](#-critical-issues)
3. [🟠 Important Improvements](#-important-improvements)
4. [🟡 Code Quality & DX](#-code-quality--dx)
5. [🟢 New Features to Implement](#-new-features-to-implement)
6. [Priority Roadmap](#priority-roadmap)

---

## Architecture Summary

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js 16.2 (App Router) | ✅ Modern |
| Database | PostgreSQL (Prisma ORM) | ✅ Solid |
| Auth | Firebase Auth + cookie middleware | ⚠️ Disabled |
| AI | Gemini 2.5 Flash (task extraction) | ✅ Working |
| Styling | CSS Modules + design tokens | ✅ Consistent |
| File Upload | Local filesystem (`public/uploads`) | ⚠️ Not production-ready |

**Current features**: Dashboard, Partner pipeline (CRUD), Product/service management per partner, Task management, Activity timeline with quick notes, AI-powered task extraction from notes, Bulk Excel import, Reports page with funnel/distribution charts, Firebase login.

---

## 🔴 Critical Issues

### 1. Authentication is Completely Disabled
**File**: [middleware.ts](file:///Users/hadya/Desktop/Projects/LeadForce/src/middleware.ts#L8-L17)

The entire auth check is commented out. **Anyone can access every route and API endpoint** without authentication.

```typescript
// Auth temporarily disabled for UI/UX testing
/*
if (!session && !path.startsWith('/login') && !path.startsWith('/api/')) {
  return NextResponse.redirect(new URL('/login', request.url));
}
*/
```

> [!CAUTION]
> **Impact**: Full unauthenticated access to all data, all CRUD operations, all partner records. This must be re-enabled before any deployment.

**Additionally**: The current auth model is weak — it sets a static cookie `leadforce_session = 'active'` (line 28 of login page). There's no token verification, no user identity, no role-based access. Any user who manually sets this cookie gains full access.

---

### 2. Firebase API Key Exposed in Source Code
**File**: [firebase.ts](file:///Users/hadya/Desktop/Projects/LeadForce/src/lib/firebase.ts#L4-L12)

The full Firebase config (API key, project ID, app ID) is hardcoded in the source code:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAiEkm6qJpHvddtN23C6CzBPgLKSIy8vzs",
  // ... all other keys
};
```

> [!WARNING]
> While Firebase API keys are designed to be public, the real problem is there are **no Firebase Security Rules configured** (or at least not validated). Combined with disabled middleware, this is a wide-open system.

**Fix**: Move config to env variables, configure Firebase App Check, and ensure Firestore/Auth security rules are properly locked down.

---

### 3. No API Route Authentication
**All API routes** under `/api/` have **zero authentication checks**. Even if middleware is re-enabled, it explicitly exempts `/api/` routes:

```typescript
if (!session && !path.startsWith('/login') && !path.startsWith('/api/')) {
```

This means anyone can `curl` your API and:
- Read all partners: `GET /api/partners`
- Delete any partner: `DELETE /api/partners/[id]`
- Delete any task: `DELETE /api/actions/[id]`
- Import fake data: `POST /api/partners/import`

> [!CAUTION]
> Every API route needs server-side auth verification (not just cookie check — verify Firebase ID token).

---

### 4. Schema Mismatch: SQLite vs PostgreSQL
**File**: [schema.prisma](file:///Users/hadya/Desktop/Projects/LeadForce/prisma/schema.prisma#L8-L12)

The schema declares PostgreSQL:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

But [.env](file:///Users/hadya/Desktop/Projects/LeadForce/.env#L8) has a SQLite connection string:
```
DATABASE_URL="file:./dev.db"
```

And there's a `dev.db` file in both root and `/prisma`. This will break on any `prisma migrate` or deploy. The comment on line 19 says "SQLite does not support native enums" — suggesting the actual database is SQLite despite the schema saying PostgreSQL.

---

### 5. Partner PATCH Endpoint Accepts Arbitrary Fields
**File**: [/api/partners/[id]/route.ts](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/api/partners/%5Bid%5D/route.ts#L31-L34)

```typescript
const partner = await prisma.partner.update({
  where: { id: resolvedParams.id },
  data: { ...body, lastActivityAt: new Date() }
});
```

Spreading `...body` directly into Prisma means a malicious user can set **any field** — including `id`, `createdAt`, or inject unexpected properties. There is no input validation or field whitelisting on any API route.

---

## 🟠 Important Improvements

### 6. Dashboard Auto-Seeds on Every Page Load
**File**: [page.tsx (dashboard)](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/page.tsx#L10-L24)

Every single dashboard visit runs:
```typescript
const productCount = await prisma.product.count();
if (productCount === 0) { /* seed 8 products */ }
```

This adds an unnecessary query on every page load. Product seeding should be done in a migration/seed script (which already exists at `prisma/seed.ts`), not in a page component.

---

### 7. Hardcoded/Fake Data in Reports
**File**: [reports/page.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/reports/page.tsx)

| Element | Line | Issue |
|---|---|---|
| Conversion rate "24.8%" | L45 | Hardcoded, not calculated |
| Revenue "$1.2M" | L50 | Hardcoded |
| Trend "+2.1%" / "-0.4%" | L46, L51 | Hardcoded |
| Weekly engagement bar chart | L84-92 | Hardcoded heights (60%, 100%, etc.) |
| "Q3 FY24" timeframe | L59 | Hardcoded, stale |
| Stagnant pipeline alert text | L141 | Hardcoded "3 deals" |

The pipeline funnel counts are real (dynamically queried), but everything else is static. The Filter button is non-functional.

---

### 8. Dashboard Trend is Hardcoded
**File**: [page.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/page.tsx#L69)

```jsx
<span className={styles.trendUp}>+12%</span>
```

This is hardcoded and misleading. There's no historical data tracking to compute actual trends.

---

### 9. Tasks Page is Non-Interactive
**File**: [tasks/page.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/tasks/page.tsx)

The tasks page is a **server-rendered, read-only list**. Tasks cannot be:
- ✅ Completed (no checkbox interaction — just static icons)
- ❌ Deleted
- ❌ Created from the tasks page
- ❌ Filtered by date/partner/status

Compare this with the partner detail page where `TaskItemClient` provides full CRUD. The global tasks page should have the same interactivity.

---

### 10. No Partner Deletion UI
While `DELETE /api/partners/[id]` exists, there's **no button or UI flow** to delete a partner. Users cannot remove duplicates or erroneous imports.

---

### 11. No Partner Edit Form
There's no way to edit a partner's company name, contact email, phone, source, or industry after creation. The only editable field on the partner detail page is the `overallStage` dropdown.

---

### 12. File Upload Not Used Anywhere in UI
The `Document` model exists in the schema, and there's a fully working [upload API](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/api/upload/route.ts), but **no UI component** renders an upload button or displays uploaded documents.

---

### 13. No Task Creation UI
There is a POST `/api/actions` endpoint for creating tasks, but the only way to create tasks is:
- Manually via API call
- Indirectly through AI extraction from notes

There's **no "Add Task" form** on the partner detail page or the tasks page.

---

### 14. `any` Types Used Extensively
**Files**: All client components use `any` types:
- `ContactInfoClient.tsx`: `partner: any`
- `ProductManagerClient.tsx`: `currentProducts: any[]`, `allProducts: any[]`
- `TaskItemClient.tsx`: `task: any`
- `ImportPartnersPage`: `previewData: any[]`

This eliminates TypeScript's safety guarantees entirely.

---

### 15. Local File Storage Not Production-Ready
**File**: [upload/route.ts](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/api/upload/route.ts#L19-L27)

Files are written to `public/uploads/` on the local filesystem. This won't work on serverless platforms (Vercel, etc.) where the filesystem is ephemeral. Should use cloud storage (S3, Firebase Storage, etc.).

---

### 16. No Error Boundaries or Loading States
- No `error.tsx` files for graceful error handling
- No `loading.tsx` files for Suspense boundaries
- No `not-found.tsx` at root level
- When API calls fail, errors are only `console.error`'d with no user-facing feedback (except in the new partner form which uses `alert()`)

---

## 🟡 Code Quality & DX

### 17. Inline Styles Everywhere
Several components use extensive inline styles instead of CSS modules:
- [ContactInfoClient.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/components/ContactInfoClient.tsx) — Entirely inline-styled
- [ProductManagerClient.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/components/ProductManagerClient.tsx) — Entirely inline-styled
- [QuickLogClient.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/components/QuickLogClient.tsx) — Entirely inline-styled
- [import/page.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/partners/import/page.tsx) — Partially inline-styled

This breaks the design system consistency and makes maintenance harder.

### 18. Prisma Logging in Production
**File**: [prisma.ts](file:///Users/hadya/Desktop/Projects/LeadForce/src/lib/prisma.ts#L8)
```typescript
new PrismaClient({ log: ['query'] })
```
Query logging is enabled unconditionally. This should be dev-only.

### 19. README is Default Next.js Boilerplate
The [README.md](file:///Users/hadya/Desktop/Projects/LeadForce/README.md) is the untouched `create-next-app` template. It should document LeadForce-specific setup, features, and deployment.

### 20. `suppressHydrationWarning` in Layout
**File**: [layout.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/app/layout.tsx#L20)

This masks potential hydration mismatches rather than fixing them. Usually a sign of underlying issues.

### 21. Navigation Active State Bug
**File**: [Navigation.tsx](file:///Users/hadya/Desktop/Projects/LeadForce/src/components/Navigation.tsx#L21)
```typescript
const isActive = pathname === item.href;
```
Uses strict equality, so `/partners/abc123` won't highlight the "PARTNERS" nav item. Should use `pathname.startsWith(item.href)` (with special handling for `/`).

---

## 🟢 New Features to Implement

### Tier 1 — Essential (Must-Have for Production)

| # | Feature | Description |
|---|---|---|
| **F1** | **Proper Auth System** | Re-enable middleware, verify Firebase ID tokens server-side on all API routes, add role-based access (Admin/BD Manager/BD Rep) |
| **F2** | **User Management** | Track which user creates/modifies records, assign tasks to specific users, user profile/avatar |
| **F3** | **Partner Edit Form** | Full edit page for partner details (company name, contact info, industry, source) |
| **F4** | **Partner Delete with Confirmation** | Delete button on partner detail page with modal confirmation |
| **F5** | **Task Creation Form** | "Add Task" button on both the partner detail and global tasks page — modal with description, due date, partner selector |
| **F6** | **Document Upload & Viewer** | File upload button on partner detail page, document list, preview/download capabilities |
| **F7** | **Search & Global Filter** | Search bar in the header to search partners by name, contact, or industry across the entire app |

### Tier 2 — High Value (Differentiation Features)

| # | Feature | Description |
|---|---|---|
| **F8** | **Real Reports & Analytics** | Replace hardcoded stats with actual calculated metrics: conversion rates, pipeline velocity over time, actual weekly activity counts |
| **F9** | **Kanban/Drag-Drop Pipeline** | Visual drag-and-drop pipeline board view (Discovery → Scope → Commitment → Contracting → Delivery) |
| **F10** | **Notifications & Reminders** | Push/email notifications for overdue tasks, upcoming deadlines, stagnant deals (14+ days no activity) |
| **F11** | **Export to Excel** | Bulk export partners/reports to .xlsx (the reverse of the existing import) |
| **F12** | **Partner Detail Tabs** | Tabbed interface on partner detail (Overview, Tasks, Timeline, Documents, Products) instead of one long scroll |
| **F13** | **Audit Log with User Attribution** | Track which user performed each action (currently all system events are anonymous) |
| **F14** | **Bulk Actions on Partners List** | Multi-select partners for bulk stage change, bulk delete, bulk assign |

### Tier 3 — Advanced (Competitive Edge)

| # | Feature | Description |
|---|---|---|
| **F15** | **AI Deal Insights** | Use Gemini to analyze all notes/history for a partner and generate a summary brief (deal health, risks, next steps) |
| **F16** | **Calendar View** | Visual calendar showing all tasks/follow-ups across all partners |
| **F17** | **Email Integration** | Log emails sent to contacts directly from LeadForce (or at minimum, a "Log Call/Meeting" feature) |
| **F18** | **Dashboard Widgets/Customization** | Configurable dashboard — users choose which cards/widgets to display |
| **F19** | **Dark Mode** | Full dark theme support using CSS custom properties (your token system makes this easy) |
| **F20** | **PWA Support** | Service worker, manifest, offline caching for field use |
| **F21** | **Multi-Tenant / Team Support** | Separate BD teams with their own pipeline views, team-level reports |
| **F22** | **Deal Value Tracking** | Estimated deal value per partner, weighted pipeline value in reports |
| **F23** | **Duplicate Detection** | On import and manual creation, detect potential duplicates by company name similarity |

---

## Priority Roadmap

```mermaid
gantt
    title LeadForce Priority Roadmap
    dateFormat  YYYY-MM-DD
    section Critical Fixes
    Re-enable Auth + API Protection     :crit, 2026-04-26, 2d
    Fix Schema (SQLite vs PG)           :crit, 2026-04-26, 1d
    Input Validation on All APIs        :crit, 2026-04-27, 2d
    Remove Hardcoded Dashboard Trend    :2026-04-27, 1d
    section Core Features
    Partner Edit Form                   :2026-04-28, 2d
    Partner Delete UI                   :2026-04-28, 1d
    Task Creation Form                  :2026-04-29, 2d
    Document Upload UI                  :2026-04-30, 2d
    Global Search                       :2026-05-01, 2d
    section High Value
    Real Reports & Analytics            :2026-05-02, 3d
    Interactive Tasks Page              :2026-05-02, 2d
    Export to Excel                     :2026-05-04, 1d
    Kanban Pipeline View                :2026-05-05, 3d
    section Polish
    Navigation Active State Fix         :2026-05-05, 1d
    Loading/Error States                :2026-05-05, 1d
    TypeScript Strict Types             :2026-05-06, 2d
    Move Inline Styles to CSS Modules   :2026-05-06, 2d
```

---

## Summary Stats

| Metric | Value |
|---|---|
| Total source files reviewed | 35 |
| Critical security issues | 5 |
| Improvement points | 16 |
| New features proposed | 23 |
| Lines of code (approx.) | ~3,200 |
| API endpoints | 12 |
| React components | 10 |
| Pages/Routes | 7 |
