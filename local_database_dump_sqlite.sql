-- ==========================================
-- LIGHTWEIGHT SQLite DATABASE SCHEMA
-- For Local file flat storage with ZERO installs
-- ==========================================

-- 1. Profiles & Users
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    upi_id TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    last_login_at TEXT,
    notification_prefs TEXT DEFAULT '{}', -- Saved as JSON string
    social_links TEXT DEFAULT '{}',
    social_stats TEXT DEFAULT '{}',
    creator_metrics TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Digital Catalog Items
CREATE TABLE IF NOT EXISTS catalog_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    item_type TEXT NOT NULL,
    price REAL,
    price_label TEXT,
    image_url TEXT,
    external_url TEXT,
    location TEXT,
    schedule TEXT,
    duration TEXT,
    variants TEXT DEFAULT '[]',
    stock_quantity INTEGER,
    track_inventory INTEGER DEFAULT 0, -- 0=false, 1=true
    sort_order INTEGER DEFAULT 0,
    tags TEXT, -- comma separated
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 3. Catalog Analytics
CREATE TABLE IF NOT EXISTS catalog_analytics (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    item_id TEXT NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    profile_user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Catalog Orders
CREATE TABLE IF NOT EXISTS catalog_orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    item_id TEXT NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    profile_user_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    quantity INTEGER DEFAULT 1,
    selected_variant TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. QR Codes Module
CREATE TABLE IF NOT EXISTS qr_codes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'url',
    mode TEXT NOT NULL DEFAULT 'static',
    content TEXT NOT NULL,
    short_code TEXT UNIQUE,
    fg_color TEXT DEFAULT '#000000',
    bg_color TEXT DEFAULT '#ffffff',
    logo_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 6. Social/Dynamic Links
CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT,
    clicks INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 7. Appearance & Theming
CREATE TABLE IF NOT EXISTS appearance_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
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
    show_avatar INTEGER DEFAULT 1,
    links_tab_label TEXT,
    shop_tab_label TEXT,
    card_style TEXT,
    section_spacing TEXT,
    card_blur TEXT,
    animation_class TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 8. Platform Configurations
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    site_name TEXT NOT NULL DEFAULT 'LinkVertex',
    site_logo_url TEXT,
    ai_api_key TEXT,
    allow_registration INTEGER DEFAULT 1,
    default_theme_id TEXT NOT NULL DEFAULT 'default',
    enable_order_notifications INTEGER DEFAULT 1,
    enable_contact_notifications INTEGER DEFAULT 1,
    enable_low_stock_notifications INTEGER DEFAULT 1,
    notify_order_email TEXT,
    notify_contact_email TEXT,
    notify_low_stock_email TEXT,
    category_label_overrides TEXT,
    cta_label_overrides TEXT,
    item_type_label_overrides TEXT,
    checkout_step_labels TEXT,
    link_template_categories TEXT,
    theme_categories TEXT,
    theme_presets TEXT,
    niche_templates TEXT,
    demo_catalog_packs TEXT,
    feature_analytics INTEGER DEFAULT 1,
    feature_catalog INTEGER DEFAULT 1,
    feature_contact_form INTEGER DEFAULT 1,
    feature_social_links INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 9. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    profile_user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 11. Profile Visits Analytics
CREATE TABLE IF NOT EXISTS profile_views (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    profile_user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    referrer TEXT,
    country TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
