# Biotra — API Documentation

## Authentication

All authenticated requests use Supabase JWT tokens via the `supabase-js` client SDK.

### Auth Endpoints (via Supabase Auth)
- `supabase.auth.signUp({ email, password, options: { data: { name, username } } })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signOut()`
- `supabase.auth.getUser()`
- `supabase.auth.resetPasswordForEmail(email)`

## Database API (via Supabase PostgREST)

### Profiles
```typescript
// Get profile by username (public)
supabase.from("profiles").select("*").eq("username", username).eq("status", "active").single()

// Update own profile
supabase.from("profiles").update({ name, bio, social_links }).eq("user_id", userId)
```

### Links
```typescript
// Get user's links
supabase.from("links").select("*").eq("user_id", userId).order("sort_order")

// Create link
supabase.from("links").insert({ user_id, title, url, platform })

// Update link
supabase.from("links").update({ title, url, enabled }).eq("id", linkId)

// Delete link
supabase.from("links").delete().eq("id", linkId)

// Track click (RPC)
supabase.rpc("increment_link_clicks", { link_id: linkId })
```

### Appearance
```typescript
// Get appearance (public)
supabase.from("appearance_settings").select("*").eq("user_id", userId).single()

// Update appearance
supabase.from("appearance_settings").update({ theme_id, background_color, ... }).eq("user_id", userId)
```

### Catalog
```typescript
// Get public catalog items
supabase.from("catalog_items").select("*").eq("user_id", userId).eq("enabled", true).order("sort_order")

// CRUD operations (authenticated, own items only)
supabase.from("catalog_items").insert({ user_id, title, price, ... })
supabase.from("catalog_items").update({ title, price }).eq("id", itemId)
supabase.from("catalog_items").delete().eq("id", itemId)
```

### Orders
```typescript
// Submit order (public)
supabase.from("catalog_orders").insert({ item_id, profile_user_id, customer_name, customer_email, quantity })

// View own orders
supabase.from("catalog_orders").select("*, catalog_items(title, price)").eq("profile_user_id", userId)

// Update order status
supabase.from("catalog_orders").update({ status }).eq("id", orderId)
```

## Edge Functions

### POST /contact-notify
Sends email notification when a contact message is received.
- Triggered manually or via webhook
- Uses Resend API (RESEND_API_KEY secret)

### POST /order-notify
Sends email notification when a new order is placed.
- Uses Resend API

### POST /low-stock-notify
Sends alerts for items below stock threshold.
- Called from dashboard

### POST /generate-background
AI-powered background image generation.
- Uses Lovable AI (LOVABLE_API_KEY secret)

## Storage API

### Bucket: user-uploads (public)
```typescript
// Upload file
supabase.storage.from("user-uploads").upload(`${userId}/${filename}`, file)

// Get public URL
supabase.storage.from("user-uploads").getPublicUrl(path)
```

