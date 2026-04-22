# Biotra: Complete Project Documentation

## 1. Project Overview
**Biotra** is a premium "Link-in-Bio" platform designed for high-end creators, influencers, and businesses. It enables users to create aesthetic, mobile-optimized personal landing pages that aggregate social links, product catalogs, and custom content with a focus on world-class design and AI-driven customization.

---

## 2. Technical Stack
- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons), Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for avatars and backgrounds)
- **State Management**: Zustand (Global stores for Auth, Appearance, Links, Catalog)
- **AI Integration**: Gemini API (via Supabase Edge Functions) for AI Theme Generation

---

## 3. System Architecture & Modules

### A. Public Site
- **Homepage**: Marketing landing page detailing features and benefits.
- **Auth Module**: Registration, Login, and Password Recovery flows.
- **Public Profile (`/p/:username`)**: The public-facing landing page for users, featuring:
  - Dynamic backgrounds (Gradients, Photos, Animations).
  - Avatar and Biography.
  - Social & Custom Link Cards.
  - Product Catalog integration.
  - "Verified" badge and premium UI elements.

### B. Creator Dashboard (`/dashboard`)
The central hub for user management.
- **Dashboard Overview**: Key metrics (Link clicks, views) and quick status summaries.
- **Link Editor**: 
  - CRUD operations for links.
  - Toggle visibility, drag-and-drop reordering.
  - Platform-specific iconography.
- **Appearance Engine** (The core visual module):
  - **Themes**: Curated, high-end design presets.
  - **Templates**: Niche-specific layouts (Fashion, Tech, Gaming, etc.).
  - **Custom Designer**: Per-pixel control over colors, fonts, button styles (Rounded, Pill, Square, Outline, Shadow), and motion effects.
  - **AI Theme Creator**: 
    - Text-to-Theme generation.
    - Image-to-Theme syncing.
    - Music-to-Theme mood generation.
- **Catalog Module**: 
  - Manage products or services for sale on the profile.
  - Integration with orders and customer messaging.
- **Analytics**: Performance tracking for profile engagement.
- **Settings**: Personal account management and integration settings.

### C. Admin Dashboard (`/admin`)
Reserved for platform operators.
- **User Management**: Edit, suspend, or promote users.
- **Platform Settings**: Manage global configurations and feature flags.
- **System Stats**: High-level platform health monitoring.

---

## 4. Feature Roles

| Role | Permissions | Primary Goal |
| :--- | :--- | :--- |
| **Visitor** | View public profiles, Click links, Browse catalog. | Engagement with creator content. |
| **Creator** | Access Dashboard, Create/Edit Profile, Use AI Tools, Manage Orders. | Branding and conversion. |
| **Admin** | Access Admin Panel, Manage all Users, Global Settings. | Platform maintenance & moderation. |

---

## 5. Core User Flows

### I. Onboarding Flow
1. **Landing Page** → **Register** → **User Creation**.
2. **Setup Wizard** (Optional) → **Profile Creation**.
3. **Claim Username** → Unique URL allocation (`biotra.cc/p/user`).

### II. Content Management Flow
1. **Link Editor** → **Add New Link** → **Define Title/URL** → **Select Icon**.
2. **Toggle Visibility** → Immediate sync via Supabase.
3. **Link Sorting** → Real-time persistence of order.

### III. Aesthetic Customization Flow (Theme Design)
1. **Appearance Page** → **Choose Theme Preset** OR **AI Generate**.
2. **System Prompt** → Gemini AI generates Palette + Font + Button Style.
3. **Live Preview** → User examines changes in a mobile mockup.
4. **Publish** → Syncs to Public Profile via `appearanceStore`.

### IV. Commerce Flow
1. **Catalog** → **Add Product** → **Set Price & Image**.
2. **Public Profile** → **Visitor clicks Product** → **Purchase/Inquiry**.
3. **Creator Dashboard** → **Orders Page** → **Fulfillment**.

---

## 6. Recent UI/UX Improvements

### Appearance Page Upgrades
- **Unified Theme Discovery**: Consolidated category filters into a high-impact horizontal chip row. Removed redundant dropdowns for a cleaner UI.
- **Button Sizing Standard**: Shifted from fragile `10px` text to professional `12px/13px` typography across selectors.
- **ButtonStylePicker**: Redesigned to feature larger, clearer previews and bolder styling.
- **Template Gallery**: Synchronized selection chips and card typography with the premium Theme design system.
- **Color Picker Section**: Upgraded with larger swatches and improved text legibility for a developer-grade experience.

### Technical Bug Fixes
- **Live Sync**: Resolved issues where selected themes/animations were not appearing correctly on the public URL.
- **Animation Sync**: Background animations are now truly dynamic and correctly synchronized with the user's selected appearance settings.
- **Mobile Preview**: Fixed visibility and scrolling behavior to ensure a constant real-time feedback loop for creators.

---

## 7. Internal Data Stores (Zustand)
- **`authStore`**: Manages user session and profile data.
- **`appearanceStore`**: Manages all visual settings (hex codes, themes, backgrounds).
- **`linksStore`**: Handles the array of links and their states.
- **`catalogStore`**: Manages product inventory and categories.
- **`platformStore`**: Handles global UI states (e.g., mobile preview toggle).

---

## 8. Developer Guidelines
- **UI Consistency**: Always use tokens from `tailwind.config.ts` and components from the `@/components/ui` directory.
- **Responsiveness**: All features MUST be mobile-first, ensuring parity between the Dashboard and the Public Profile.
- **State Updates**: Prefer pessimistic updates (wait for Supabase) for critical data, and optimistic updates for UI-heavy tasks like sorting.
