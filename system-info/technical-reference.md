# LinkVertex — Complete Technical Reference

> **Last Updated**: March 2026  
> **Version**: 1.0  
> This document consolidates all technical details: tech stack, architecture, authentication flows, credentials, database schema, routing, and software design.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Software Architecture](#3-software-architecture)
4. [Authentication & Login Flow](#4-authentication--login-flow)
5. [Credentials & Accounts](#5-credentials--accounts)
6. [Database Schema](#6-database-schema)
7. [Routing Map](#7-routing-map)
8. [State Management](#8-state-management)
9. [Edge Functions](#9-edge-functions)
10. [Security Architecture](#10-security-architecture)
11. [File Structure](#11-file-structure)

---

## 1. Product Overview

**LinkVertex** is a Link-in-Bio SaaS platform that lets creators, businesses, and professionals build a micro-website combining links, catalogs, contact forms, and payments — all accessible via a single URL (`/p/username`).

**Core Capabilities:**
- Link management with platform detection
- 89+ themes (photo, animated gradient, custom colors)
- Product/service catalog with order forms
- Contact messaging with email notifications
- Analytics (views, clicks, orders, referrers)
- Admin dashboard with user management
- Dark mode toggle on public profiles

---

## 2. Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework (hooks, components) |
| TypeScript | — | Type safety across codebase |
| Vite | — | Build tool (fast HMR, ESM) |
| Tailwind CSS | — | Utility-first styling + design tokens |
| shadcn/ui | — | Accessible component library |
| Zustand | 5.x | Lightweight state management |
| React Router | v6.30 | SPA routing with nested layouts |
| Framer Motion | 12.x | Declarative animations |
| Recharts | 2.x | Dashboard charts |
| React Hook Form + Zod | — | Form handling + validation |
| TanStack Query | 5.x | Server state & caching |
| qrcode.react | 4.x | UPI payment QR generation |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|-----------|---------|
| PostgreSQL | Primary database (ACID, RLS, JSONB) |
| Supabase Auth | JWT-based email/password authentication |
| Supabase Storage | File uploads (user-uploads bucket, public) |
| Edge Functions (Deno) | Serverless backend logic |
| Row-Level Security | Database-level access control |
| Lovable AI | AI features (no API key needed) |

### Key Design Decisions

1. **Zustand over Redux** — Simpler API, no boilerplate, TypeScript-first
2. **shadcn/ui over Material UI** — Full control, smaller bundle, Tailwind-native
3. **Edge Functions over traditional API** — Auto-scaling, no server management
4. **RLS over middleware auth** — Database-level security, impossible to bypass
5. **Email/password only** — No OAuth providers (per product decision)

---

## 3. Software Architecture

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     CDN (Lovable)                        │
│               Static assets, preview URLs                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐          ┌──────────────────┐        │
│   │   Frontend    │─────────▶│   Supabase API   │        │
│   │ React + Vite  │          │  (REST + RPC)    │        │
│   │     SPA       │          └────────┬─────────┘        │
│   └──────────────┘                    │                  │
│                              ┌────────▼─────────┐        │
│                              │   PostgreSQL DB   │        │
│                              │   (11 tables)     │        │
│                              │   + RLS policies  │        │
│                              └────────┬─────────┘        │
│                                       │                  │
│   ┌──────────────┐          ┌────────▼─────────┐        │
│   │Edge Functions │          │  File Storage    │        │
│   │(Deno runtime) │          │ (user-uploads)   │        │
│   │ 5 functions   │          └──────────────────┘        │
│   └──────────────┘                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Browser
    │
    ▼
React SPA (Client-Side Rendering)
    │
    ├──▶ Supabase Client SDK
    │       ├──▶ Auth API      → login / register / session / JWT
    │       ├──▶ Database API  → CRUD with RLS enforcement
    │       ├──▶ Storage API   → avatar / background uploads
    │       └──▶ Edge Functions → notifications, AI generation
    │
    └──▶ Zustand Stores (client state)
            ├── authStore      → user session & profile
            ├── linksStore     → link CRUD & ordering
            ├── appearanceStore → theme & styling
            ├── catalogStore   → products & inventory
            └── platformStore  → admin settings
```

### Component Architecture

```
App.tsx
├── AppInit (auth initialization)
├── Public Pages
│   ├── Index (landing page)
│   ├── Login / Register / ForgotPassword
│   ├── AdminLogin (superadmin entry)
│   ├── PublicProfile (/p/:username)
│   └── Info Pages (privacy, terms, blog, etc.)
│
└── Protected Dashboard (ProtectedRoute wrapper)
    └── DashboardLayout (sidebar + outlet)
        ├── DashboardOverview (KPIs + quick start)
        ├── LinkEditor (link CRUD)
        ├── AppearancePage (theme customizer + live preview)
        ├── CatalogPage (product management)
        ├── OrdersPage (order management)
        ├── MessagesPage (contact messages)
        ├── AnalyticsPage (charts + metrics)
        ├── SettingsPage (profile settings)
        └── AdminPage (superadmin: user mgmt, platform settings)
```

---

## 4. Authentication & Login Flow

### Overview

- **Method**: Email + Password only (no OAuth/social login)
- **Provider**: Supabase Auth (JWT-based)
- **Session**: Persisted in localStorage, auto-refreshed
- **Roles**: `user`, `admin`, `superadmin` (stored in `profiles.role`)

### Registration Flow

```
User submits /register form
    │
    ▼
supabase.auth.signUp({ email, password, options: { data: { name, username } } })
    │
    ▼
Supabase creates auth.users entry
    │
    ▼
Database trigger `handle_new_user()` fires automatically
    │
    ├──▶ Creates `profiles` row (name, username, email, role='user', status='active')
    └──▶ Creates `appearance_settings` row (default theme: 'clean-white')
    │
    ▼
Frontend fetches profile via authStore.fetchProfile()
    │
    ▼
User redirected to /dashboard
```

**Key Details:**
- Username auto-generated from email prefix: `email.split("@")[0]`
- Profile name updated after trigger creates the row
- Email confirmation may be required (configurable)

### User Login Flow

```
User submits /login form
    │
    ▼
supabase.auth.signInWithPassword({ email, password })
    │
    ▼
JWT session returned & stored in localStorage
    │
    ▼
authStore.fetchProfile(user.id) loads profile from DB
    │
    ├── If profile.status === "blocked" → sign out + error
    └── If active → set authenticated state
    │
    ▼
Track last_login_at + log to user_activity_logs
    │
    ▼
Redirect to /dashboard
```

### Superadmin Login Flow

```
User submits /admin-login form
    │
    ▼
Same supabase.auth.signInWithPassword() call
    │
    ▼
After auth success → supabase.auth.getUser()
    │
    ▼
fetchProfile(user.id) → check profile.role
    │
    ├── If role === "superadmin" → redirect to /dashboard/admin
    └── If role !== "superadmin" → logout + "Access denied" error
```

**Superadmin check uses the `profiles.role` field in the database — NOT client-side storage.**

### Session Management

```typescript
// In authStore.initialize():
1. Set up onAuthStateChange listener (runs on every auth event)
2. Call getSession() to check existing session
3. If session exists → fetch profile → set authenticated
4. If no session → set loading = false
```

- Sessions auto-refresh via Supabase SDK
- `ProtectedRoute` component guards `/dashboard/*` routes
- Redirects to `/login` if not authenticated

### Password Reset Flow

```
User clicks "Forgot Password" on /login
    │
    ▼
/forgot-password page → enters email
    │
    ▼
supabase.auth.resetPasswordForEmail(email, { redirectTo })
    │
    ▼
User receives email → clicks link → lands on reset page
    │
    ▼
supabase.auth.updateUser({ password: newPassword })
```

### Logout Flow

```
User clicks logout
    │
    ▼
Log activity ("logout") to user_activity_logs
    │
    ▼
supabase.auth.signOut()
    │
    ▼
Clear authStore state (user=null, isAuthenticated=false)
    │
    ▼
Redirect to /login
```

---

## 5. Credentials & Accounts

### ⚠️ Security Note
This section is for **development/staging reference only**. Never commit production credentials.

### Test Accounts

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Super Admin | superadmin@linkvertex.com | Admin@123 | superadmin |
| Regular User | user@123.com | User@123 | user |
| Admin (default) | admin@test.com | (set at registration) | admin |

### Access Points

| Route | Purpose | Who Can Access |
|-------|---------|----------------|
| `/login` | Regular user login | Anyone |
| `/admin-login` | Superadmin login | Superadmin only |
| `/register` | New account creation | Anyone |
| `/dashboard` | User dashboard | Authenticated users |
| `/dashboard/admin` | Admin panel | admin/superadmin role |

### Infrastructure

- **Database**: PostgreSQL (managed by Lovable Cloud)
- **Storage Bucket**: `user-uploads` (public)
- **API Keys**: Managed via Lovable Cloud secrets
- **Region**: Asia Pacific

---

## 6. Database Schema

### Tables (11 total)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles, roles, status | ✅ |
| `links` | Bio page links | ✅ |
| `appearance_settings` | Theme & styling per user | ✅ |
| `catalog_items` | Products, services, menu items | ✅ |
| `catalog_orders` | Customer orders | ✅ |
| `catalog_analytics` | Item view/click tracking | ✅ |
| `contact_messages` | Visitor messages | ✅ |
| `profile_views` | Page view analytics | ✅ |
| `notifications` | In-app notifications | ✅ |
| `user_activity_logs` | Login/action audit trail | ✅ |
| `platform_settings` | Global admin settings | ✅ |

### Key Tables Detail

#### profiles
```sql
id              uuid PK
user_id         uuid (ref → auth.users)
name            text
username        text UNIQUE
email           text
bio             text
avatar_url      text
social_links    jsonb  -- [{platform, url}]
upi_id          text
role            text   -- 'user' | 'admin' | 'superadmin'
status          text   -- 'active' | 'blocked'
last_login_at   timestamptz
notification_prefs jsonb
created_at      timestamptz
updated_at      timestamptz
```

#### appearance_settings
```sql
id                uuid PK
user_id           uuid
theme_id          text (default: 'clean-white')
background_color  text
background_image  text
background_overlay text
card_color        text
text_color        text
button_style      text ('rounded'|'pill'|'square'|'outline'|'shadow')
button_bg         text
button_text       text
gradient_from     text
gradient_to       text
animated_gradient text
animation_class   text
font_family       text
show_avatar       boolean
hero_image        text
```

### Database Functions

| Function | Type | Purpose |
|----------|------|---------|
| `handle_new_user()` | Trigger | Auto-creates profile + appearance on signup |
| `increment_link_clicks(link_id)` | RPC | Atomic click counter |
| `decrement_stock_on_order()` | Trigger | Reduces stock on order insert |
| `update_updated_at_column()` | Trigger | Auto-updates `updated_at` |
| `is_admin(_user_id)` | Function | Check if user has admin role |
| `is_superadmin(_user_id)` | Function | Check if user has superadmin role |

### RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Active only (public) | Own user_id | Own user_id | ❌ |
| links | Enabled or owner | Own user_id | Own user_id | Own user_id |
| appearance_settings | Public (all) | Own user_id | Own user_id | ❌ |
| catalog_items | Enabled or owner | Own user_id | Own user_id | Own user_id |
| catalog_orders | Own profile_user_id | Anyone | Own profile_user_id | Own profile_user_id |
| contact_messages | Own profile_user_id | Anyone | Own profile_user_id | Own profile_user_id |
| profile_views | Own profile_user_id | Anyone | ❌ | ❌ |
| catalog_analytics | Own profile_user_id | Anyone | ❌ | ❌ |

---

## 7. Routing Map

### Public Routes (no auth required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Index | Marketing landing page |
| `/login` | Login | User login form |
| `/admin-login` | AdminLogin | Superadmin login form |
| `/register` | Register | Account registration |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/p/:username` | PublicProfile | Public bio page (iPhone mockup on desktop) |
| `/p/:username/services` | PublicServices | Public catalog/services page |
| `/privacy` | PrivacyPolicy | Legal page |
| `/terms` | TermsOfService | Legal page |
| `/cookies` | CookiePolicy | Legal page |
| `/blog` | Blog | Blog page |
| `/help` | HelpCenter | Help/FAQ page |
| `/api-docs` | ApiDocs | API documentation |
| `/status` | StatusPage | Service status |
| `/changelog` | Changelog | Release notes |

### Protected Routes (auth required via `ProtectedRoute`)

| Route | Component | Access |
|-------|-----------|--------|
| `/dashboard` | DashboardOverview | All authenticated users |
| `/dashboard/links` | LinkEditor | All users |
| `/dashboard/appearance` | AppearancePage | All users |
| `/dashboard/analytics` | AnalyticsPage | All users |
| `/dashboard/settings` | SettingsPage | All users |
| `/dashboard/messages` | MessagesPage | All users |
| `/dashboard/catalog` | CatalogPage | All users |
| `/dashboard/orders` | OrdersPage | All users |
| `/dashboard/admin` | AdminPage | Admin/Superadmin only |
| `/dashboard/admin/settings` | PlatformSettingsPage | Admin/Superadmin only |
| `/dashboard/admin/user/:userId` | AdminUserEditPage | Admin/Superadmin only |

---

## 8. State Management

### Zustand Stores

| Store | File | Key State |
|-------|------|-----------|
| `authStore` | `src/stores/authStore.ts` | user, isAuthenticated, loading |
| `linksStore` | `src/stores/linksStore.ts` | links array, CRUD methods |
| `appearanceStore` | `src/stores/appearanceStore.ts` | theme settings, colors, fonts |
| `catalogStore` | `src/stores/catalogStore.ts` | catalog items, CRUD |
| `platformStore` | `src/stores/platformStore.ts` | admin platform settings |

### Auth Store Methods

```typescript
initialize()     // Set up auth listener + check session
register(name, email, password) // Create account
login(email, password)          // Sign in
logout()                        // Sign out + clear state
updateProfile(data)             // Update profile fields
fetchProfile(userId)            // Load profile from DB
```

---

## 9. Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `contact-notify` | Contact form submit | Email notification to profile owner |
| `order-notify` | New order placed | Email notification to profile owner |
| `low-stock-notify` | Stock drops below threshold | Alert email |
| `generate-background` | AI theme creator | Generate background image via AI |
| `landing-chat` | Landing page chatbot | AI-powered chat responses |

All edge functions run on **Deno runtime** and are auto-deployed.

---

## 10. Security Architecture

### Layers

1. **Authentication** — Supabase Auth with JWT tokens
2. **Row-Level Security** — Every table has RLS policies
3. **SECURITY DEFINER functions** — `is_admin()`, `is_superadmin()` for cross-table checks
4. **Input Validation** — Zod schemas on frontend
5. **Blocked User Check** — Login rejects blocked accounts
6. **Activity Logging** — All logins/actions tracked in `user_activity_logs`
7. **No Anonymous Signups** — Registration requires email + password

### Admin Access Control

- Admin role checked via `profiles.role` field in database
- Superadmin login at `/admin-login` verifies role **server-side** (database query)
- `is_admin()` and `is_superadmin()` are SECURITY DEFINER functions (bypass RLS)
- Admin can: manage users, block/unblock, change roles, edit platform settings

---

## 11. File Structure

```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
├── index.css                  # Global styles + design tokens
│
├── components/
│   ├── ui/                    # shadcn/ui components (40+ files)
│   ├── landing/               # Landing page sections
│   ├── dashboard/             # Dashboard components
│   │   ├── DashboardLayout    # Sidebar + outlet
│   │   ├── ProfilePreview     # Phone mockup preview
│   │   ├── AIThemeCreator     # AI-powered theme generation
│   │   └── ...
│   ├── public/                # Public profile components
│   ├── ProtectedRoute.tsx     # Auth guard
│   ├── NavLink.tsx
│   └── SocialIcon.tsx
│
├── pages/
│   ├── Index.tsx              # Landing page
│   ├── Login.tsx / Register.tsx / AdminLogin.tsx
│   ├── PublicProfile.tsx      # /p/:username
│   └── dashboard/             # All dashboard pages
│
├── stores/                    # Zustand state stores
│   ├── authStore.ts
│   ├── linksStore.ts
│   ├── appearanceStore.ts
│   ├── catalogStore.ts
│   └── platformStore.ts
│
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities (validation, logging)
├── data/                      # Static data (themes, templates)
├── integrations/supabase/     # Auto-generated client + types
│
supabase/
├── config.toml                # Supabase project config
├── functions/                 # Edge functions (5)
│
system-info/                   # Documentation
├── product-prd.md
├── architecture.md
├── tech-stack.md
├── database-schema.md
├── credentials.md
├── technical-reference.md     # ← THIS FILE
└── ...
```

---

*End of Technical Reference*
