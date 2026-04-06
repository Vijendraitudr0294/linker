-- ==========================================
-- STANDALONE OFFLINE DATABASE SCHEMA
-- For Local Postgres / Standalone Migrations
-- ==========================================

-- 1. Profiles & Users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT CURRENT_DATE,
    bio TEXT,
    upi_id TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP WITH TIME ZONE,
    notification_prefs JSONB DEFAULT '{}'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    social_stats JSONB DEFAULT '{}'::jsonb,
    creator_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Digital Catalog Items
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    item_type TEXT NOT NULL, -- product, service, booking
    price NUMERIC,
    price_label TEXT,
    image_url TEXT,
    external_url TEXT,
    location TEXT,
    schedule TEXT,
    duration TEXT,
    variants JSONB DEFAULT '[]'::jsonb,
    stock_quantity INTEGER,
    track_inventory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    tags TEXT[],
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Catalog Analytics
CREATE TABLE IF NOT EXISTS public.catalog_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    profile_user_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- view, click
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Catalog Orders
CREATE TABLE IF NOT EXISTS public.catalog_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    profile_user_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    quantity INTEGER DEFAULT 1,
    selected_variant TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. QR Codes Module
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'url',
    mode TEXT NOT NULL DEFAULT 'static',
    content TEXT NOT NULL,
    short_code TEXT UNIQUE,
    fg_color TEXT DEFAULT '#000000',
    bg_color TEXT DEFAULT '#ffffff',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Social/Dynamic Links
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT,
    clicks INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. Appearance & Theming
CREATE TABLE IF NOT EXISTS public.appearance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    theme_id TEXT NOT NULL DEFAULT 'default',
    background_color TEXT DEFAULT '#ffffff',
    background_image TEXT,
    background_overlay TEXT,
    animated_gradient TEXT,
    text_color TEXT DEFAULT '#000000',
    button_bg TEXT DEFAULT '#000000',
    button_text TEXT DEFAULT '#ffffff',
    button_style TEXT DEFAULT 'rounded',
    card_color TEXT DEFAULT '#ffffff',
    font_family TEXT DEFAULT 'Inter',
    gradient_from TEXT,
    gradient_to TEXT,
    hero_image TEXT,
    layout_type TEXT DEFAULT 'standard',
    show_avatar BOOLEAN DEFAULT true,
    links_tab_label TEXT,
    shop_tab_label TEXT,
    card_style TEXT,
    section_spacing TEXT,
    card_blur TEXT,
    animation_class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. Platform Configurations
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL DEFAULT 'LinkVertex',
    site_logo_url TEXT,
    ai_api_key TEXT,
    allow_registration BOOLEAN DEFAULT true,
    default_theme_id TEXT NOT NULL DEFAULT 'default',
    enable_order_notifications BOOLEAN DEFAULT true,
    enable_contact_notifications BOOLEAN DEFAULT true,
    enable_low_stock_notifications BOOLEAN DEFAULT true,
    notify_order_email TEXT,
    notify_contact_email TEXT,
    notify_low_stock_email TEXT,
    category_label_overrides JSONB,
    cta_label_overrides JSONB,
    item_type_label_overrides JSONB,
    checkout_step_labels JSONB,
    link_template_categories JSONB,
    theme_categories JSONB,
    theme_presets JSONB,
    niche_templates JSONB,
    demo_catalog_packs JSONB,
    feature_analytics BOOLEAN DEFAULT true,
    feature_catalog BOOLEAN DEFAULT true,
    feature_contact_form BOOLEAN DEFAULT true,
    feature_social_links BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 9. Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Profile Visits Analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    referrer TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
