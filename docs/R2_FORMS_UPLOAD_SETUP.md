# R2 Forms Upload Setup (Vercel + Supabase)

This project now supports signed file uploads to Cloudflare R2 and stores file metadata in Supabase (`public.form_uploads`).

## 1) Required environment variables

Set these in Vercel (Project Settings -> Environment Variables) and backend local `.env`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL` (optional custom CDN/public domain URL)
- `FORM_UPLOAD_MAX_BYTES` (optional, default `10485760` = 10 MB)

Backend already uses:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## 2) Apply Supabase migration

Run your migration flow so this table exists:

- `supabase/migrations/20260409093000_create_form_uploads.sql`

## 3) API endpoints

Authenticated creator endpoints:

- `POST /api/v1/forms/uploads/sign-url`
- `POST /api/v1/forms/uploads/complete`

Both require `Authorization: Bearer <supabase_access_token>`.

## 4) Frontend helper

Use:

- `src/lib/formUploads.ts`
- `uploadFormFileToR2({ file, fieldId, formId?, submissionId? })`

This helper:

1. asks backend for signed URL
2. uploads file directly to R2
3. saves metadata to `public.form_uploads`

## Notes

- This upload flow is for authenticated dashboard usage.
- Public/anonymous respondent upload can be added in phase 2 with signed form tokens + stricter limits.
