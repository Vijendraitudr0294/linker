# Biotra — Credentials

## ⚠️ SECURITY NOTE
This file is for development/staging reference only.
Never commit production credentials to version control.

## Default Admin Account
- **Email**: admin@test.com
- **Password**: (set during registration)
- **Role**: admin (promoted via admin panel or database)

## Database
- **Type**: PostgreSQL (managed by Lovable Cloud)
- **Access**: Via Supabase client SDK or Lovable Cloud UI
- **Direct URL**: Available in SUPABASE_DB_URL secret

## API Keys
All API keys are managed through Lovable Cloud secrets:
- See `environment-variables.md` for the full list

## Storage
- **Bucket**: user-uploads (public)
- **Access**: Via Supabase Storage SDK
- **Max file size**: Configurable in Supabase settings

## First-Time Setup
1. Register at /register with email + password
2. Profile is auto-created by database trigger
3. To make a user admin: use the admin panel or update `profiles.role` to 'admin'

