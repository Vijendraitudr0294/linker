# Biotra — Product Requirements Document

## Product Vision
Biotra is a premium Link-in-Bio SaaS platform that empowers creators, businesses, and professionals to build a beautiful micro-website — combining links, catalogs, contact forms, and payments into one shareable page.

## Problem Statement
Creators and small businesses need a single, professional URL to share across social platforms. Existing solutions (Linktree, etc.) lack built-in commerce, customization depth, and analytics granularity.

## Target Users
- **Content Creators** — YouTubers, TikTokers, Instagram influencers
- **Small Businesses** — Restaurants, salons, freelancers
- **Professionals** — Consultants, coaches, portfolio owners
- **E-commerce Sellers** — Digital product creators, handmade goods sellers

## User Personas

### Persona 1: Creator Priya
- Age 24, Instagram influencer (50K followers)
- Needs: Beautiful page, social links, merch catalog, UPI payments
- Pain: Current tools look generic, no commerce built-in

### Persona 2: Business Owner Raj
- Age 35, runs a cloud kitchen
- Needs: Digital menu, order form, WhatsApp integration
- Pain: Maintaining a full website is expensive and overkill

### Persona 3: Freelancer Alex
- Age 28, UI designer
- Needs: Portfolio showcase, contact form, booking link
- Pain: Wants one URL that looks professional

## Core Features
1. **Link Management** — Add, reorder, toggle links with platform detection
2. **Appearance Customizer** — 65+ themes, custom colors, fonts, backgrounds, animated gradients
3. **Catalog/Marketplace** — Products, services, food menus with variants and inventory
4. **Order System** — Order forms, variant selection, UPI QR payments
5. **Contact Form** — Built-in messaging with email notifications
6. **Analytics** — Profile views, link clicks, catalog analytics, referrer tracking
7. **Admin Dashboard** — KPIs, user management, block/unblock, role management
8. **SEO Optimization** — Dynamic meta tags, OpenGraph, Twitter cards
9. **Embed Support** — YouTube, Spotify, Google Maps embeds
10. **Dark Mode** — Visitor-facing toggle on public profiles

## User Flows

### Registration → Profile Setup
1. User registers with email + password
2. Profile auto-created via database trigger
3. Redirected to dashboard overview with quick-start guide
4. User adds links → customizes appearance → shares URL

### Visitor Experience
1. Visitor opens /p/username
2. Sees styled profile with links, catalog, contact form
3. Can toggle dark mode
4. Can order items, send messages, click links

## Success Metrics
- Monthly Active Users (MAU)
- Profiles created per week
- Average links per profile
- Catalog orders per month
- Profile view-to-click ratio

## KPIs
| Metric | Target (3mo) | Target (6mo) | Target (12mo) |
|--------|-------------|-------------|--------------|
| Registered Users | 500 | 2,000 | 10,000 |
| Active Profiles | 300 | 1,200 | 6,000 |
| Monthly Orders | 100 | 1,000 | 10,000 |
| Avg Links/Profile | 4 | 6 | 8 |

## Monetization Model
- **Free Tier** — 5 links, basic themes, Biotra branding
- **Pro ($5/mo)** — Unlimited links, all themes, custom domain, no branding
- **Business ($15/mo)** — Catalog, orders, analytics, priority support

## Product Roadmap

### Phase 1 (0-3 months) ✅ CURRENT
- Core link management
- Theme customizer (65+ themes)
- Catalog & order system
- Contact form & messaging
- Admin dashboard
- Analytics

### Phase 2 (3-6 months)
- Custom domain support
- Stripe/Razorpay payment integration
- Email marketing integration
- A/B testing for link performance
- Team/agency accounts

### Phase 3 (6-12 months)
- Mobile app (React Native)
- API for third-party integrations
- Webhooks
- White-label solution
- Advanced analytics with AI insights

