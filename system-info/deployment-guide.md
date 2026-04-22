# Biotra — Deployment Guide

## Platform
Biotra runs on **Lovable Cloud**, which provides:
- Automatic frontend deployment (React/Vite)
- Supabase backend (PostgreSQL + Auth + Storage + Edge Functions)
- CDN-backed preview and production URLs
- SSL certificates (automatic)

## Deployment Process

### Frontend
1. Changes are made in the Lovable editor
2. Vite builds the React app automatically
3. Preview URL updates instantly
4. Click "Publish" → "Update" to push to production URL

### Backend (Automatic)
- Database migrations execute immediately on creation
- Edge functions deploy automatically when saved
- No manual deployment step needed

## Environment Variables
Managed automatically by Lovable Cloud:
- `VITE_SUPABASE_URL` — Backend API endpoint
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Anon key for client SDK
- `VITE_SUPABASE_PROJECT_ID` — Project identifier

## Secrets (Edge Functions)
Configured via Lovable Cloud secrets manager:
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL` — Direct database connection
- `LOVABLE_API_KEY` — AI features
- `RESEND_API_KEY` — Email notifications

## Custom Domain
1. Go to Project → Settings → Domains
2. Add your domain (e.g., Biotra.com)
3. Configure DNS records as shown
4. SSL auto-provisioned

## Scaling
- Lovable Cloud auto-scales based on traffic
- Database instance can be upgraded in Settings → Cloud → Advanced
- Edge functions scale automatically (serverless)
- Storage uses S3-compatible infrastructure

## Backups
- Database: Automatic daily backups via Supabase
- Code: Git-based versioning via Lovable
- Storage: Managed by Supabase infrastructure

