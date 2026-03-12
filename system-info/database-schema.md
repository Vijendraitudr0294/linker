# LinkVertex — Database Schema

## Tables Overview

### profiles
Primary user data table. Auto-created on registration via `handle_new_user` trigger.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | — | Auth user reference |
| name | text | No | '' | Display name |
| username | text | No | — | Unique URL slug |
| email | text | No | '' | User email |
| bio | text | Yes | '' | Profile bio (160 char max) |
| avatar_url | text | Yes | '' | Profile photo URL |
| social_links | jsonb | Yes | '[]' | Social media icon links |
| upi_id | text | Yes | '' | UPI payment ID |
| role | text | No | 'user' | user or admin |
| status | text | No | 'active' | active or blocked |
| created_at | timestamptz | No | now() | — |
| updated_at | timestamptz | No | now() | — |

### links
User's bio page links.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| user_id | uuid | No | — |
| title | text | No | — |
| url | text | No | — |
| platform | text | No | 'website' |
| enabled | boolean | No | true |
| clicks | integer | No | 0 |
| sort_order | integer | No | 0 |
| created_at / updated_at | timestamptz | No | now() |

### appearance_settings
Theme and styling configuration per user.

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| user_id | uuid | — |
| theme_id | text | 'clean-white' |
| background_color | text | '#ffffff' |
| card_color | text | '#f8fafc' |
| text_color | text | '#1e293b' |
| button_style | text | 'rounded' |
| button_bg | text | '#1e293b' |
| button_text | text | '#ffffff' |
| gradient_from / gradient_to | text | null |
| font_family | text | 'Inter' |
| show_avatar | boolean | true |

### catalog_items
Products, services, and menu items.

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| user_id | uuid | — |
| title | text | — |
| description | text | '' |
| price | numeric | null |
| price_label | text | '' |
| image_url | text | '' |
| category | text | 'product' |
| item_type | text | 'physical' |
| tags | text[] | '{}' |
| external_url | text | '' |
| allow_order_form | boolean | false |
| variants | jsonb | '[]' |
| track_inventory | boolean | false |
| stock_quantity | integer | null |
| duration / location / schedule | text | '' |
| enabled | boolean | true |
| sort_order | integer | 0 |

### catalog_orders
Customer orders for catalog items.

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| item_id | uuid | — (FK → catalog_items) |
| profile_user_id | uuid | — |
| customer_name | text | — |
| customer_email | text | — |
| customer_phone | text | '' |
| quantity | integer | 1 |
| selected_variant | text | '' |
| notes | text | '' |
| status | text | 'pending' |
| created_at | timestamptz | now() |

### contact_messages, profile_views, catalog_analytics
Analytics and communication tables with similar uuid/timestamptz patterns.

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Active only (public) | Own user_id | Own user_id | ❌ |
| links | Enabled or owner | Own user_id | Own user_id | Own user_id |
| appearance_settings | Public (all) | Own user_id | Own user_id | ❌ |
| catalog_items | Enabled or owner | Own user_id | Own user_id | Own user_id |
| catalog_orders | Own profile_user_id | Anyone (public) | Own profile_user_id | Own profile_user_id |
| contact_messages | Own profile_user_id | Anyone (public) | Own profile_user_id | Own profile_user_id |
| profile_views | Own profile_user_id | Anyone (public) | ❌ | ❌ |
| catalog_analytics | Own profile_user_id | Anyone (public) | ❌ | ❌ |

## Database Functions
1. `handle_new_user()` — Trigger: creates profile + appearance on auth signup
2. `increment_link_clicks(link_id)` — RPC: atomic click counter
3. `decrement_stock_on_order()` — Trigger: reduces stock on order insert
4. `update_updated_at_column()` — Trigger: auto-updates `updated_at`

## Indexing Strategy
- Primary keys (UUID) auto-indexed
- `profiles.username` — unique index for URL lookups
- `profiles.user_id` — index for auth joins
- `links.user_id` + `sort_order` — composite for ordered link queries
- `catalog_items.user_id` + `enabled` — composite for public catalog
