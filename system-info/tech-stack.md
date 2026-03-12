# LinkVertex — Tech Stack

## Frontend

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| React 18 | UI framework | Component model, ecosystem, hooks |
| TypeScript | Type safety | Catches bugs at compile time |
| Vite | Build tool | Fast HMR, optimized production builds |
| Tailwind CSS | Styling | Utility-first, design tokens, dark mode |
| shadcn/ui | Component library | Accessible, customizable, Tailwind-native |
| Zustand | State management | Lightweight, no boilerplate, TypeScript-first |
| React Router v6 | Routing | Nested routes, protected routes, params |
| Framer Motion | Animations | Declarative, performant, spring physics |
| Recharts | Charts | React-native, responsive, composable |
| Zod | Validation | Schema-based, TypeScript inference |
| React Hook Form | Forms | Performant, minimal re-renders |
| qrcode.react | QR codes | UPI payment QR generation |

## Backend (Lovable Cloud)

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| Supabase | BaaS platform | Auth + DB + Storage + Functions in one |
| PostgreSQL | Primary database | ACID, JSON support, RLS |
| Supabase Auth | Authentication | JWT-based, email/password, session mgmt |
| Supabase Storage | File storage | S3-compatible, public/private buckets |
| Edge Functions | Server logic | Deno runtime, auto-scaling, low latency |
| Row-Level Security | Data protection | Database-level access control |

## Infrastructure

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| Lovable Cloud | Hosting & deployment | Auto-deploy, preview URLs, CDN |
| Supabase CDN | API caching | Built-in with Supabase |
| Lovable AI | AI features | No API key required, multiple models |

## DevOps

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| Git (via Lovable) | Version control | Automatic versioning |
| Lovable Preview | Staging | Instant preview URLs |
| Supabase Migrations | DB versioning | SQL-based, ordered migrations |
| Vitest | Testing | Vite-native, fast, TypeScript |

## Key Design Decisions

1. **Zustand over Redux** — Simpler API, less boilerplate, perfect for this scale
2. **shadcn/ui over Material UI** — Full control, smaller bundle, Tailwind-native
3. **Edge Functions over traditional API** — Auto-scaling, no server management
4. **RLS over middleware auth** — Database-level security, impossible to bypass
5. **Vite over Webpack** — 10x faster builds, native ESM support
