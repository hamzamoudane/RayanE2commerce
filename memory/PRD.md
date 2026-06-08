# MALIN — Smart Everyday | PRD

## Original problem statement
Build a premium e-commerce frontend for "MALIN" — a curated marketplace of clever everyday gadgets (hidden-camera detectors, smart home, kitchen tools, streetwear, tech & gaming, digital products, second-hand items). Design must feel luxury/streetwear (Off-White / Dior / Apple Store / Dore & de Platine). Both light and dark themes. Frontend first, backend later. Stripe checkout integration deferred to backend phase.

## User choices
- Brand: **MALIN**
- Theme: Both dark + light with toggle (harmonious sub-themes)
- Implementation: Frontend only this iteration
- Payment: Stripe (deferred to backend phase, mocked for now)

## Architecture
- **Stack**: React 19 + React Router 7 + Tailwind 3 + Framer Motion 11 + Phosphor Icons + Sonner toasts
- **State**: ThemeContext (light/dark on `html.dark`, localStorage `malin.theme`) + CartContext (useReducer, persisted in `malin.cart.v1`)
- **No backend** — product catalogue in `src/data/products.js` (14 products, 7 categories)
- **Design system**: Bodoni Moda (serif) + Outfit (sans) + JetBrains Mono. Monochrome (#050505 / #F7F7F7). 1px sharp borders, zero border-radius, brutalist luxury

## Pages
1. `/` Home — Hero (Smart Everyday), Marquee, Collections tetris grid (7 tiles), Best Sellers, Brand Story, New Drops
2. `/shop` — Filters (category, max price, sort), 14 products grid
3. `/product/:id` — Asymmetric gallery, sticky info, quantity, add to cart with toast, similar products
4. `/cart` — Items list with qty controls, sticky summary (subtotal + shipping free above 200€ + total)
5. `/checkout` — Form (coordonnées, livraison, paiement) + Stripe placeholder + mock confirmation

## What's been implemented (Feb 2026)
- ✅ Complete frontend MVP (Home, Shop, Product, Cart, Checkout)
- ✅ Dark/Light theme toggle with persistence
- ✅ Cart context with localStorage persistence
- ✅ Cart drawer (slide-over) + dedicated cart page
- ✅ Product filters (category, price max), sort (curation/new/asc/desc)
- ✅ Responsive mobile-first (hamburger menu, single-column hero)
- ✅ Framer Motion animations (hero, scroll reveal on product cards, page transitions)
- ✅ Mock checkout flow with confirmation screen
- ✅ 14 products across 7 categories with rich data (specs, compare prices, badges)
- ✅ data-testid coverage on all interactive elements
- ✅ Tested end-to-end by testing subagent — 19/19 flows passed

## Prioritized backlog
### P0 — Backend phase (next)
- Backend FastAPI + MongoDB: product catalogue endpoints (`/api/products`, `/api/products/:id`)
- Real Stripe integration on `/checkout` (use existing testids `stripe-placeholder`, `checkout-submit`, `checkout-confirmation`)
- Order persistence in MongoDB
- Admin endpoints for product management

### P1 — Growth
- User accounts + wishlist (Emergent Google Auth + JWT)
- Search bar (currently icon-only)
- Real product images per item (custom photography or generated)
- SEO meta tags + Open Graph per product
- Affiliate / dropshipping integration (Amazon / AliExpress feeds)
- Email subscription pipeline (Resend / SendGrid)

### P2 — Polish
- Multi-language (EN, FR — currently FR)
- Product reviews + ratings
- Bundle / cross-sell on cart page
- Editorial journal / blog
