# Software Architecture Document (SAD)

Generated: 2026-03-12T12:18:46.106Z

## System Overview
- **Purpose**: Biotra is a creator-focused link-in-bio platform that combines profile links, storefront/catalog listing, order capture, contact messaging, analytics, and visual theming in one SPA.
- **Core functionality**:
  - Public creator profile rendering with dynamic links, contact form, social stats, and themed visuals.
  - Embedded catalog/shop with item categories, item types, analytics tracking, cart, and multi-step checkout.
  - Authenticated creator dashboard for links, appearance, catalog, messages, orders, analytics, and profile settings.
  - Super-admin panel for user management, platform feature flags, notification routing, and global label configuration.
  - Edge-function-backed AI theme/background generation and transactional email notifications.
- **Technology stack**:
  - Frontend: React 18, TypeScript, Vite 5, React Router v6, Zustand, React Query, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Zod.
  - Backend/BaaS: Supabase (PostgreSQL + RLS, Auth, Storage, Realtime, RPC).
  - Serverless: Supabase Edge Functions (Deno).
  - External integrations: Lovable AI Gateway, Google Gemini API (fallback), Resend email API.

## Architectural Representation
- **Primary style**: Layered SPA architecture (Presentation -> State -> Integration) with feature-oriented modules.
- **Design patterns used**:
  - **Component-based UI**: React pages + reusable component composition.
  - **State store pattern**: Zustand stores encapsulate domain state and mutations (`auth`, `links`, `appearance`, `catalog`, `cart`, `platform`).
  - **BFF-less client-to-BaaS**: Frontend directly calls Supabase tables/RPC/storage under RLS policies.
  - **Serverless integration pattern**: edge functions for outbound side effects (email notifications, AI generation).
  - **Shared rendering contract**: `src/lib/profileRenderer.ts` provides parity utilities consumed by dashboard preview and public profile routes.
- **Logical layers**:
  - **Presentation layer**: `src/pages`, `src/components`.
  - **Application/state layer**: `src/stores`, `src/hooks`.
  - **Domain/utilities layer**: `src/lib`, `src/data`.
  - **Integration layer**: `src/integrations/supabase`, `supabase/functions`, SQL migrations.

## Component & Page Map
### Route Map
| Route | Component(s) | Primary Function |
|---|---|---|
| `/` | `Index` | Landing page |
| `/login` | `Login` | Creator login portal |
| `/admin-login` | `AdminLogin` | Super-admin login portal |
| `/register` | `Register` | Account registration |
| `/forgot-password` | `ForgotPassword` | Password reset request |
| `/p` | `PublicProfile` | Public profile (fallback route) |
| `/p/:username` | `PublicProfile` | Public profile by username |
| `/p/:username/services` | `PublicServices` | Public catalog/services page |
| `/dashboard` | `DashboardLayout + DashboardOverview` | Authenticated dashboard shell + overview |
| `/dashboard/links` | `LinkEditor` | Link CRUD and ordering |
| `/dashboard/appearance` | `AppearancePage` | Theme/design customization |
| `/dashboard/analytics` | `AnalyticsPage` | Performance analytics |
| `/dashboard/settings` | `SettingsPage` | Profile and account settings |
| `/dashboard/messages` | `MessagesPage` | Inbox for public contact messages |
| `/dashboard/catalog` | `CatalogPage` | Catalog item management |
| `/dashboard/orders` | `OrdersPage` | Order lifecycle management |
| `/dashboard/admin` | `AdminPage` | Super-admin user/platform monitoring |
| `/dashboard/admin/settings` | `PlatformSettingsPage` | Global platform controls |
| `/dashboard/admin/user/:userId` | `AdminUserEditPage` | Per-user admin edit console |
| `/privacy` | `PrivacyPolicy` | Legal policy page |
| `/terms` | `TermsOfService` | Legal policy page |
| `/cookies` | `CookiePolicy` | Legal policy page |
| `/blog` | `Blog` | Marketing blog page |
| `/help` | `HelpCenter` | Support/help center page |
| `/api-docs` | `ApiDocs` | Public API documentation page |
| `/status` | `StatusPage` | Public status/uptime page |
| `/changelog` | `Changelog` | Release notes page |
| `*` | `NotFound` | 404 fallback page |

### Major Module Map
| Module/Path | Primary Function |
|---|---|
| `src/components/dashboard/*` | Authenticated creator workspace components (editor, analytics, notifications, template/AI tooling). |
| `src/components/public/*` | Public storefront/profile interactions (catalog drawer, checkout, contact, cart footer). |
| `src/components/landing/*` | Landing/marketing sections with motion and chatbot widget. |
| `src/components/ui/*` | shadcn/Radix-based reusable primitives used across all screens. |
| `src/stores/*` | Zustand stores for auth/profile, links, appearance, catalog, cart, platform settings. |
| `src/lib/*` | Cross-cutting helpers for validation, rendering parity, activity logging, commerce label resolution. |
| `supabase/functions/*` | Serverless business integrations: email notifications and AI generation endpoints. |

## Data Flow & Interfaces
### End-to-End Data Movement
1. Browser loads SPA (`src/main.tsx` -> `src/App.tsx`) and initializes auth/session in `authStore.initialize`.
2. Route-level components request domain data through Zustand store actions or direct Supabase queries.
3. Supabase returns table data under RLS policies; stores normalize and publish state to UI components.
4. Public interactions (view/click/order/contact) write analytics/transaction rows and optionally invoke edge functions.
5. Edge functions call external services (Resend / Lovable AI / Gemini) and respond to client for UX feedback.

### Internal Interfaces (Stores / Domain APIs)
- `useAuthStore`: session bootstrap, register/login/logout, profile fetch/update.
- `useLinksStore`: link CRUD, ordering, click tracking (`increment_link_clicks` RPC).
- `useAppearanceStore`: theme/appearance fetch, update, apply preset workflow.
- `useCatalogStore`: catalog CRUD, inventory-aware item operations, bulk seed import.
- `useCartStore`: persistent cart state for public checkout (`zustand/persist`).
- `usePlatformStore`: global feature toggles + label overrides for platform/admin settings.

### Database Interfaces (Supabase)
- **Tables used**: `profiles`, `links`, `appearance_settings`, `contact_messages`, `catalog_items`, `catalog_orders`, `catalog_analytics`, `profile_views`, `notifications`, `platform_settings`, `user_activity_logs`.
- **RPC functions used**: `increment_link_clicks(link_id)`, `is_admin(_user_id)`, `is_superadmin(_user_id)`.
- **Storage bucket usage**: `user-uploads` for avatars, catalog media, and generated background assets.
- **Realtime subscriptions**:
  - `PublicProfile` subscribes to `appearance_settings` changes by `user_id`.
  - `NotificationsPanel` subscribes to `notifications` inserts for current user.

### Edge Function Interfaces
| Edge Function | Triggered From | Input Contract | Output Contract |
|---|---|---|---|
| `contact-notify` | Public contact form | `{ profile_user_id, sender_name, sender_email, message }` | Success/error JSON (logs and/or dispatches notification). |
| `order-notify` | Checkout + order status updates | `{ order_id, status_update? }` | Sends owner/customer emails via Resend; returns summary JSON. |
| `low-stock-notify` | Admin dashboard action | No required body | Sends grouped low-stock emails. |
| `generate-theme` | AI theme creator | `{ prompt, apiKey? }` | Returns generated theme JSON text payload. |
| `generate-background` | Background/AI visual generators | `{ prompt }` | Returns generated base64 image URL payload. |
| `landing-chat` | Landing chat widget | `{ messages }` | Streams assistant response (SSE). |

### External Services
- **Resend API**: transactional and status emails (`order-notify`, `low-stock-notify`).
- **Lovable AI Gateway**: chat/completion and image generation endpoints (`landing-chat`, `generate-theme`, `generate-background`).
- **Google Gemini API**: fallback model endpoint in `generate-theme` and optional client-side fallback in `AIThemeCreator`.

## Deployment & Infrastructure
### Runtime Requirements
- Node.js (Vite 5 compatible runtime; Node 18+ recommended).
- npm for dependency install and scripts.
- Supabase project (Auth/Database/Storage/Functions enabled).
- Browser environment with localStorage and clipboard support for full UX.

### Environment Variables
- Frontend (`.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
- Edge Functions secrets:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `LOVABLE_API_KEY`
  - `RESEND_API_KEY`
  - Optional fallback: `GEMINI_API_KEY`

### Build/Test/Run Commands
- `npm run dev` -> start local development server.
- `npm run build` -> production bundle generation.
- `npm run preview` -> local production preview.
- `npm run test` -> run Vitest suite.
- `npm run lint` -> linting checks.

### Infrastructure Notes
- Frontend is static-host deployable (Vite output).
- Backing services and auth/security are Supabase-managed; schema evolution is SQL migration based.
- Realtime channels are used for selected UI updates (appearance/notifications).

## Technical Notes
- **Technical Note 1**: `src/pages/dashboard/PlatformSettingsPage.tsx` references `supabase` in a `useEffect` but has no explicit import; verify compile/runtime behavior.
- **Technical Note 2**: `src/pages/PublicProfile.tsx` uses both realtime subscription and 3-second polling; this can increase query load and duplicate updates.
- **Technical Note 3**: `src/components/dashboard/AIThemeCreator.tsx` has client-side fallback calls to Gemini with API key input; this may expose sensitive key material if misconfigured.
- **Technical Note 4**: `src/pages/dashboard/AdminPage.tsx` recent transaction card computes totals from `order.price`, but `catalog_orders` schema does not expose `price`; amounts may display as `0`.
- **Technical Note 5**: Notification and stock/order side effects rely on edge-function secrets and external APIs; behavior cannot be fully traced offline without deployed secrets/runtime logs.

## Functional Documentation
> Scope: all project `.ts`/`.tsx`/`.js` files excluding `node_modules`, `dist`, and local tool metadata.

### `eslint.config.js`
- **File purpose**: ESLint rules and linting setup.
- **Functions**: None declared (types/constants/configuration module).

### `postcss.config.js`
- **File purpose**: PostCSS plugin configuration.
- **Functions**: None declared (types/constants/configuration module).

### `src/App.tsx`
- **File purpose**: SPA composition root; registers providers and all client-side routes.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AppInit` | `arrow` | React component that renders AppInit UI. | `{ children }: { children: React.ReactNode }` | `inferred` |
| `App` | `arrow` | React component that renders App UI. | `None` | `inferred` |

### `src/components/animations/StarryBackground.tsx`
- **File purpose**: Animation visual component: StarryBackground.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in memo` | Inline callback used by memo in StarryBackground. | `{ starCount = 120, starColor = "rgba(255,255,255,0.6)", shootingStarInterval = 4000, zIndex = 0, bgFill = "transparent", className = "", }: StarryBackgroundProps` | `inferred` |
| `resize` | `arrow` | Helper function in StarryBackground supporting module behavior. | `None` | `inferred` |
| `createShootingStar` | `arrow` | Creates ShootingStar objects/resources. | `None` | `ShootingStar` |
| `draw` | `arrow` | Helper function in StarryBackground supporting module behavior. | `now: number` | `inferred` |

### `src/components/dashboard/AIThemeCreator.tsx`
- **File purpose**: Dashboard feature component: AIThemeCreator.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AIThemeCreator` | `arrow` | React component that renders AIThemeCreator UI. | `None` | `inferred` |
| `generateTheme` | `arrow` | Helper function in AIThemeCreator supporting module behavior. | `None` | `inferred` |
| `getSystemPrompt` | `arrow` | Returns SystemPrompt computed data. | `userPrompt: string` | `inferred` |
| `handleThemeResponse` | `arrow` | Event handler for ThemeResponse interactions. | `text: string` | `inferred` |
| `handleAvatarUpload` | `arrow` | Event handler for AvatarUpload interactions. | `e: React.ChangeEvent<HTMLInputElement>` | `inferred` |
| `handleImageUpload` | `arrow` | Event handler for ImageUpload interactions. | `e: React.ChangeEvent<HTMLInputElement>` | `inferred` |
| `applyTheme` | `arrow` | Applies Theme settings or updates. | `None` | `inferred` |
| `copyThemeCode` | `arrow` | Helper function in AIThemeCreator supporting module behavior. | `None` | `inferred` |

### `src/components/dashboard/AnimationSelector.tsx`
- **File purpose**: Dashboard feature component: AnimationSelector.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AnimationSelector` | `arrow` | React component that renders AnimationSelector UI. | `{ currentAnimation, onSelect }: AnimationSelectorProps` | `inferred` |

### `src/components/dashboard/AvatarUpload.tsx`
- **File purpose**: Dashboard feature component: AvatarUpload.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AvatarUpload` | `arrow` | React component that renders AvatarUpload UI. | `None` | `inferred` |
| `handleFileSelect` | `arrow` | Event handler for FileSelect interactions. | `e: React.ChangeEvent<HTMLInputElement>` | `inferred` |
| `removeAvatar` | `arrow` | Removes Avatar data/resources. | `None` | `inferred` |

### `src/components/dashboard/BackgroundImageUpload.tsx`
- **File purpose**: Dashboard feature component: BackgroundImageUpload.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `BackgroundImageUpload` | `arrow` | React component that renders BackgroundImageUpload UI. | `None` | `inferred` |
| `handleUpload` | `arrow` | Event handler for Upload interactions. | `e: React.ChangeEvent<HTMLInputElement>` | `inferred` |
| `handleGenerate` | `arrow` | Event handler for Generate interactions. | `None` | `inferred` |
| `removeBackground` | `arrow` | Removes Background data/resources. | `None` | `inferred` |

### `src/components/dashboard/ButtonStylePicker.tsx`
- **File purpose**: Dashboard feature component: ButtonStylePicker.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ButtonStylePicker` | `arrow` | React component that renders ButtonStylePicker UI. | `{ currentStyle, onSelect, buttonBg, buttonText }: ButtonStylePickerProps` | `inferred` |

### `src/components/dashboard/ColorPickerSection.tsx`
- **File purpose**: Dashboard feature component: ColorPickerSection.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ColorPickerSection` | `arrow` | React component that renders ColorPickerSection UI. | `{ settings, updateSettings }: ColorPickerSectionProps` | `inferred` |

### `src/components/dashboard/DashboardLayout.tsx`
- **File purpose**: Dashboard feature component: DashboardLayout.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `DashboardLayout` | `arrow` | React component that renders DashboardLayout UI. | `None` | `inferred` |

### `src/components/dashboard/DashboardSidebar.tsx`
- **File purpose**: Dashboard feature component: DashboardSidebar.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `DashboardSidebar` | `function` | React component that renders DashboardSidebar UI. | `None` | `inferred` |
| `isActive` | `arrow` | Helper function in DashboardSidebar supporting module behavior. | `path: string` | `inferred` |

### `src/components/dashboard/DateRangeFilter.tsx`
- **File purpose**: Dashboard feature component: DateRangeFilter.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `DateRangeFilter` | `function` | React component that renders DateRangeFilter UI. | `{ value, onChange }: Props` | `inferred` |

### `src/components/dashboard/EmojiPicker.tsx`
- **File purpose**: Dashboard feature component: EmojiPicker.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `EmojiPicker` | `arrow` | React component that renders EmojiPicker UI. | `{ onSelect }: EmojiPickerProps` | `inferred` |

### `src/components/dashboard/NicheTemplates.tsx`
- **File purpose**: Dashboard feature component: NicheTemplates.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `useFavorites` | `arrow` | Custom hook or hook helper for Favorites behavior. | `None` | `inferred` |
| `getTemplatePreviewImage` | `arrow` | Returns TemplatePreviewImage computed data. | `template: NicheTemplate, idx: number` | `inferred` |
| `getCardVariant` | `arrow` | Returns CardVariant computed data. | `idx: number` | `inferred` |
| `NicheTemplates` | `arrow` | React component that renders NicheTemplates UI. | `None` | `inferred` |
| `startEditing` | `arrow` | Helper function in NicheTemplates supporting module behavior. | `template: NicheTemplate` | `inferred` |
| `cancelEditing` | `arrow` | Helper function in NicheTemplates supporting module behavior. | `None` | `inferred` |
| `addCustomLink` | `arrow` | Helper function in NicheTemplates supporting module behavior. | `None` | `inferred` |
| `removeCustomLink` | `arrow` | Removes CustomLink data/resources. | `idx: number` | `inferred` |
| `updateCustomLink` | `arrow` | Updates CustomLink state or persisted data. | `idx: number, field: "title" \| "url", val: string` | `inferred` |
| `handleFileUpload` | `arrow` | Event handler for FileUpload interactions. | `e: React.ChangeEvent<HTMLInputElement>, type: "bg" \| "avatar"` | `inferred` |
| `handleAIGenerate` | `arrow` | Event handler for AIGenerate interactions. | `type: "bg" \| "avatar"` | `inferred` |
| `applyTemplate` | `arrow` | Applies Template settings or updates. | `template: NicheTemplate, isEdited = false` | `inferred` |
| `getPreviewSettings` | `arrow` | Returns PreviewSettings computed data. | `template: NicheTemplate` | `AppearanceSettings` |

### `src/components/dashboard/NotificationPreferences.tsx`
- **File purpose**: Dashboard feature component: NotificationPreferences.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `NotificationPreferences` | `arrow` | React component that renders NotificationPreferences UI. | `None` | `inferred` |
| `fetch` | `arrow` | Fetches  data from store or backend. | `None` | `inferred` |
| `handleSave` | `arrow` | Event handler for Save interactions. | `None` | `inferred` |
| `togglePref` | `arrow` | Toggles Pref state. | `key: keyof NotificationPrefs` | `inferred` |

### `src/components/dashboard/NotificationsPanel.tsx`
- **File purpose**: Dashboard feature component: NotificationsPanel.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `NotificationsPanel` | `arrow` | React component that renders NotificationsPanel UI. | `None` | `inferred` |
| `fetchNotifications` | `arrow` | Fetches Notifications data from store or backend. | `None` | `inferred` |
| `markAsRead` | `arrow` | Helper function in NotificationsPanel supporting module behavior. | `id: string` | `inferred` |
| `markAllRead` | `arrow` | Helper function in NotificationsPanel supporting module behavior. | `None` | `inferred` |
| `clearAll` | `arrow` | Helper function in NotificationsPanel supporting module behavior. | `None` | `inferred` |

### `src/components/dashboard/ProfilePreview.tsx`
- **File purpose**: Dashboard feature component: ProfilePreview.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ProfilePreview` | `arrow` | React component that renders ProfilePreview UI. | `{ settings, user, links, catalogItems = [], showSocialIcons = true, creatorMetrics, compact = false, noFrame = false }: ProfilePreviewProps` | `inferred` |

### `src/components/dashboard/ShareProfile.tsx`
- **File purpose**: Dashboard feature component: ShareProfile.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ShareProfile` | `arrow` | React component that renders ShareProfile UI. | `None` | `inferred` |
| `copyToClipboard` | `arrow` | Helper function in ShareProfile supporting module behavior. | `None` | `inferred` |
| `shareOnTwitter` | `arrow` | Helper function in ShareProfile supporting module behavior. | `None` | `inferred` |
| `shareOnFacebook` | `arrow` | Helper function in ShareProfile supporting module behavior. | `None` | `inferred` |
| `shareOnLinkedIn` | `arrow` | Helper function in ShareProfile supporting module behavior. | `None` | `inferred` |
| `shareOnWhatsApp` | `arrow` | Helper function in ShareProfile supporting module behavior. | `None` | `inferred` |

### `src/components/dashboard/SocialLinksEditor.tsx`
- **File purpose**: Dashboard feature component: SocialLinksEditor.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `SocialLinksEditor` | `arrow` | React component that renders SocialLinksEditor UI. | `{ socialLinks, onChange }: SocialLinksEditorProps` | `inferred` |
| `addLink` | `arrow` | Helper function in SocialLinksEditor supporting module behavior. | `None` | `inferred` |
| `removeLink` | `arrow` | Removes Link data/resources. | `index: number` | `inferred` |

### `src/components/dashboard/ThemeToggle.tsx`
- **File purpose**: Dashboard feature component: ThemeToggle.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ThemeToggle` | `arrow` | React component that renders ThemeToggle UI. | `None` | `inferred` |

### `src/components/InfoPageLayout.tsx`
- **File purpose**: Shared component module: InfoPageLayout.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `InfoPageLayout` | `arrow` | React component that renders InfoPageLayout UI. | `{ title, subtitle, lastUpdated, children }: InfoPageLayoutProps` | `inferred` |

### `src/components/landing/ChatWidget.tsx`
- **File purpose**: Marketing landing component: ChatWidget.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ChatWidget` | `arrow` | React component that renders ChatWidget UI. | `None` | `inferred` |
| `updateMobile` | `arrow` | Updates Mobile state or persisted data. | `None` | `inferred` |
| `syncTheme` | `arrow` | Helper function in ChatWidget supporting module behavior. | `None` | `inferred` |
| `syncHeroState` | `arrow` | Helper function in ChatWidget supporting module behavior. | `None` | `inferred` |
| `sendMessage` | `arrow` | Helper function in ChatWidget supporting module behavior. | `text: string` | `inferred` |

### `src/components/landing/CountUp.tsx`
- **File purpose**: Marketing landing component: CountUp.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `formatNumber` | `arrow` | Helper function in CountUp supporting module behavior. | `num: number, end: number` | `inferred` |
| `CountUp` | `arrow` | React component that renders CountUp UI. | `{ end, suffix = "", duration = 2, className }: CountUpProps` | `inferred` |

### `src/components/landing/FAQSection.tsx`
- **File purpose**: Marketing landing component: FAQSection.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `FAQSection` | `arrow` | React component that renders FAQSection UI. | `None` | `inferred` |

### `src/components/landing/FeaturesSection.tsx`
- **File purpose**: Marketing landing component: FeaturesSection.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `FeaturesSection` | `arrow` | React component that renders FeaturesSection UI. | `None` | `inferred` |

### `src/components/landing/Footer.tsx`
- **File purpose**: Marketing landing component: Footer.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Footer` | `arrow` | React component that renders Footer UI. | `None` | `inferred` |

### `src/components/landing/HeroSection.tsx`
- **File purpose**: Marketing landing component: HeroSection.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `HeroSection` | `arrow` | React component that renders HeroSection UI. | `None` | `inferred` |

### `src/components/landing/HowItWorks.tsx`
- **File purpose**: Marketing landing component: HowItWorks.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `HowItWorks` | `arrow` | React component that renders HowItWorks UI. | `None` | `inferred` |

### `src/components/landing/Navbar.tsx`
- **File purpose**: Marketing landing component: Navbar.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Navbar` | `arrow` | React component that renders Navbar UI. | `None` | `inferred` |
| `onScroll` | `arrow` | Helper function in Navbar supporting module behavior. | `None` | `inferred` |

### `src/components/landing/PageScroller.tsx`
- **File purpose**: Marketing landing component: PageScroller.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PageScroller` | `arrow` | React component that renders PageScroller UI. | `None` | `inferred` |
| `onScroll` | `arrow` | Helper function in PageScroller supporting module behavior. | `None` | `inferred` |
| `scrollByViewport` | `arrow` | Helper function in PageScroller supporting module behavior. | `direction: "up" \| "down"` | `inferred` |
| `jumpToFromTrack` | `arrow` | Helper function in PageScroller supporting module behavior. | `event: MouseEvent<HTMLDivElement>` | `inferred` |

### `src/components/landing/ParticleBackground.tsx`
- **File purpose**: Marketing landing component: ParticleBackground.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ParticleBackground` | `arrow` | React component that renders ParticleBackground UI. | `None` | `inferred` |
| `resize` | `arrow` | Helper function in ParticleBackground supporting module behavior. | `None` | `inferred` |
| `animate` | `arrow` | Helper function in ParticleBackground supporting module behavior. | `None` | `inferred` |

### `src/components/landing/PricingSection.tsx`
- **File purpose**: Marketing landing component: PricingSection.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PricingSection` | `arrow` | React component that renders PricingSection UI. | `None` | `inferred` |

### `src/components/landing/ScrollReveal.tsx`
- **File purpose**: Marketing landing component: ScrollReveal.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ScrollReveal` | `arrow` | React component that renders ScrollReveal UI. | `{ children, className = "", delay = 0 }: ScrollRevealProps` | `inferred` |

### `src/components/landing/TestimonialsSection.tsx`
- **File purpose**: Marketing landing component: TestimonialsSection.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `TestimonialsSection` | `arrow` | React component that renders TestimonialsSection UI. | `None` | `inferred` |

### `src/components/landing/ThemeShowcase.tsx`
- **File purpose**: Marketing landing component: ThemeShowcase.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ThemeShowcase` | `arrow` | React component that renders ThemeShowcase UI. | `None` | `inferred` |
| `handleMouseMove` | `arrow` | Event handler for MouseMove interactions. | `event: React.MouseEvent` | `inferred` |
| `handleMouseLeave` | `arrow` | Event handler for MouseLeave interactions. | `None` | `inferred` |
| `scroll` | `arrow` | Helper function in ThemeShowcase supporting module behavior. | `dir: "left" \| "right"` | `inferred` |

### `src/components/NavLink.tsx`
- **File purpose**: Shared component module: NavLink.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in forwardRef` | Inline callback used by forwardRef in NavLink. | `{ className, activeClassName, pendingClassName, to, ...props }, ref` | `inferred` |

### `src/components/ProtectedRoute.tsx`
- **File purpose**: Shared component module: ProtectedRoute.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ProtectedRoute` | `arrow` | React component that renders ProtectedRoute UI. | `{ children }: { children: React.ReactNode }` | `inferred` |

### `src/components/public/CatalogItemDetail.tsx`
- **File purpose**: Public profile/catalog component: CatalogItemDetail.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `CatalogItemDetail` | `arrow` | React component that renders CatalogItemDetail UI. | `{ item, profileUserId, textColor, buttonBg, buttonText, onClose, cardBg, }: CatalogItemDetailProps` | `inferred` |
| `goToPayment` | `arrow` | Helper function in CatalogItemDetail supporting module behavior. | `None` | `inferred` |
| `placeOrder` | `arrow` | Helper function in CatalogItemDetail supporting module behavior. | `None` | `inferred` |
| `renderStepContent` | `arrow` | Renders StepContent view fragments. | `None` | `inferred` |

### `src/components/public/CheckoutModal.tsx`
- **File purpose**: Public profile/catalog component: CheckoutModal.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `CheckoutModal` | `arrow` | React component that renders CheckoutModal UI. | `{ isOpen, onClose, profileUserId, buttonBg, buttonText, cardBg }: CheckoutModalProps` | `inferred` |
| `handleNext` | `arrow` | Event handler for Next interactions. | `None` | `inferred` |
| `handleConfirmOrder` | `arrow` | Event handler for ConfirmOrder interactions. | `None` | `inferred` |

### `src/components/public/ContactForm.tsx`
- **File purpose**: Public profile/catalog component: ContactForm.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ContactForm` | `arrow` | React component that renders ContactForm UI. | `{ profileUserId, textColor, buttonBg, buttonText, buttonStyle, hasPhoto, inputBg, inputBorder, cardBg, cardBorder }: ContactFormProps` | `inferred` |
| `getBtnRadius` | `arrow` | Returns BtnRadius computed data. | `None` | `inferred` |
| `handleSubmit` | `arrow` | Event handler for Submit interactions. | `e: React.FormEvent` | `inferred` |

### `src/components/public/EmbedRenderer.tsx`
- **File purpose**: Public profile/catalog component: EmbedRenderer.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `getYouTubeId` | `arrow` | Returns YouTubeId computed data. | `url: string` | `inferred` |
| `getVimeoId` | `arrow` | Returns VimeoId computed data. | `url: string` | `inferred` |
| `getGoogleMapsEmbedUrl` | `arrow` | Returns GoogleMapsEmbedUrl computed data. | `url: string` | `inferred` |
| `EmbedRenderer` | `arrow` | React component that renders EmbedRenderer UI. | `{ url, platform, title }: EmbedRendererProps` | `inferred` |

### `src/components/public/ProfileHeaderActions.tsx`
- **File purpose**: Public profile/catalog component: ProfileHeaderActions.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ProfileHeaderActions` | `arrow` | React component that renders ProfileHeaderActions UI. | `{ username, profileName, avatarUrl, bio, isDark, onToggleDark, cardText, cardSub, }: ProfileHeaderActionsProps` | `inferred` |

### `src/components/public/ProfileShareModal.tsx`
- **File purpose**: Public profile/catalog component: ProfileShareModal.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ProfileShareModal` | `arrow` | React component that renders ProfileShareModal UI. | `{ isOpen, onClose, profileName, username, avatarUrl, bio }: ProfileShareModalProps` | `inferred` |
| `copyLink` | `arrow` | Helper function in ProfileShareModal supporting module behavior. | `None` | `inferred` |

### `src/components/public/PublicCartFooter.tsx`
- **File purpose**: Public profile/catalog component: PublicCartFooter.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PublicCartFooter` | `arrow` | React component that renders PublicCartFooter UI. | `{ buttonBg, buttonText, onCheckout }: PublicCartFooterProps` | `inferred` |
| `handleModalState` | `arrow` | Event handler for ModalState interactions. | `event: Event` | `inferred` |

### `src/components/public/PublicCatalog.tsx`
- **File purpose**: Public profile/catalog component: PublicCatalog.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `hexToRgb` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `hex: string` | `inferred` |
| `shiftHex` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `hex: string, amount: number` | `inferred` |
| `clamp` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `v: number` | `inferred` |
| `toHex` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `v: number` | `inferred` |
| `contrastText` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `bg: string, fallback: string` | `inferred` |
| `PublicCatalog` | `arrow` | React component that renders PublicCatalog UI. | `{ items, profileUserId, textColor, buttonBg, buttonText, buttonStyle, hasPhoto, upiId, catalogCardBg, cardBorder }: PublicCatalogProps` | `inferred` |
| `trackEvent` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `itemId: string, eventType: "view" \| "click"` | `inferred` |
| `getBtnRadius` | `arrow` | Returns BtnRadius computed data. | `None` | `inferred` |
| `cycleSortBy` | `arrow` | Helper function in PublicCatalog supporting module behavior. | `None` | `inferred` |

### `src/components/PublicRouteErrorBoundary.tsx`
- **File purpose**: Shared component module: PublicRouteErrorBoundary.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `getDerivedStateFromError` | `method` | Returns DerivedStateFromError computed data. | `None` | `PublicRouteErrorBoundaryState` |
| `componentDidCatch` | `method` | Helper function in PublicRouteErrorBoundary supporting module behavior. | `error: Error, errorInfo: ErrorInfo` | `inferred` |
| `render` | `method` | Renders  view fragments. | `None` | `inferred` |

### `src/components/SocialIcon.tsx`
- **File purpose**: Shared component module: SocialIcon.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `SocialIcon` | `arrow` | React component that renders SocialIcon UI. | `{ platform, className = "w-4 h-4" }: SocialIconProps` | `inferred` |
| `isEmbedPlatform` | `arrow` | Helper function in SocialIcon supporting module behavior. | `platform: SocialPlatform` | `inferred` |

### `src/components/ui/accordion.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Accordion.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in accordion. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in accordion. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in accordion. | `{ className, children, ...props }, ref` | `inferred` |

### `src/components/ui/alert-dialog.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Alert Dialog.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert-dialog. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert-dialog. | `{ className, ...props }, ref` | `inferred` |
| `AlertDialogHeader` | `arrow` | React component that renders AlertDialogHeader UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `AlertDialogFooter` | `arrow` | React component that renders AlertDialogFooter UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert-dialog. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert-dialog. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert-dialog. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert-dialog. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/alert.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Alert.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert. | `{ className, variant, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in alert. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/aspect-ratio.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Aspect Ratio.
- **Functions**: None declared (types/constants/configuration module).

### `src/components/ui/avatar.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Avatar.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in avatar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in avatar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in avatar. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/badge.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Badge.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Badge` | `function` | React component that renders Badge UI. | `{ className, variant, ...props }: BadgeProps` | `inferred` |

### `src/components/ui/breadcrumb.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Breadcrumb.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in breadcrumb. | `{ ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in breadcrumb. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in breadcrumb. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in breadcrumb. | `{ asChild, className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in breadcrumb. | `{ className, ...props }, ref` | `inferred` |
| `BreadcrumbSeparator` | `arrow` | React component that renders BreadcrumbSeparator UI. | `{ children, className, ...props }: React.ComponentProps<"li">` | `inferred` |
| `BreadcrumbEllipsis` | `arrow` | React component that renders BreadcrumbEllipsis UI. | `{ className, ...props }: React.ComponentProps<"span">` | `inferred` |

### `src/components/ui/button.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Button.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in button. | `{ className, variant, size, asChild = false, ...props }, ref` | `inferred` |

### `src/components/ui/calendar.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Calendar.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Calendar` | `function` | React component that renders Calendar UI. | `{ className, classNames, showOutsideDays = true, ...props }: CalendarProps` | `inferred` |

### `src/components/ui/card.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Card.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in card. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in card. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in card. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in card. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in card. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in card. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/carousel.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Carousel.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `useCarousel` | `function` | Custom hook or hook helper for Carousel behavior. | `None` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in carousel. | `{ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in carousel. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in carousel. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in carousel. | `{ className, variant = "outline", size = "icon", ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in carousel. | `{ className, variant = "outline", size = "icon", ...props }, ref` | `inferred` |

### `src/components/ui/chart.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Chart.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `useChart` | `function` | Custom hook or hook helper for Chart behavior. | `None` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in chart. | `{ id, className, children, config, ...props }, ref` | `inferred` |
| `ChartStyle` | `arrow` | React component that renders ChartStyle UI. | `{ id, config }: { id: string; config: ChartConfig }` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in chart. | `{ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in chart. | `{ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref` | `inferred` |
| `getPayloadConfigFromPayload` | `function` | Returns PayloadConfigFromPayload computed data. | `config: ChartConfig, payload: unknown, key: string` | `inferred` |

### `src/components/ui/checkbox.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Checkbox.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in checkbox. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/collapsible.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Collapsible.
- **Functions**: None declared (types/constants/configuration module).

### `src/components/ui/command.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Command.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `{ className, ...props }, ref` | `inferred` |
| `CommandDialog` | `arrow` | React component that renders CommandDialog UI. | `{ children, ...props }: CommandDialogProps` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `props, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in command. | `{ className, ...props }, ref` | `inferred` |
| `CommandShortcut` | `arrow` | React component that renders CommandShortcut UI. | `{ className, ...props }: React.HTMLAttributes<HTMLSpanElement>` | `inferred` |

### `src/components/ui/context-menu.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Context Menu.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, inset, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, inset, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, children, checked, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, inset, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in context-menu. | `{ className, ...props }, ref` | `inferred` |
| `ContextMenuShortcut` | `arrow` | React component that renders ContextMenuShortcut UI. | `{ className, ...props }: React.HTMLAttributes<HTMLSpanElement>` | `inferred` |

### `src/components/ui/dialog.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Dialog.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dialog. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dialog. | `{ className, children, ...props }, ref` | `inferred` |
| `DialogHeader` | `arrow` | React component that renders DialogHeader UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `DialogFooter` | `arrow` | React component that renders DialogFooter UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dialog. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dialog. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/drawer.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Drawer.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Drawer` | `arrow` | React component that renders Drawer UI. | `{ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in drawer. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in drawer. | `{ className, children, ...props }, ref` | `inferred` |
| `DrawerHeader` | `arrow` | React component that renders DrawerHeader UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `DrawerFooter` | `arrow` | React component that renders DrawerFooter UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in drawer. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in drawer. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/dropdown-menu.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Dropdown Menu.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, inset, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, sideOffset = 4, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, inset, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, children, checked, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, inset, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in dropdown-menu. | `{ className, ...props }, ref` | `inferred` |
| `DropdownMenuShortcut` | `arrow` | React component that renders DropdownMenuShortcut UI. | `{ className, ...props }: React.HTMLAttributes<HTMLSpanElement>` | `inferred` |

### `src/components/ui/form.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Form.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `FormField` | `arrow` | React component that renders FormField UI. | `{ ...props }: ControllerProps<TFieldValues, TName>` | `inferred` |
| `useFormField` | `arrow` | Custom hook or hook helper for FormField behavior. | `None` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in form. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in form. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in form. | `{ ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in form. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in form. | `{ className, children, ...props }, ref` | `inferred` |

### `src/components/ui/hover-card.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Hover Card.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in hover-card. | `{ className, align = "center", sideOffset = 4, ...props }, ref` | `inferred` |

### `src/components/ui/input-otp.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Input Otp.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in input-otp. | `{ className, containerClassName, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in input-otp. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in input-otp. | `{ index, className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in input-otp. | `{ ...props }, ref` | `inferred` |

### `src/components/ui/input.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Input.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in input. | `{ className, type, ...props }, ref` | `inferred` |

### `src/components/ui/label.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Label.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in label. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/menubar.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Menubar.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, inset, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, inset, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, children, checked, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, inset, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in menubar. | `{ className, ...props }, ref` | `inferred` |
| `MenubarShortcut` | `arrow` | React component that renders MenubarShortcut UI. | `{ className, ...props }: React.HTMLAttributes<HTMLSpanElement>` | `inferred` |

### `src/components/ui/navigation-menu.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Navigation Menu.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in navigation-menu. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in navigation-menu. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in navigation-menu. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in navigation-menu. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in navigation-menu. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in navigation-menu. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/pagination.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Pagination.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Pagination` | `arrow` | React component that renders Pagination UI. | `{ className, ...props }: React.ComponentProps<"nav">` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in pagination. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in pagination. | `{ className, ...props }, ref` | `inferred` |
| `PaginationLink` | `arrow` | React component that renders PaginationLink UI. | `{ className, isActive, size = "icon", ...props }: PaginationLinkProps` | `inferred` |
| `PaginationPrevious` | `arrow` | React component that renders PaginationPrevious UI. | `{ className, ...props }: React.ComponentProps<typeof PaginationLink>` | `inferred` |
| `PaginationNext` | `arrow` | React component that renders PaginationNext UI. | `{ className, ...props }: React.ComponentProps<typeof PaginationLink>` | `inferred` |
| `PaginationEllipsis` | `arrow` | React component that renders PaginationEllipsis UI. | `{ className, ...props }: React.ComponentProps<"span">` | `inferred` |

### `src/components/ui/popover.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Popover.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in popover. | `{ className, align = "center", sideOffset = 4, ...props }, ref` | `inferred` |

### `src/components/ui/progress.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Progress.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in progress. | `{ className, value, ...props }, ref` | `inferred` |

### `src/components/ui/radio-group.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Radio Group.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in radio-group. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in radio-group. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/resizable.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Resizable.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ResizablePanelGroup` | `arrow` | React component that renders ResizablePanelGroup UI. | `{ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>` | `inferred` |
| `ResizableHandle` | `arrow` | React component that renders ResizableHandle UI. | `{ withHandle, className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & { withHandle?: boolean; }` | `inferred` |

### `src/components/ui/scroll-area.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Scroll Area.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in scroll-area. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in scroll-area. | `{ className, orientation = "vertical", ...props }, ref` | `inferred` |

### `src/components/ui/select.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Select.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, children, position = "popper", ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in select. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/separator.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Separator.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in separator. | `{ className, orientation = "horizontal", decorative = true, ...props }, ref` | `inferred` |

### `src/components/ui/sheet.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Sheet.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sheet. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sheet. | `{ side = "right", className, children, ...props }, ref` | `inferred` |
| `SheetHeader` | `arrow` | React component that renders SheetHeader UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `SheetFooter` | `arrow` | React component that renders SheetFooter UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sheet. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sheet. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/sidebar.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Sidebar.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `useSidebar` | `function` | Custom hook or hook helper for Sidebar behavior. | `None` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref` | `inferred` |
| `handleKeyDown` | `arrow` | Event handler for KeyDown interactions. | `event: KeyboardEvent` | `inferred` |
| `MobileSwipeWrapper` | `arrow` | React component that renders MobileSwipeWrapper UI. | `{ side, onSwipeClose, children, }: { side: "left" \| "right"; onSwipeClose: () => void; children: React.ReactNode; }` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, onClick, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, asChild = false, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, asChild = false, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, asChild = false, showOnHover = false, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, showIcon = false, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in sidebar. | `{ asChild = false, size = "md", isActive, className, ...props }, ref` | `inferred` |

### `src/components/ui/skeleton.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Skeleton.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Skeleton` | `function` | React component that renders Skeleton UI. | `{ className, ...props }: React.HTMLAttributes<HTMLDivElement>` | `inferred` |

### `src/components/ui/slider.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Slider.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in slider. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/sonner.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Sonner.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Toaster` | `arrow` | React component that renders Toaster UI. | `{ ...props }: ToasterProps` | `inferred` |

### `src/components/ui/switch.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Switch.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in switch. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/table.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Table.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in table. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/tabs.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Tabs.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in tabs. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in tabs. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in tabs. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/textarea.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Textarea.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in textarea. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/toast.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Toast.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toast. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toast. | `{ className, variant, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toast. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toast. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toast. | `{ className, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toast. | `{ className, ...props }, ref` | `inferred` |

### `src/components/ui/toaster.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Toaster.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Toaster` | `function` | React component that renders Toaster UI. | `None` | `inferred` |

### `src/components/ui/toggle-group.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Toggle Group.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toggle-group. | `{ className, variant, size, children, ...props }, ref` | `inferred` |
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toggle-group. | `{ className, children, variant, size, ...props }, ref` | `inferred` |

### `src/components/ui/toggle.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Toggle.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in toggle. | `{ className, variant, size, ...props }, ref` | `inferred` |

### `src/components/ui/tooltip.tsx`
- **File purpose**: Reusable UI primitive/wrapper: Tooltip.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `(inline)` | `callback in React.forwardRef` | Inline callback used by React.forwardRef in tooltip. | `{ className, sideOffset = 4, ...props }, ref` | `inferred` |

### `src/components/ui/use-toast.ts`
- **File purpose**: Reusable UI primitive/wrapper: Use Toast.
- **Functions**: None declared (types/constants/configuration module).

### `src/data/mockCatalogServices.ts`
- **File purpose**: Static data/config module: MockCatalogServices.
- **Functions**: None declared (types/constants/configuration module).

### `src/data/nicheTemplates.ts`
- **File purpose**: Static data/config module: NicheTemplates.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `getTemplatesByCategory` | `arrow` | Returns TemplatesByCategory computed data. | `None` | `inferred` |
| `getTemplateById` | `arrow` | Returns TemplateById computed data. | `id: string` | `inferred` |

### `src/data/themes.ts`
- **File purpose**: Static data/config module: Themes.
- **Functions**: None declared (types/constants/configuration module).

### `src/hooks/use-mobile.tsx`
- **File purpose**: Custom React hook module: Use Mobile.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `useIsMobile` | `function` | Custom hook or hook helper for IsMobile behavior. | `None` | `inferred` |
| `onChange` | `arrow` | Helper function in use-mobile supporting module behavior. | `None` | `inferred` |

### `src/hooks/use-toast.ts`
- **File purpose**: Custom React hook module: Use Toast.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `genId` | `function` | Helper function in use-toast supporting module behavior. | `None` | `inferred` |
| `addToRemoveQueue` | `arrow` | Helper function in use-toast supporting module behavior. | `toastId: string` | `inferred` |
| `reducer` | `arrow` | Helper function in use-toast supporting module behavior. | `state: State, action: Action` | `State` |
| `dispatch` | `function` | Helper function in use-toast supporting module behavior. | `action: Action` | `inferred` |
| `toast` | `function` | Helper function in use-toast supporting module behavior. | `{ ...props }: Toast` | `inferred` |
| `update` | `arrow` | Updates  state or persisted data. | `props: ToasterToast` | `inferred` |
| `dismiss` | `arrow` | Helper function in use-toast supporting module behavior. | `None` | `inferred` |
| `useToast` | `function` | Custom hook or hook helper for Toast behavior. | `None` | `inferred` |

### `src/hooks/useCurrency.tsx`
- **File purpose**: Custom React hook module: UseCurrency.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `CurrencyProvider` | `arrow` | React component that renders CurrencyProvider UI. | `{ children }: { children: ReactNode }` | `inferred` |
| `detect` | `arrow` | Helper function in useCurrency supporting module behavior. | `None` | `inferred` |
| `formatPrice` | `arrow` | Helper function in useCurrency supporting module behavior. | `usdAmount: number` | `inferred` |
| `useCurrency` | `arrow` | Custom hook or hook helper for Currency behavior. | `None` | `inferred` |

### `src/integrations/supabase/client.ts`
- **File purpose**: Supabase client bootstrap and runtime configuration guard.
- **Functions**: None declared (types/constants/configuration module).

### `src/integrations/supabase/types.ts`
- **File purpose**: Generated database type definitions for Supabase tables/RPCs.
- **Functions**: None declared (types/constants/configuration module).

### `src/lib/activityLogger.ts`
- **File purpose**: Shared utility module: ActivityLogger.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `logActivity` | `arrow` | Helper function in activityLogger supporting module behavior. | `action: string, details?: string` | `inferred` |

### `src/lib/commerceConfig.ts`
- **File purpose**: Central label/CTA resolution logic for catalog and checkout UI.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `sanitizeStringRecord` | `arrow` | Helper function in commerceConfig supporting module behavior. | `value: unknown` | `Record<string, string>` |
| `getCheckoutStepLabels` | `arrow` | Returns CheckoutStepLabels computed data. | `settings: unknown` | `Record<CheckoutStepKey, string>` |
| `getCtaLabels` | `arrow` | Returns CtaLabels computed data. | `settings: unknown` | `Record<string, string>` |
| `getCategoryLabels` | `arrow` | Returns CategoryLabels computed data. | `settings: unknown` | `Record<string, string>` |
| `getItemTypeLabels` | `arrow` | Returns ItemTypeLabels computed data. | `settings: unknown` | `Record<string, string>` |
| `prettifyLabel` | `arrow` | Helper function in commerceConfig supporting module behavior. | `value: string` | `string` |
| `resolveFromMap` | `arrow` | Resolves FromMap based on configuration/context. | `map: Record<string, string>, key: string` | `string \| null` |
| `resolveItemCtaLabel` | `arrow` | Resolves ItemCtaLabel based on configuration/context. | `itemType: string, settings: unknown, fallback = "Buy Now"` | `string` |
| `resolveCategoryLabel` | `arrow` | Resolves CategoryLabel based on configuration/context. | `category: string, settings: unknown` | `string` |
| `resolveItemTypeLabel` | `arrow` | Resolves ItemTypeLabel based on configuration/context. | `itemType: string, settings: unknown` | `string` |

### `src/lib/emailTemplates.ts`
- **File purpose**: Shared utility module: EmailTemplates.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `getOrderStatusEmailTemplate` | `arrow` | Returns OrderStatusEmailTemplate computed data. | `data: OrderTemplateData` | `inferred` |

### `src/lib/profileRenderer.ts`
- **File purpose**: Single-source profile rendering style helpers shared by dashboard and public views.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `computePalette` | `function` | Computes Palette derived presentation values. | `appearance: ProfileAppearance` | `ProfilePalette` |
| `computeBgStyle` | `function` | Computes BgStyle derived presentation values. | `appearance: ProfileAppearance` | `React.CSSProperties` |
| `getLinkButtonClasses` | `function` | Returns LinkButtonClasses computed data. | `buttonStyle: ButtonStyleType` | `string` |
| `getLinkButtonStyle` | `function` | Returns LinkButtonStyle computed data. | `buttonStyle: ButtonStyleType, btnBg: string, btnText: string` | `React.CSSProperties` |
| `getLinkIconBgStyle` | `function` | Returns LinkIconBgStyle computed data. | `buttonStyle: ButtonStyleType, btnBg: string` | `React.CSSProperties` |
| `getFooterColor` | `function` | Returns FooterColor computed data. | `appearance: ProfileAppearance` | `string` |

### `src/lib/utils.ts`
- **File purpose**: Shared utility module: Utils.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `cn` | `function` | Merges conditional class names safely. | `...inputs: ClassValue[]` | `inferred` |

### `src/lib/validation.ts`
- **File purpose**: Shared utility module: Validation.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `normalizeUrl` | `arrow` | Normalizes Url values. | `url: string` | `string` |

### `src/main.tsx`
- **File purpose**: Browser entrypoint that mounts the React application.
- **Functions**: None declared (types/constants/configuration module).

### `src/pages/AdminLogin.tsx`
- **File purpose**: Top-level route page: AdminLogin.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AdminLogin` | `arrow` | React component that renders AdminLogin UI. | `None` | `inferred` |
| `handleSubmit` | `arrow` | Event handler for Submit interactions. | `e: React.FormEvent` | `inferred` |

### `src/pages/ApiDocs.tsx`
- **File purpose**: Top-level route page: ApiDocs.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `CodeBlock` | `arrow` | React component that renders CodeBlock UI. | `{ code }: { code: string }` | `inferred` |
| `handleCopy` | `arrow` | Event handler for Copy interactions. | `None` | `inferred` |
| `ApiDocs` | `arrow` | React component that renders ApiDocs UI. | `None` | `inferred` |

### `src/pages/Blog.tsx`
- **File purpose**: Top-level route page: Blog.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Blog` | `arrow` | React component that renders Blog UI. | `None` | `inferred` |

### `src/pages/Changelog.tsx`
- **File purpose**: Top-level route page: Changelog.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Changelog` | `arrow` | React component that renders Changelog UI. | `None` | `inferred` |

### `src/pages/CookiePolicy.tsx`
- **File purpose**: Top-level route page: CookiePolicy.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `CookiePolicy` | `arrow` | React component that renders CookiePolicy UI. | `None` | `inferred` |

### `src/pages/dashboard/AdminPage.tsx`
- **File purpose**: Dashboard route page: AdminPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AdminPage` | `arrow` | React component that renders AdminPage UI. | `None` | `inferred` |
| `fetchAll` | `arrow` | Fetches All data from store or backend. | `None` | `inferred` |
| `handleStatusChange` | `arrow` | Event handler for StatusChange interactions. | `userId: string, newStatus: string` | `inferred` |
| `handleRoleChange` | `arrow` | Event handler for RoleChange interactions. | `userId: string, newRole: string` | `inferred` |
| `handleDeleteUser` | `arrow` | Event handler for DeleteUser interactions. | `userId: string, email: string` | `inferred` |
| `toggleSelect` | `arrow` | Toggles Select state. | `userId: string` | `inferred` |
| `toggleSelectAll` | `arrow` | Toggles SelectAll state. | `None` | `inferred` |
| `bulkAction` | `arrow` | Helper function in AdminPage supporting module behavior. | `action: "freeze" \| "unfreeze" \| "delete"` | `inferred` |
| `getUserName` | `arrow` | Returns UserName computed data. | `userId: string` | `inferred` |

### `src/pages/dashboard/AdminUserEditPage.tsx`
- **File purpose**: Dashboard route page: AdminUserEditPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AdminUserEditPage` | `arrow` | React component that renders AdminUserEditPage UI. | `None` | `inferred` |
| `fetchUserData` | `arrow` | Fetches UserData data from store or backend. | `None` | `inferred` |
| `saveProfile` | `arrow` | Helper function in AdminUserEditPage supporting module behavior. | `None` | `inferred` |
| `toggleLink` | `arrow` | Toggles Link state. | `linkId: string, enabled: boolean` | `inferred` |
| `saveAppearance` | `arrow` | Helper function in AdminUserEditPage supporting module behavior. | `None` | `inferred` |

### `src/pages/dashboard/AnalyticsPage.tsx`
- **File purpose**: Dashboard route page: AnalyticsPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `AnalyticsPage` | `arrow` | React component that renders AnalyticsPage UI. | `None` | `inferred` |
| `fetchProfileViews` | `arrow` | Fetches ProfileViews data from store or backend. | `None` | `inferred` |
| `fetchCatalogAnalytics` | `arrow` | Fetches CatalogAnalytics data from store or backend. | `None` | `inferred` |
| `handleSort` | `arrow` | Event handler for Sort interactions. | `key: SortKey` | `inferred` |

### `src/pages/dashboard/AppearancePage.tsx`
- **File purpose**: Dashboard route page: AppearancePage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `getPopularThemes` | `arrow` | Returns PopularThemes computed data. | `None` | `inferred` |
| `getThemesByCategory` | `arrow` | Returns ThemesByCategory computed data. | `category: ThemeCategory` | `inferred` |
| `AppearancePage` | `arrow` | React component that renders AppearancePage UI. | `None` | `inferred` |
| `handleSelectTheme` | `arrow` | Event handler for SelectTheme interactions. | `theme: ThemePreset` | `inferred` |
| `ThemeCard` | `arrow` | React component that renders ThemeCard UI. | `{ theme }: { theme: ThemePreset }` | `inferred` |
| `copyProfileLink` | `arrow` | Helper function in AppearancePage supporting module behavior. | `None` | `inferred` |

### `src/pages/dashboard/CatalogPage.tsx`
- **File purpose**: Dashboard route page: CatalogPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `CatalogPage` | `arrow` | React component that renders CatalogPage UI. | `None` | `inferred` |
| `resetForm` | `arrow` | Helper function in CatalogPage supporting module behavior. | `None` | `inferred` |
| `handleImageUpload` | `arrow` | Event handler for ImageUpload interactions. | `e: React.ChangeEvent<HTMLInputElement>` | `inferred` |
| `handleSave` | `arrow` | Event handler for Save interactions. | `None` | `inferred` |
| `startEdit` | `arrow` | Helper function in CatalogPage supporting module behavior. | `item: CatalogItem` | `inferred` |
| `handleDelete` | `arrow` | Event handler for Delete interactions. | `id: string` | `inferred` |
| `handleBulkAdd` | `arrow` | Event handler for BulkAdd interactions. | `category: string` | `inferred` |

### `src/pages/dashboard/DashboardOverview.tsx`
- **File purpose**: Dashboard route page: DashboardOverview.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `DashboardOverview` | `arrow` | React component that renders DashboardOverview UI. | `None` | `inferred` |
| `fetchStats` | `arrow` | Fetches Stats data from store or backend. | `None` | `inferred` |
| `handleSendAlerts` | `arrow` | Event handler for SendAlerts interactions. | `None` | `inferred` |

### `src/pages/dashboard/LinkEditor.tsx`
- **File purpose**: Dashboard route page: LinkEditor.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `LinkEditor` | `arrow` | React component that renders LinkEditor UI. | `None` | `inferred` |
| `moveLink` | `arrow` | Helper function in LinkEditor supporting module behavior. | `index: number, direction: 'up' \| 'down'` | `inferred` |
| `copyProfileLink` | `arrow` | Helper function in LinkEditor supporting module behavior. | `None` | `inferred` |
| `validateAndAdd` | `arrow` | Validates AndAdd input values. | `None` | `inferred` |
| `copyLinkUrl` | `arrow` | Helper function in LinkEditor supporting module behavior. | `url: string` | `inferred` |
| `handleDelete` | `arrow` | Event handler for Delete interactions. | `id: string` | `inferred` |
| `startEdit` | `arrow` | Helper function in LinkEditor supporting module behavior. | `link: LinkItem` | `inferred` |
| `saveEdit` | `arrow` | Helper function in LinkEditor supporting module behavior. | `None` | `inferred` |

### `src/pages/dashboard/MessagesPage.tsx`
- **File purpose**: Dashboard route page: MessagesPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `MessagesPage` | `arrow` | React component that renders MessagesPage UI. | `None` | `inferred` |
| `fetchMessages` | `arrow` | Fetches Messages data from store or backend. | `None` | `inferred` |
| `markAsRead` | `arrow` | Helper function in MessagesPage supporting module behavior. | `msg: ContactMessage` | `inferred` |
| `deleteMessage` | `arrow` | Removes Message data/resources. | `id: string` | `inferred` |

### `src/pages/dashboard/OrdersPage.tsx`
- **File purpose**: Dashboard route page: OrdersPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `OrdersPage` | `arrow` | React component that renders OrdersPage UI. | `None` | `inferred` |
| `fetchOrders` | `arrow` | Fetches Orders data from store or backend. | `None` | `inferred` |
| `updateStatus` | `arrow` | Updates Status state or persisted data. | `id: string, status: string` | `inferred` |
| `deleteOrder` | `arrow` | Removes Order data/resources. | `id: string` | `inferred` |

### `src/pages/dashboard/PlaceholderPage.tsx`
- **File purpose**: Dashboard route page: PlaceholderPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PlaceholderPage` | `arrow` | React component that renders PlaceholderPage UI. | `None` | `inferred` |

### `src/pages/dashboard/PlatformSettingsPage.tsx`
- **File purpose**: Dashboard route page: PlatformSettingsPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PlatformSettingsPage` | `arrow` | React component that renders PlatformSettingsPage UI. | `None` | `inferred` |
| `toStringRecord` | `arrow` | Helper function in PlatformSettingsPage supporting module behavior. | `value: unknown` | `Record<string, string>` |
| `sanitizeOverrideRecord` | `arrow` | Helper function in PlatformSettingsPage supporting module behavior. | `record: Record<string, string>` | `Record<string, string>` |
| `fetchCatalogMeta` | `arrow` | Fetches CatalogMeta data from store or backend. | `None` | `inferred` |
| `handleToggle` | `arrow` | Event handler for Toggle interactions. | `key: string, value: boolean` | `inferred` |
| `handleSaveField` | `arrow` | Event handler for SaveField interactions. | `data: Parameters<typeof updateSettings>[0]` | `inferred` |
| `prettyTypeName` | `arrow` | Helper function in PlatformSettingsPage supporting module behavior. | `value: string` | `inferred` |

### `src/pages/dashboard/SettingsPage.tsx`
- **File purpose**: Dashboard route page: SettingsPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `SettingsPage` | `arrow` | React component that renders SettingsPage UI. | `None` | `inferred` |
| `insertEmoji` | `arrow` | Helper function in SettingsPage supporting module behavior. | `emoji: string` | `inferred` |
| `handleSave` | `arrow` | Event handler for Save interactions. | `None` | `inferred` |

### `src/pages/ForgotPassword.tsx`
- **File purpose**: Top-level route page: ForgotPassword.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `ForgotPassword` | `arrow` | React component that renders ForgotPassword UI. | `None` | `inferred` |
| `handleSubmit` | `arrow` | Event handler for Submit interactions. | `e: React.FormEvent` | `inferred` |

### `src/pages/HelpCenter.tsx`
- **File purpose**: Top-level route page: HelpCenter.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `HelpCenter` | `arrow` | React component that renders HelpCenter UI. | `None` | `inferred` |

### `src/pages/Index.tsx`
- **File purpose**: Top-level route page: Index.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Index` | `arrow` | React component that renders Index UI. | `None` | `inferred` |

### `src/pages/Login.tsx`
- **File purpose**: Top-level route page: Login.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Login` | `arrow` | React component that renders Login UI. | `None` | `inferred` |
| `handleSubmit` | `arrow` | Event handler for Submit interactions. | `e: React.FormEvent` | `inferred` |

### `src/pages/NotFound.tsx`
- **File purpose**: Top-level route page: NotFound.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `NotFound` | `arrow` | React component that renders NotFound UI. | `None` | `inferred` |

### `src/pages/PrivacyPolicy.tsx`
- **File purpose**: Top-level route page: PrivacyPolicy.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PrivacyPolicy` | `arrow` | React component that renders PrivacyPolicy UI. | `None` | `inferred` |

### `src/pages/PublicProfile.tsx`
- **File purpose**: Top-level route page: PublicProfile.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PublicProfile` | `arrow` | React component that renders PublicProfile UI. | `None` | `inferred` |
| `fetchData` | `arrow` | Fetches Data data from store or backend. | `None` | `inferred` |
| `subscribeToChanges` | `arrow` | Helper function in PublicProfile supporting module behavior. | `None` | `inferred` |
| `Loader2` | `arrow` | React component that renders Loader2 UI. | `{ className }: { className?: string }` | `inferred` |

### `src/pages/PublicServices.tsx`
- **File purpose**: Top-level route page: PublicServices.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `PublicServices` | `arrow` | React component that renders PublicServices UI. | `None` | `inferred` |
| `fetchData` | `arrow` | Fetches Data data from store or backend. | `None` | `inferred` |
| `getBtnRadius` | `arrow` | Returns BtnRadius computed data. | `None` | `inferred` |

### `src/pages/Register.tsx`
- **File purpose**: Top-level route page: Register.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `Register` | `arrow` | React component that renders Register UI. | `None` | `inferred` |
| `handleSubmit` | `arrow` | Event handler for Submit interactions. | `e: React.FormEvent` | `inferred` |

### `src/pages/StatusPage.tsx`
- **File purpose**: Top-level route page: StatusPage.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `StatusPage` | `arrow` | React component that renders StatusPage UI. | `None` | `inferred` |

### `src/pages/TermsOfService.tsx`
- **File purpose**: Top-level route page: TermsOfService.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `TermsOfService` | `arrow` | React component that renders TermsOfService UI. | `None` | `inferred` |

### `src/stores/appearanceStore.ts`
- **File purpose**: Appearance/theme state store and persistence layer.

| Function | Kind | Purpose | Parameters | Return Type |
|---|---|---|---|---|
| `dbToSettings` | `arrow` | Helper function in appearanceStore supporting module behavior. | `row: Record<string, unknown>` | `AppearanceSettings` |
| `settingsToDb` | `arrow` | Sets TingsToDb state values. | `s: Partial<AppearanceSettings>` | `inferred` |

### `src/stores/authStore.ts`
- **File purpose**: Authentication and profile state store (Supabase Auth + profile table).
- **Functions**: None declared (types/constants/configuration module).

### `src/stores/cartStore.ts`
- **File purpose**: Zustand store module: CartStore.
- **Functions**: None declared (types/constants/configuration module).

### `src/stores/catalogStore.ts`
- **File purpose**: Catalog item state store for CRUD and bulk import flows.
- **Functions**: None declared (types/constants/configuration module).

### `src/stores/linksStore.ts`
- **File purpose**: Links CRUD state store and click tracking logic.
- **Functions**: None declared (types/constants/configuration module).

### `src/stores/platformStore.ts`
- **File purpose**: Platform-wide settings store consumed by admin and public UI.
- **Functions**: None declared (types/constants/configuration module).

### `src/test/example.test.ts`
- **File purpose**: Example.Test module/file.
- **Functions**: None declared (types/constants/configuration module).

### `src/test/setup.ts`
- **File purpose**: Setup module/file.
- **Functions**: None declared (types/constants/configuration module).

### `src/vite-env.d.ts`
- **File purpose**: Vite Env.D module/file.
- **Functions**: None declared (types/constants/configuration module).

### `supabase/functions/contact-notify/index.ts`
- **File purpose**: Supabase Edge Function endpoint: contact-notify.
- **Functions**: None declared (types/constants/configuration module).

### `supabase/functions/generate-background/index.ts`
- **File purpose**: Supabase Edge Function endpoint: generate-background.
- **Functions**: None declared (types/constants/configuration module).

### `supabase/functions/generate-theme/index.ts`
- **File purpose**: Supabase Edge Function endpoint: generate-theme.
- **Functions**: None declared (types/constants/configuration module).

### `supabase/functions/landing-chat/index.ts`
- **File purpose**: Supabase Edge Function endpoint: landing-chat.
- **Functions**: None declared (types/constants/configuration module).

### `supabase/functions/low-stock-notify/index.ts`
- **File purpose**: Supabase Edge Function endpoint: low-stock-notify.
- **Functions**: None declared (types/constants/configuration module).

### `supabase/functions/order-notify/index.ts`
- **File purpose**: Supabase Edge Function endpoint: order-notify.
- **Functions**: None declared (types/constants/configuration module).

### `tailwind.config.ts`
- **File purpose**: Tailwind design tokens and theme configuration.
- **Functions**: None declared (types/constants/configuration module).

### `vite.config.ts`
- **File purpose**: Vite build/dev-server configuration.
- **Functions**: None declared (types/constants/configuration module).

### `vitest.config.ts`
- **File purpose**: Vitest testing configuration.
- **Functions**: None declared (types/constants/configuration module).

## Appendix A: Non-Code File Inventory
> These files do not declare executable JS/TS functions but are part of the codebase context.

| File | Role |
|---|---|
| `.env` | .Env module/file. |
| `.env.example` | .Env module/file. |
| `.gitignore` | .Gitignore module/file. |
| `bun.lock` | Dependency lockfile. |
| `bun.lockb` | Dependency lockfile. |
| `components.json` | JSON configuration/data file. |
| `index.html` | Index module/file. |
| `package-lock.json` | JSON configuration/data file. |
| `package.json` | JSON configuration/data file. |
| `PROJECT_SUMMARY.md` | Documentation artifact. |
| `public/favicon.ico` | Static asset (image/icon). |
| `public/placeholder.svg` | Static asset (image/icon). |
| `public/robots.txt` | Robots module/file. |
| `README.md` | Documentation artifact. |
| `SOFTWARE_ARCHITECTURE_DOCUMENT.md` | Documentation artifact. |
| `src/App.css` | Stylesheet file. |
| `src/assets/analytics-preview.jpg` | Static asset (image/icon). |
| `src/assets/categories-illustration.jpg` | Static asset (image/icon). |
| `src/assets/hero-creator-cutout.png` | Static asset (image/icon). |
| `src/assets/hero-creator.jpg` | Static asset (image/icon). |
| `src/assets/hero-creators-global.png` | Static asset (image/icon). |
| `src/assets/hero-global-creative.png` | Static asset (image/icon). |
| `src/assets/hero-phone-mockup.png` | Static asset (image/icon). |
| `src/assets/theme-showcase.jpg` | Static asset (image/icon). |
| `src/index.css` | Stylesheet file. |
| `supabase/config.toml` | TOML configuration file. |
| `supabase/migrations/20260308122852_72ba0bf1-568d-46ec-ae2f-8d9a73118cf2.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308132427_bf51e39a-b326-4159-8999-26a7941a67e8.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308132805_c80b8e9f-d283-4a99-ab02-0c200bfc479f.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308133219_77e58037-d28f-4c38-afd0-2ca035899d73.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308133911_9ca03501-822c-4981-a7af-9aa3f18bc18c.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308134339_c8fb41e1-2cf0-4e28-b4b0-e7f23904e269.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308140859_5170af30-8619-4776-8de5-47497e03a4c7.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308141700_fd11ff67-e596-43bf-a8f6-db4506faa703.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308142334_70acf8fd-1eb8-40ba-a8db-4729e045dc31.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308142913_23ef8c7d-816f-442a-91d6-62b4c87178ed.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308143938_02e6180b-9459-44da-abe4-bee0c89947f3.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308160229_331dc433-293a-4c7e-b7c0-d6738b2352fd.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308161350_02b87d69-6def-496e-bd91-598d6330a249.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308192104_d391e210-caff-4236-8b6d-a91c780a5f0d.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308195528_fe8233c0-1cff-4bd6-90d3-d8521b2d6917.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308200730_5db2646f-46dd-42e1-be9e-f3a26c86b7c6.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308211134_6096ec08-be3a-4836-a5be-489e03f431d0.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308211302_9cb1ccae-c57c-42df-bec3-4d98eccefc24.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308211324_6a221347-2af6-4882-9700-bdedb51f7c07.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308214047_9a01b0cb-4cfa-4173-b7df-2c3cfb83868a.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308214536_3dfa5449-eaa1-4c84-8717-ef72cec06264.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308222923_a2246500-3430-40fc-9cf0-61faba062835.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308223234_0ffd8b41-11b1-4427-af23-e04e50b56f7e.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308223302_ca435865-db87-4dcc-bdee-17150eb4ac4c.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260308232447_835b80d0-a014-44ee-b2b7-a51f501586b0.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260311204000_add_social_stats.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260311210000_refine_catalog_and_stats.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260312053000_add_checkout_cta_config_to_platform_settings.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `supabase/migrations/20260312061000_add_category_and_item_type_label_overrides.sql` | Database migration script (schema/RLS/trigger/function updates). |
| `system-info/admin-guide.md` | Documentation artifact. |
| `system-info/api-documentation.md` | Documentation artifact. |
| `system-info/architecture.md` | Documentation artifact. |
| `system-info/credentials.md` | Documentation artifact. |
| `system-info/database-schema.md` | Documentation artifact. |
| `system-info/deployment-guide.md` | Documentation artifact. |
| `system-info/environment-variables.md` | Documentation artifact. |
| `system-info/product-prd.md` | Documentation artifact. |
| `system-info/tech-stack.md` | Documentation artifact. |
| `system-info/technical-reference.md` | Documentation artifact. |
| `tsconfig.app.json` | JSON configuration/data file. |
| `tsconfig.json` | JSON configuration/data file. |
| `tsconfig.node.json` | JSON configuration/data file. |
