# Biotra — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CDN (Lovable)                     │
│              Static assets, preview URLs             │
├─────────────────────────────────────────────────────┤
│                                                     │
│    ┌──────────────┐        ┌──────────────────┐    │
│    │   Frontend    │───────▶│   Supabase API   │    │
│    │  React + Vite │        │   (REST + RPC)   │    │
│    └──────────────┘        └────────┬─────────┘    │
│                                     │               │
│                            ┌────────▼─────────┐    │
│                            │   PostgreSQL DB   │    │
│                            │   (8 tables)      │    │
│                            └────────┬─────────┘    │
│                                     │               │
│    ┌──────────────┐        ┌────────▼─────────┐    │
│    │ Edge Functions│        │   File Storage   │    │
│    │ (Deno runtime)│        │  (user-uploads)  │    │
│    └──────────────┘        └──────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture
- **Framework**: React 18 + TypeScript
- **Build**: Vite (fast HMR, optimized builds)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Zustand (authStore, linksStore, appearanceStore, catalogStore)
- **Routing**: React Router v6 (nested routes, protected routes)
- **Animation**: Framer Motion
- **Charts**: Recharts

## Backend Architecture (Lovable Cloud / Supabase)
- **Database**: PostgreSQL with Row-Level Security
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (user-uploads bucket, public)
- **Edge Functions**: Deno-based serverless functions
  - `contact-notify` — Email on new contact messages
  - `order-notify` — Email on new orders
  - `low-stock-notify` — Low stock alerts
  - `generate-background` — AI background generation

## Data Flow

```
User Browser
    │
    ▼
React App (SPA)
    │
    ├──▶ Supabase Client SDK
    │       │
    │       ├──▶ Auth API (login/register/session)
    │       ├──▶ Database API (CRUD with RLS)
    │       ├──▶ Storage API (file uploads)
    │       └──▶ Edge Functions (server logic)
    │
    └──▶ Direct renders (no SSR)
```

## Database Architecture
- 8 tables with RLS policies
- UUID primary keys throughout
- Automatic `updated_at` triggers
- `handle_new_user` trigger creates profile + appearance on signup
- `increment_link_clicks` RPC for atomic click counting
- `decrement_stock_on_order` trigger for inventory management

## Authentication Flow
1. User registers → `handle_new_user` trigger fires
2. Profile + appearance_settings rows auto-created
3. Session managed via Supabase Auth (JWT tokens)
4. RLS policies enforce data isolation per user
5. Admin role stored in profiles.role field

## Security Layers
- Row-Level Security on all tables
- SECURITY DEFINER functions for cross-table operations
- Public read policies only for active profiles and enabled items
- No anonymous signups
- Input validation via Zod schemas

