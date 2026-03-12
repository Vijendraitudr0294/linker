# LinkVertex — Environment Variables

## Frontend (Auto-configured)
These are set automatically by Lovable Cloud and should NOT be edited manually:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon key for client SDK |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

## Edge Function Secrets

| Secret | Description | Required For |
|--------|-------------|-------------|
| `SUPABASE_URL` | Backend API URL | All edge functions |
| `SUPABASE_ANON_KEY` | Anonymous API key | Public operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key | Server-side operations |
| `SUPABASE_DB_URL` | Direct database URL | Database queries |
| `LOVABLE_API_KEY` | Lovable AI access | AI background generation |
| `RESEND_API_KEY` | Resend email service | Email notifications |

## How to Add/Update Secrets
1. Open Lovable Cloud dashboard
2. Navigate to Secrets management
3. Add or update the secret value
4. Edge functions automatically pick up changes on next invocation

## Important Notes
- Never commit secrets to code
- The `.env` file is auto-generated — do not edit manually
- Publishable/anon keys are safe to expose in frontend code
- Service role keys must ONLY be used in edge functions
