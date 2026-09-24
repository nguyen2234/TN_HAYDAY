# ARCHITECTURE.md

Architectural reference for the **admin-dashboard-template** repository. The repository source code is the single source of truth; anything not evidenced by the code is marked accordingly.

---

## 1. Project Identification

| Field | Value |
| --- | --- |
| Project Name | admin-dashboard-template |
| Repository URL | Initialize your own remote (e.g. `git remote add origin <url>`); the working copy is a git repository with a baseline history. |
| Primary Team | Your team — set when the repository is published. |
| Date of Last Update | 2026-08-23 |

---

## 2. Architecture Style

The application is a **client-side rendered Single Page Application (SPA)** organized in a **feature-module / layered** structure. There is no server, no backend services, and no microservices — all data is served by an in-browser mock layer (MSW). Evidence:

- `src/main.tsx` bootstraps a React app directly into `#root`; no server framework is present. It also initializes monitoring (see section 6).
- `src/mocks/` provides the entire API surface via Mock Service Worker.
- Layers are separated: `pages/` (routing/screens) → `components/` (UI) → `features/` (state + API) → `lib/` (data access) → `mocks/` (mock backend).

Classification: **Modular Frontend Monolith (SPA)**. Not event-driven, not microservices, not serverless.

---

## 3. Project Structure

```text
admin-dashboard-template/
├── public/
│   ├── mockServiceWorker.js     # MSW service worker (mock API in the browser)
│   └── favicon.svg
├── src/
│   ├── main.tsx                 # App bootstrap; starts MSW unless a backend URL is set
│   ├── app/
│   │   ├── app.tsx              # Root component → AppRouter
│   │   ├── providers.tsx        # React Query, Router, Theme, Auth, Tenant, I18n, Toaster wiring
│   │   ├── router.tsx           # Route table (lazy routes + protected routes)
│   │   └── query-client.ts      # TanStack Query client configuration
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (button, card, dialog, alert, tabs, tooltip, ...)
│   │   ├── layout/              # AppShell, SidebarNav, Topbar, nav-items, nav-group-list, nav-icons
│   │   ├── shared/              # KPI cards, DataTable, DetailDrawer, Breadcrumbs, state panels, page header
│   │   ├── auth/                # RememberedAccount, PasswordSignInForm, OAuthButtons (login screen)
│   │   ├── mail/                # MailList, MailReader
│   │   ├── calendar/            # CalendarGrid
│   │   ├── users/               # UsersTable
│   │   └── settings/            # SettingsForm, AppearancePicker, LanguagePicker (user settings)
│   ├── features/
│   │   ├── auth/                # AuthProvider, auth-api (session + remembered account), protected-route
│   │   ├── tenants/             # TenantProvider, tenants-api (X-Tenant-Id scoping)
│   │   ├── i18n/                # i18n init, provider, locale bundles
│   │   ├── theme/               # ThemeProvider, theme-config
│   │   ├── overview/            # overview-api (dashboard data access)
│   │   ├── users/               # users-api
│   │   ├── settings/            # settings-api
│   │   ├── billing/             # billing-api (plans, subscription, invoices)
│   │   ├── analytics/           # analytics-api (funnel, channels, cohorts, mrr)
│   │   ├── team/                # team-api (members, invites, roles)
│   │   ├── notifications/       # notifications-api (read state)
│   │   ├── transactions/        # transactions-api (ledger)
│   │   ├── integrations/        # integrations-api (apps + api keys)
│   │   ├── support/             # support-api (tickets)
│   │   ├── mail/                # mail-api (folders, read state)
│   │   ├── calendar/            # calendar-api (month events)
│   │   └── profile/             # profile-api (identity + activity)
│   ├── lib/                     # http() fetch wrapper, cn() util, formatters, monitoring
│   ├── mocks/                   # MSW handlers, browser worker, mock data
│   ├── pages/                   # Route components (one per module + login + not-found)
│   ├── test/                    # Vitest setup, node MSW server, test-app, tests
│   ├── types/                   # Shared domain TypeScript types
│   └── styles.css               # Tailwind v4 entry + CSS theme variables
├── e2e/                        # Playwright specs (auth, navigation) + helpers
├── playwright.config.ts        # Playwright config (boots pnpm dev as webServer)
├── index.html                   # HTML shell; loads Google Fonts + /src/main.tsx
├── vite.config.ts               # Vite + Vitest + Tailwind + @/ path alias
├── tsconfig*.json               # Project-references TypeScript config
├── components.json              # shadcn/ui configuration
├── biome.json                   # Biome config (format + lint + import organization)
├── vercel.json                  # SPA rewrites for the static demo deployment
└── package.json                 # Scripts and dependencies
```

### 3.1 Information architecture

The navigation follows a strict three-level hierarchy — **Group › Section › Subsection** — and never goes deeper:

| Group (`navGroups`) | Contents |
| --- | --- |
| Dashboard | Overview, Analytics |
| Apps | Mail (▸ Inbox, Sent), Calendar, Notifications, Support, Integrations |
| Pages | People (▸ Users, Team), Finance (▸ Billing, Transactions), Profile, Authentication, Not found |
| UI Elements | UI Kit |
| Data & Charts | Tables, Charts |
| Settings | User settings, Workspace settings |

Rules that keep the IA scalable:

- `NavItem.children` models subsections; a section parent has **no `href`** — it expands/collapses only. Leaves always carry an `href`.
- `navLeafItems` flattens every routable destination for the ⌘K command palette; new pages appear there automatically once registered in `navGroups`.
- `resolveNavTrail(pathname)` resolves the longest matching route to `{ group, item, child }`; the AppShell uses it for `document.title`, and the `Breadcrumbs` component renders the same trail above every page header. Breadcrumbs are navigable: section crumbs link to their first child, the current page is non-link text with `aria-current="page"`.
- Sidebar sections start **collapsed** and auto-expand along the active trail; users can toggle sections freely (overrides persist until navigation re-evaluates the default). The scroll area hides its scrollbar until hover (`.sidebar-scroll` in `styles.css`) with fade masks top and bottom.
- RBAC filters whole subtrees: a section whose children are all restricted disappears (`filterNavGroupsByRole`).
- Adding a module = one entry in `navGroups` (+ optional children), an icon in `nav-icons.ts`, a lazy route, and nested `nav.*` i18n keys in all three locales. Nothing else moves.

### 3.2 Naming contract

| Artifact | Pattern | Example |
| --- | --- | --- |
| Route | `/app/<module>` | `/app/mail/sent` |
| Page component + file | `<Module>Page` in `src/pages/<module>-page.tsx` | `MailPage` / `mail-page.tsx` |
| Feature data access | `src/features/<module>/<module>-api.ts` | `features/mail/mail-api.ts` |
| Module components | `src/components/<module>/` | `components/mail/MailList` |
| Mock endpoint | `/api/<module>` in `src/mocks/handlers.ts` | `/api/mail?folder=inbox` |
| Nav label key | `nav.<module>` in all locale bundles | `nav.mailInbox` |

---

## 4. High-Level System Diagram

```text
[Browser]
   |
   |  GET /                (index.html → /src/main.tsx)
   v
[React SPA]
   |
    |-- AppProviders
    |     ├── QueryClientProvider (TanStack Query)
    |     ├── BrowserRouter (React Router v7)
    |     ├── I18nProvider (react-i18next; browser language detector)
    |     ├── ThemeProvider (localStorage-driven theme)
    |     ├── AuthProvider  (session + remembered account in localStorage; registers http auth)
    |     ├── TenantProvider (active tenant; X-Tenant-Id header)
    |     └── Toaster (sonner)
    |
    |-- AppRouter (lazy routes, grouped sidebar nav)
   |     ├── /login              → LoginPage (public)
   |     ├── /app/overview       → OverviewPage  (protected, Dashboard)
   |     ├── /app/analytics      → AnalyticsPage (protected, Dashboard)
   |     ├── /app/users          → UsersPage     (protected, Manage)
   |     ├── /app/team           → TeamPage       (protected, Manage)
   |     ├── /app/billing        → BillingPage    (protected, Manage)
   |     ├── /app/transactions   → TransactionsPage (protected, Manage)
   |     ├── /app/notifications  → NotificationsPage (protected, Engage)
   |     ├── /app/support        → SupportPage    (protected, Engage)
   |     ├── /app/integrations   → IntegrationsPage (protected, Engage)
    |     ├── /app/settings       → SettingsPage   (protected, Settings)
    |     ├── /app/settings/user → UserSettingsPage (protected, Settings; per-user personalization)
    |     └── *                   → NotFoundPage
   |
    |  API calls via lib/http.ts (fetch)
    v
[Mock Service Worker]  intercept  /api/*  requests
    |
    +--> /api/auth/session | login ({method,email}) | logout | refresh
    +--> /api/tenants
    +--> /api/dashboard/overview
    +--> /api/users
    +--> /api/settings
    |
    v
[In-memory mock state]  (src/mocks/handlers.ts + data.ts; resets per test)
```

No network backend exists. Every `/api/*` request is intercepted and served from in-memory mock state.

---

## 5. Core Components

| Name | Description | Technologies | Deployment |
| --- | --- | --- | --- |
| `AppProviders` | Composition root wiring React Query, Router, I18n, Theme, Auth, Tenant, and Toaster contexts. | React, TanStack Query, React Router | Bundled SPA |
| `AppRouter` | Declarative route table; lazy-loads pages; enforces `ProtectedRoute` + `RoleRoute` for `/app/*`. | React Router v7 | Bundled SPA |
| `AuthProvider` / `auth-api` | Client-side session state with access/refresh tokens; reads/writes session to `localStorage`; remembers the last signed-in account (`rememberedUserStorage`) on login/logout/expiry for the continue-as card; accepts `login({ redirectTo, method, email })` and honors `ProtectedRoute`'s redirect target; registers HTTP auth handlers; silently refreshes expired sessions. | React Context, `lib/http.ts` | Bundled SPA |
| `TenantProvider` / `tenants-api` | Holds the active tenant (persisted); scopes requests via `X-Tenant-Id`; invalidates queries on switch. Switched from the branded **ADMIN DASH** workspace switcher at the top of the left sidebar (`workspace-switcher.tsx`; logo-only when collapsed, and placed inside the mobile navigation dialog). | React Context, `lib/http.ts` | Bundled SPA |
| `I18nProvider` / `i18n` | `react-i18next` integration with `en`/`es`/`fr` bundles and a browser language detector. | react-i18next, i18next | Bundled SPA |
| `ProtectedRoute` | Guards `/app/*`; redirects unauthenticated users to `/login`. | React Router | Bundled SPA |
| `RoleRoute` / `lib/rbac` | Enforces client-side RBAC: `canAccess(role, allowed)` gates nav visibility and protected routes by `AppRole`. | React Router, React Context | Bundled SPA |
| `ErrorBoundary` | Global + route-level error boundary with a recoverable fallback (Try again / back to dashboard); reports caught errors to monitoring. | React | Bundled SPA |
| `lib/monitoring` | `initMonitoring` / `reportError` / `reportEvent`; lazily initializes Sentry when `VITE_SENTRY_DSN` is set, else console fallback; captures window errors/unhandled rejections. | @sentry/browser (optional) | Bundled SPA |
| `lib/notify` | Centralized toast helpers; all TanStack Query mutation errors surface via `notifyError`. | sonner | Bundled SPA |
| `ThemeProvider` / `theme-config` | Theme selection persisted in `localStorage`; sets `data-theme` on `<html>`. Four presets: Core Light, Midnight Ops, Sunset Ember, Forest Deep. Selected from the User Settings screen (`AppearancePicker`); the ⌘K palette keeps theme shortcuts. | React Context | Bundled SPA |
| `UserSettingsPage` (`/app/settings/user`) | Per-user personalization screen: appearance (palette radios with preview swatches), interface language, and read-only session identity from `AuthProvider`. Client-only preferences — no API surface; reachable from the Settings nav group and the avatar menu. | React Context, Tailwind | Bundled SPA |
| MSW Mock Layer (`src/mocks`) | Full fake API surface (`handlers.ts`, `browser.ts` worker, `data.ts`). | MSW v2 | Bundled, dev/test only |
| `lib/http.ts` | Thin `fetch` wrapper; attaches bearer token + `X-Tenant-Id`; on `401` refreshes once and retries; throws on non-2xx. | Fetch API | Bundled SPA |
| shadcn/ui primitives (`src/components/ui`) | Button, Card, Dialog, AlertDialog, DropdownMenu (+ CheckboxItem), Command, Input, Switch, Avatar, Badge, Label, Skeleton, Alert, Tabs, Tooltip. | Radix UI, cmdk, Tailwind, CVA | Bundled SPA |
| Pages (`src/pages`) | Login, Overview, Analytics, Users, Team, Billing, Transactions, Notifications, Support, Integrations, Settings, NotFound. | React, Recharts, RHF+Zod | Bundled SPA |
| `DataTable` / `DetailDrawer` | Reusable generic table (`data-table.tsx`) and right-side detail panel + `DefinitionList` (`detail-drawer.tsx`). The table is keyboard-operable (rows focusable, Enter/Space activates), sortable via `Column.sortValue` (`aria-sort` on headers), paginated client-side (default 10 rows/page) with a range footer, and exposes `getRowLabel` for row aria-labels. | React | Bundled SPA |
| `skeletons.tsx` | Layout-stable loading placeholders (`KpiGridSkeleton`, `TableSkeleton`, `ChartSkeleton`, `ListSkeleton`, `FormSkeleton`) mirroring final content dimensions; each announces "loading" via `role="status"` + sr-only text. Pages render skeletons instead of swapping in spinner panels, eliminating layout shift; all motion is disabled under `prefers-reduced-motion`. | React, Tailwind | Bundled SPA |
| `StatePanel` (retryable) | Loading/error panel; error variant accepts `onRetry`, wired to `query.refetch()` on every module page. | React | Bundled SPA |
| `ConfirmDialog` / `alert-dialog.tsx` | Confirmation primitive over Radix AlertDialog for destructive actions (team-member removal, API-key revoke). Pairs with sonner **Undo** toasts that run compensating mutations (re-invite / recreate key). | Radix AlertDialog, sonner | Bundled SPA |
| `CommandPalette` (`cmdk`) | `⌘K`/`Ctrl+K` command menu: fuzzy page navigation (RBAC-filtered), theme switching, sign-out. The topbar search field is its trigger button. | cmdk, Radix Dialog | Bundled SPA |
| Topbar notifications dropdown | Live unread badge + mark-as-read + view-all over the notifications query cache; replaced decorative bell/mail buttons. | TanStack Query, Radix DropdownMenu | Bundled SPA |
| `UsersTable` / `InviteUserDialog` | Roster with mobile card list + desktop grid; row actions open a profile drawer, resend invites (`POST /api/users/invite`), or toggle access with undo (`PATCH /api/users/:id`). Invite dialog uses RHF+Zod with inline errors. | RHF+Zod, Radix Dialog | Bundled SPA |
| Login screen (`login-page.tsx` + `components/auth`) | Centered auth card over a token-adaptive dot grid, modeled on modern SaaS re-auth flows: remembered-account panel with "Continue as \<name\>" (falls back to the seeded demo persona), "Switch or remove account" toggling an inline RHF+Zod email/password form, dashed "or sign in with" divider with mock Google/Apple buttons (`POST /api/auth/login` carrying `{method,email}`), and a help-center footer. Both modes are jest-axe checked. | React Context, RHF+Zod, Tailwind | Bundled SPA |
| Route announcements (`AppShell`) | On navigation: sets `document.title`, updates an `aria-live=polite` region ("X page loaded"), and moves focus to the page `<h1>` (`tabIndex=-1` in `PageHeader`). | React Router | Bundled SPA |
| Chart text alternatives | Every Recharts surface carries `role="img"` + descriptive `aria-label`; revenue/funnel/MRR charts add sr-only data tables so screen readers get equivalent data. | Recharts | Bundled SPA |
| `lib/download.ts` | Client-side CSV export helper used by roster/team/transaction export buttons. | Blob API | Bundled SPA |
| Vitest test harness (`src/test`) | Node MSW server, jsdom env, `renderApp` helper, routing + module smoke tests, and jest-axe accessibility checks across login/overview/users/transactions/settings/notifications. | Vitest, Testing Library, jest-axe | Test only |
| Playwright suite (`e2e/`) | Browser tests driving the running app (auth, routing, tenant, language, theme) plus a mobile viewport suite (390×844: grouped nav, roster cards, invite dialog, palette). | @playwright/test | E2E only |

---

## 6. Technologies

### Frontend
- React 19 + TypeScript 5 (strict, project references via `tsc -b`).
- Vite 6 (build/dev) with `@vitejs/plugin-react` and `@tailwindcss/vite`.
- React Router v7 (client-side routing).
- TanStack Query v5 (server-state caching) + React Query Devtools.
- Tailwind CSS v4 (CSS-first config in `src/styles.css`; no `tailwind.config.js`).
- shadcn/ui (style `new-york`, `rsc: false`) built on Radix UI primitives.
- React Hook Form + Zod (+ `@hookform/resolvers`) for forms/validation.
- Recharts (charts on the Overview page).
- sonner (toast notifications).
- lucide-react (icons).
- react-i18next + i18next + i18next-browser-languagedetector (internationalization).
- @sentry/browser (optional, loaded only when `VITE_SENTRY_DSN` is set).
- Biome (format + lint + import organization; replaces ESLint/Prettier).
- @playwright/test (end-to-end tests in `e2e/`).

### Backend
- None. The repository contains no server, API, or backend framework. The API is mocked entirely client-side by MSW.

### Data Stores
- No persistent/server data store. Data is in-memory mock state (`src/mocks/handlers.ts`), resettable per test.
- Browser `localStorage` is used for client-side session (`admin-dashboard-template:session`), theme (`admin-dashboard-theme`), language (`admin-dashboard-template:lang`), active tenant (`admin-dashboard-template:tenant`), and the remembered account (`admin-dashboard-template:last-user`). See section 9.

### Infrastructure
- None. No cloud provider, container, IaC, or orchestration files exist in the repository.

### Observability
- `src/lib/monitoring.ts` provides `initMonitoring`, `reportError`, and `reportEvent`. When `VITE_SENTRY_DSN` is set, it lazily imports and initializes `@sentry/browser` (environment tagged by `VITE_APP_ENV` or the Vite mode) and forwards exceptions/events; otherwise it falls back to `console.error` / `console.warn`. Global `error` and `unhandledrejection` listeners forward to the reporter, and the route `ErrorBoundary` reports caught render errors. There is no metrics/tracing pipeline beyond Sentry exception reporting.

---

## 7. External Integrations

| Service Name | Purpose | Integration Method |
| --- | --- | --- |
| Google Fonts | Loads `Fraunces` and `Manrope` typefaces for the UI. | `<link>` tags in `index.html` (no API key/auth). |

There are no backend, payment, auth-provider, or third-party SDK integrations. All `/api/*` traffic is intercepted locally by MSW.

---

## 8. Security

- **Authentication (mock):** A `Session` object (with `isAuthenticated`, `accessToken`, optional `refreshToken`, and `expiresAt`) is stored in `localStorage` under `admin-dashboard-template:session`. `AuthProvider` reads it on init; `ProtectedRoute` redirects to `/login` when absent/invalid. `lib/http.ts` sends `Authorization: Bearer <accessToken>` and, on a `401`, calls `POST /api/auth/refresh` once and retries the request; if refresh fails it triggers the `unauthorized` handler (redirect to `/login`). An expired session is silently refreshed on load. The last signed-in identity is also kept in `localStorage` under `admin-dashboard-template:last-user` (`{name,email}` only — display data for the continue-as card; no tokens) and can be cleared via "Remove saved account". This is a client-side mock only — there is no real credential verification or backend auth.
- **Authorization (client-side, mock):** Role strings exist in the `Session` (`Owner`/`Admin`/`Manager` — typed as `AppRole`) and `UserRecord` (`Owner`/`Admin`/`Support`/`Analyst`). RBAC is now enforced in the UI: `RoleRoute` redirects unauthorized roles away from gated `/app/*` routes, and `SidebarNav`/`Topbar` hide nav items the user's role cannot access (`canAccess`). This is a UI convenience only — real authorization must be enforced server-side when a backend is connected.
- **Transport:** `lib/http.ts` only adds JSON `Content-Type` headers; no tokens, signing, or encryption are applied. It optionally prefixes requests with `import.meta.env.VITE_API_BASE_URL` so a real backend can replace MSW.
- **Secrets management:** None present; no environment variables or secret files are used.
- **Security middleware:** None (no server). The only boundary is the client-side `ProtectedRoute`.

> Note: Because the app ships with mocked auth and a mocked API, the security posture is representative only and not production-ready.

---

## 9. Data Stores

### In-memory mock state
- **Type:** In-memory (module-level variables in `src/mocks/handlers.ts`).
- **Purpose:** Serves as the fake backend for sessions and settings; supports search filtering for users.
- **Key state:** `activeSession` (from `defaultSession`), `activeSettings` (from `settingsPayload`). Reset via `resetMockState()` (called in test `afterEach`).

### Browser `localStorage`
- **Type:** Client-side key-value storage.
- **Purpose:** Persists auth session and UI theme across reloads.
- **Keys / schemas:**
  - `admin-dashboard-template:session` → JSON `Session` (`{ user: {id,name,email,role,organization}, isAuthenticated }`).
  - `admin-dashboard-theme` → `ThemeId` string (`"oneui-ash"` default, or `"midnight-ops"`).
  - `admin-dashboard-template:lang` → active locale code (`"en"`, `"es"`, `"fr"`), written by the i18next detector when the user picks a language in User Settings.
  - `admin-dashboard-template:tenant` → JSON string with the active tenant id, written by `TenantProvider`.
  - `admin-dashboard-template:last-user` → JSON `{name,email}` of the last signed-in account, written by `AuthProvider`; drives the login screen's continue-as card ("Remove saved account" clears it).

No database, cache, object store, or queue is used.

---

## 10. Deployment

- **Build:** `pnpm build` runs `tsc -b` (typecheck via project references) then `vite build`, emitting static assets to `dist/`.
- **Serve:** `pnpm preview` serves the built `dist/`; `pnpm dev` runs the Vite dev server (auto-starting the MSW worker).
- **CI/CD:** A GitHub Actions pipeline (`.github/workflows/ci.yml`) runs typecheck (`tsc -b`), `biome ci`, `vitest`, `vite build`, and a separate `e2e` job that installs Chromium and runs the Playwright suite (`pnpm e2e`, which boots `pnpm dev` via the Playwright webServer).
- **Demo deployments:** Publishing a GitHub release triggers `Deploy Demo` (`.github/workflows/deploy-demo.yml`), which checks out the release tag and deploys it to Vercel production via `BetaHuhn/deploy-to-vercel-action` (repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). `vercel.json` rewrites all routes to `/index.html` so SPA deep links resolve on the static host; static assets are served before rewrites apply.
- **Infrastructure / hosting:** No Docker/Kubernetes/Terraform manifests present. The output is a static SPA that can be hosted on any static file host (Vercel, Netlify, S3+CloudFront, etc.).

---

## 11. Future Considerations

- The entire data and auth layer is mocked via MSW (`src/mocks/`). To become production-ready, a real backend must replace the `/api/*` handlers, and the client-side `localStorage` session model must be replaced with server-issued credentials (cookie/session/token) and real auth verification.
- `localStorage` is used to store the session; this is not secure for real credentials and should be reconsidered before production use.
- A real backend can be wired in without touching feature code: set `VITE_API_BASE_URL` (see `.env.example`) and implement the same `/api/*` paths the MSW handlers expose. MSW boots in every mode whenever that variable is unset (this keeps the public production demo interactive); with a base URL configured, requests go straight to it and the mock layer stays off.
- Client-side RBAC (nav gating + `RoleRoute`) is a UI convenience only; enforce authorization server-side on the real backend.
- Lint/format use Biome (`biome.json`): `pnpm lint` → `biome check`, `pnpm format` → `biome format --write .`; a Husky pre-commit runs `lint-staged` (Biome) on changed files. There are no TODO/FIXME markers or deprecated modules in the source.
- UX conventions introduced in the 0.4 overhaul are now part of the contract: skeleton-first loading (never swap full pages for spinners), retryable error panels, ConfirmDialog + Undo for destructive mutations, no decorative controls (every button must act), keyboard-operable tables with ≥44 px mobile touch targets, and WCAG 2.2 AA as the accessibility floor (jest-axe enforced in CI).
- IA roadmap (deferred modules from the 0.6 information-architecture rework): Chat and File Manager under **Apps**, a Register screen beside Login under **Pages ▸ Authentication**, and a dedicated 500 error page. The 3-level nav, breadcrumbs and command-palette flattening already support them without structural change.

No explicit roadmap or architectural debt (beyond the mock-backend substitution noted above) identified in repository analysis.

---

## 12. Glossary

| Term | Definition |
| --- | --- |
| SPA | Single Page Application — client-rendered app with no server-side routing. |
| MSW | Mock Service Worker — intercepts `fetch`/`XMLHttpRequest` to serve mock API responses in browser and Node. |
| shadcn/ui | Copy-in React component collection built on Radix UI; configured via `components.json` (style `new-york`). |
| Tailwind v4 CSS-first | Tailwind configuration expressed in CSS via `@import "tailwindcss"` rather than a JS config file. |
| TanStack Query | Async server-state data-fetching/caching library used for `/api/*` reads/writes. |
| RHF + Zod | React Hook Form paired with Zod schemas for typed form validation. |
| `@/` alias | Path alias (via Vite + `tsconfig`) mapping to `src/`. |
| Session | Client-side auth object persisted in `localStorage` under `admin-dashboard-template:session`; carries `accessToken`, optional `refreshToken`, `expiresAt`, and `isAuthenticated`. |
| RememberedUser | Display-only `{name,email}` of the last signed-in account, persisted under `admin-dashboard-template:last-user`; powers the login screen's continue-as card (demo fallback: `demoPersona`). |
| ThemeId | Identifier for a UI theme (`oneui-ash` default light, `midnight-ops` dark), persisted under `admin-dashboard-theme`. |
| Tenant | Workspace entity; the active tenant is persisted and sent as the `X-Tenant-Id` header on every request. |
| I18nProvider | `react-i18next` provider; locale bundles live in `src/features/i18n/locales/*.json`. |
| `monitoring` | `src/lib/monitoring.ts`: error/event reporting that activates Sentry when `VITE_SENTRY_DSN` is set. |
| ProtectedRoute | Route guard that redirects unauthenticated users to `/login`. |
| `http()` | Thin fetch wrapper in `src/lib/http.ts` that attaches the bearer token + `X-Tenant-Id`, retries once after a `401` refresh, and throws on non-2xx responses. |
| `renderApp` | Test helper in `src/test/test-app.tsx` that renders the app with a configurable router history. |
| `defaultSession` | Seed session fixture in `src/mocks/data.ts`, used to authenticate tests. |
| BillingPayload | Mock aggregate of `subscription` + `plans` + `invoices` served at `/api/billing`. |
| TeamMember | Roster entry with `role` (Owner/Admin/Member/Billing) and `status`; served at `/api/team`. |
| Transaction | Ledger entry (status succeeded/pending/failed/refunded, method card/ach/paypal) at `/api/transactions`. |
| Integration / ApiKey | Connected third-party app and programmatic key, served at `/api/integrations` and `/api/integrations/api-keys`. |
| Ticket | Support item with `priority` (low/medium/high/urgent) and `status` (open/pending/closed) at `/api/support/tickets`. |
| `DataTable` | Generic column-based table helper (`src/components/shared/data-table.tsx`) used by module pages. |
| `DetailDrawer` | Right-side detail panel + `DefinitionList` (`src/components/shared/detail-drawer.tsx`). |
