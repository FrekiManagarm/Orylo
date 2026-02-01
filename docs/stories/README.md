# Orylo MVP - Story Index

**Project**: Orylo V3 - Stripe Fraud Detection Platform  
**Total Stories**: 30  
**Total Story Points**: 119 SP  
**Timeline**: 6 weeks (3 epics)  
**Last Updated**: 2026-01-13

---

## 📊 **Epic Overview**

| Epic | Stories | Story Points | Timeline | Status |
|------|---------|--------------|----------|--------|
| [Epic 1](#epic-1---stripe-integration--detection-api) | 7 | 39 SP | Sprint 1-2 (Week 2-3) | ✅ Complete |
| [Epic 2](#epic-2---dashboard-action-first-experience) | 15 | 66 SP | Sprint 3-4 (Week 4-5) | ✅ All Approved |
| [Epic 3](#epic-3---integration--production-readiness) | 10 | 37 SP | Sprint 5-6 (Week 6) | 📋 Ready |

**Total MVP**: **29 stories**, **126 story points**, **6 weeks** (Epics 1-3)  
**Total Post-MVP**: **33 stories**, **160 story points** (Epic 4: Sprints 6-7)

---

## Epic 1 - Stripe Integration & Detection API

**Goal**: Établir l'intégration Stripe bout-en-bout avec OAuth, webhooks robustes, pipeline de détection modulaire (7 detectors), trust score system, et custom rules engine.

**Timeline**: Sprint 1-2 (Week 2-3, 10 jours ouvrés)  
**Story Points**: 39 SP  
**File**: [docs/epics/epic-1-stripe-integration.md](../epics/epic-1-stripe-integration.md)

### Stories

| ID | Story | SP | Status | File |
|----|-------|----|----|------|
| 1.1 | [Stripe OAuth Connection Flow](#story-11-stripe-oauth-connection-flow) | 5 | ✅ Ready for Review | [1.1.stripe-oauth.md](1.1.stripe-oauth.md) |
| 1.2 | [Stripe Webhook Configuration & Handler](#story-12-stripe-webhook-configuration--handler) | 5 | ✅ Ready for Review | [1.2.stripe-webhooks.md](1.2.stripe-webhooks.md) |
| 1.3 | [Fraud Detection API Endpoint](#story-13-fraud-detection-api-endpoint) | 8 | ✅ Ready for Review | [1.3.fraud-detection-api.md](1.3.fraud-detection-api.md) |
| 1.4 | [Velocity Detector](#story-14-velocity-detector) | 5 | ✅ Ready for Review | [1.4.velocity-detector.md](1.4.velocity-detector.md) |
| 1.5 | [Geolocation Detector](#story-15-geolocation-detector) | 5 | ✅ Ready for Review | [1.5.geolocation-detector.md](1.5.geolocation-detector.md) |
| 1.6 | [Trust Score System & Detector](#story-16-trust-score-system--detector) | 8 | ✅ Ready for Review | [1.6.trust-score-detector.md](1.6.trust-score-detector.md) |
| 1.7 | [Custom Rules Engine](#story-17-custom-rules-engine) | 8 | ⚠️ Ready for Review | [1.7.custom-rules-engine.md](1.7.custom-rules-engine.md) |

**Epic 1 Total**: **7 stories**, **39 SP**  
**Completed**: **39/39 SP (100%)** 🎉

---

## Epic 2 - Dashboard Action-First Experience

**Goal**: Build real-time, action-first dashboard for merchants to monitor detections, block/whitelist customers, and react to fraud instantly via SSE updates.

**Timeline**: Sprint 3-4 (Week 4-5, 10 jours ouvrés)  
**Story Points**: 66 SP  
**File**: [docs/epics/epic-2-dashboard-experience.md](../epics/epic-2-dashboard-experience.md)

### Stories

| ID | Story | SP | Status | File |
|----|-------|----|----|------|
| 2.1 | [Feed Dashboard avec Detection Cards](#story-21-feed-dashboard-avec-detection-cards) | 5 | ✅ Approved | [2.1.feed-dashboard.md](2.1.feed-dashboard.md) |
| 2.2 | [Stats Cards (Contextual Metrics)](#story-22-stats-cards-contextual-metrics) | 3 | ✅ Approved | [2.2.stats-cards.md](2.2.stats-cards.md) |
| 2.3 | [Filters (Decision, Date Range)](#story-23-filters-decision-date-range) | 3 | ✅ Approved | [2.3.filters.md](2.3.filters.md) |
| 2.4 | [Detection Details Dialog](#story-24-detection-details-dialog) | 5 | ✅ Approved | [2.4.detection-details-dialog.md](2.4.detection-details-dialog.md) |
| 2.6 | [Mobile Navigation with Sheet](#story-26-mobile-navigation-with-sheet) | 3 | ✅ Approved | [2.6.mobile-navigation-sheet.md](2.6.mobile-navigation-sheet.md) |
| 2.7 | [Block Customer Action](#story-27-block-customer-action) | 5 | ✅ Approved | [2.7.block-customer-action.md](2.7.block-customer-action.md) |
| 2.8 | [Whitelist Customer Action](#story-28-whitelist-customer-action) | 5 | ✅ Approved | [2.8.whitelist-customer-action.md](2.8.whitelist-customer-action.md) |
| 2.9 | [Quick Actions Menu (3-dot)](#story-29-quick-actions-menu-3-dot) | 2 | ✅ Approved | [2.9.quick-actions-menu.md](2.9.quick-actions-menu.md) |
| 2.10 | [Server-Sent Events (SSE) Real-Time Updates](#story-210-server-sent-events-sse-real-time-updates) | 8 | ✅ Approved | [2.10.sse-real-time-updates.md](2.10.sse-real-time-updates.md) |
| 2.11 | [Mobile Responsive Design](#story-211-mobile-responsive-design) | 5 | ✅ Approved | [2.11.mobile-responsive-design.md](2.11.mobile-responsive-design.md) |
| 2.12 | [Dark Mode Support](#story-212-dark-mode-support-system-preference) | 2 | ✅ Approved | [2.12.dark-mode-support.md](2.12.dark-mode-support.md) |
| 2.13 | [Settings Page - Stripe Connection Management & Desktop Navigation](#story-213-settings-page---stripe-connection-management--desktop-navigation) | 5 | ✅ Approved | [2.13.settings-stripe-page.md](2.13.settings-stripe-page.md) |
| 2.14 | [Landing Page - Marketing & Conversion](#story-214-landing-page---marketing--conversion) | 5 | ✅ Approved | [2.14.landing-page.md](2.14.landing-page.md) |
| 2.15 | [SSE Production Improvements & Rate Limiting](#story-215-sse-production-improvements--rate-limiting) | 5 | 📋 Ready | [2.15.sse-production-improvements.md](2.15.sse-production-improvements.md) |

**Epic 2 Total**: **15 stories** (note: 2.5 skipped), **66 SP**

---

## Epic 3 - Integration & Production Readiness

**Goal**: Harden system for production: idempotency, retry logic, observability, performance optimization, security compliance, comprehensive testing, beta program prep, deployment configuration.

**Timeline**: Sprint 5-6 (Week 6, 5 jours ouvrés)  
**Story Points**: 37 SP  
**File**: [docs/epics/epic-3-production-readiness.md](../epics/epic-3-production-readiness.md)

### Stories

| ID | Story | SP | Status | File |
|----|-------|----|----|------|
| 3.1 | [Production Webhooks avec Idempotency & Retry Logic](#story-31-production-webhooks-avec-idempotency--retry-logic) | 5 | Draft | [3.1.production-webhooks-idempotency.md](3.1.production-webhooks-idempotency.md) |
| 3.2 | [Trust Score Auto-Update sur Chargebacks](#story-32-trust-score-auto-update-sur-chargebacks) | 3 | Draft | [3.2.trust-score-auto-update-chargebacks.md](3.2.trust-score-auto-update-chargebacks.md) |
| 3.3 | [Observability Stack - Logging, Monitoring, Alerting](#story-33-observability-stack---logging-monitoring-alerting) | 5 | Draft | [3.3.observability-stack.md](3.3.observability-stack.md) |
| 3.4 | [Performance Optimization (NFR1 <350ms P95)](#story-34-performance-optimization-nfr1-350ms-p95) | 5 | Draft | [3.4.performance-optimization.md](3.4.performance-optimization.md) |
| 3.5 | [Security & Compliance (GDPR, PCI)](#story-35-security--compliance-gdpr-pci) | 3 | Draft | [3.5.security-compliance-gdpr-pci.md](3.5.security-compliance-gdpr-pci.md) |
| 3.6 | [Integration Tests - API & Webhooks](#story-36-integration-tests---api--webhooks) | 5 | Draft | [3.6.integration-tests-api-webhooks.md](3.6.integration-tests-api-webhooks.md) |
| 3.7 | [E2E Tests Critical User Journeys (Playwright)](#story-37-e2e-tests-critical-user-journeys-playwright) | 5 | Draft | [3.7.e2e-tests-playwright.md](3.7.e2e-tests-playwright.md) |
| 3.8 | [Beta Program Preparation - Documentation & Support](#story-38-beta-program-preparation---documentation--support) | 3 | Draft | [3.8.beta-program-preparation.md](3.8.beta-program-preparation.md) |
| 3.9 | [Production Deployment Configuration](#story-39-production-deployment-configuration) | 3 | Draft | [3.9.production-deployment-config.md](3.9.production-deployment-config.md) |
| 3.10 | [Beta Launch Checklist & Epic 3 Validation](#story-310-beta-launch-checklist--epic-3-validation) | 3 | Draft | [3.10.beta-launch-checklist.md](3.10.beta-launch-checklist.md) |

**Epic 3 Total**: **10 stories**, **37 SP**

---

## Epic 4 - Système de Décisions Assisté par IA

**Goal**: Implémenter un système de décisions assisté par IA qui aide les marchands à prendre des décisions éclairées sur les transactions frauduleuses. L'epic inclut des suggestions IA pour whitelist/blacklist, des explications IA des décisions, des recommandations de règles custom, et un feedback loop.

**Timeline**: Post-MVP (Sprint 6-7, 10 jours ouvrés)  
**Story Points**: 34 SP  
**File**: [docs/epics/epic-4-ai-assisted-decisions.md](../epics/epic-4-ai-assisted-decisions.md)

### Stories

| ID | Story | SP | Status | File |
|----|-------|----|----|------|
| 4.1 | [Suggestions IA pour Whitelist/Blacklist](#story-41-suggestions-ia-pour-whitelistblacklist) | 8 | 📋 Draft | [4.1.ai-whitelist-blacklist-suggestions.md](4.1.ai-whitelist-blacklist-suggestions.md) |
| 4.2 | [Explications IA des Décisions de Fraude](#story-42-explications-ia-des-décisions-de-fraude) | 8 | 📋 Draft | [4.2.ai-fraud-explanations.md](4.2.ai-fraud-explanations.md) |
| 4.3 | [Recommandations de Règles Custom Personnalisées](#story-43-recommandations-de-règles-custom-personnalisées) | 8 | 📋 Draft | [4.3.ai-custom-rules-recommendations.md](4.3.ai-custom-rules-recommendations.md) |
| 4.4 | [Feedback Loop & Apprentissage des Overrides](#story-44-feedback-loop--apprentissage-des-overrides) | 10 | 📋 Draft | [4.4.ai-feedback-loop.md](4.4.ai-feedback-loop.md) |

**Epic 4 Total**: **4 stories**, **34 SP**

---

## 📝 **Story Summaries**

### Story 1.1: Stripe OAuth Connection Flow
**SP**: 5 | **Status**: Draft | **Epic**: 1

**User Story**: As a merchant, I want to connect my Stripe account via OAuth with one click, so that Orylo can access my payment data securely without manual API key management.

**Key AC**:
- OAuth button "Connect Stripe" (Stripe Express pattern)
- Redirect to Stripe OAuth consent screen, scope: read-only payments
- Callback handler stores `stripe_account_id` in `organizations` table
- Multi-tenancy: Each org isolated, no cross-org data leakage

---

### Story 1.2: Stripe Webhook Configuration & Handler
**SP**: 5 | **Status**: Draft | **Epic**: 1

**User Story**: As a system, I want to receive and verify Stripe webhooks for `payment_intent.created`, so that every payment triggers fraud detection automatically.

**Key AC**:
- Webhook endpoint: `POST /api/webhooks/stripe`
- Stripe signature verification (security requirement)
- Extract payment intent data (amount, customer, IP, card country)
- Trigger fraud detection engine (async via Trigger.dev)

---

### Story 1.3: Fraud Detection API Endpoint
**SP**: 8 | **Status**: Draft | **Epic**: 1

**User Story**: As a webhook handler, I want a unified detection API that orchestrates all fraud detectors, so that I get a final decision (BLOCK/ALLOW/REVIEW) with confidence score.

**Key AC**:
- Endpoint: `POST /api/detect` with FraudDetectionContext
- Orchestrate 7 detectors in parallel (<350ms P95)
- Apply scoring strategy (additive initially)
- Store result in `fraud_detections` table
- Return decision + risk score + confidence

---

### Story 1.4: Velocity Detector
**SP**: 5 | **Status**: Draft | **Epic**: 1

**User Story**: As a fraud engine, I want to detect velocity attacks (multiple transactions in short timeframe), so that card testing attacks are flagged.

**Key AC**:
- Detector: Count transactions per card/email/IP in last 1h/24h
- Thresholds: >5 txns/1h = HIGH, >3 txns/1h = MEDIUM
- Use Redis for fast lookups (TTL 1h)

---

### Story 1.5: Geolocation Detector
**SP**: 5 | **Status**: Draft | **Epic**: 1

**User Story**: As a fraud engine, I want to detect geolocation mismatches (IP country ≠ card billing country), so that suspicious location patterns are flagged.

**Key AC**:
- Self-hosted MaxMind GeoIP2 database
- Compare IP country vs card billing country
- Mismatch = HIGH risk (score +40)

---

### Story 1.6: Trust Score System & Detector
**SP**: 8 | **Status**: Draft | **Epic**: 1

**User Story**: As a fraud engine, I want a trust score system tracking customer behavior history, so that repeat customers with good history are trusted.

**Key AC**:
- Table: `customer_trust_scores` (score 0-100, last transaction date, total txns)
- New customer = 50 (neutral)
- Successful txn = +5, chargeback = -50, blacklisted = 0
- Cache in Redis (1h TTL)

---

### Story 1.7: Custom Rules Engine
**SP**: 8 | **Status**: Draft | **Epic**: 1

**User Story**: As a merchant, I want to define custom fraud rules (e.g., block if amount >€1000 from unknown customer), so that I can customize detection logic.

**Key AC**:
- Table: `custom_rules` (condition, threshold, action)
- Simple rule syntax: `amount > 1000 AND trust_score < 30 → BLOCK`
- Rules evaluated after detectors (override capability)

---

### Story 2.1: Feed Dashboard avec Detection Cards
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to see a real-time feed of fraud detections with key info at a glance, so that I can quickly identify risky transactions.

**Key AC**:
- Vertical feed, cards stack, most recent at top
- Card content: Customer email/ID, Amount, Decision badge, Risk score, Timestamp, Primary CTA "Block"
- Badge variants: BLOCK (destructive), ALLOW (success), REVIEW (warning - NEW variant)
- Infinite scroll pagination
- API secured with Better Auth session & multi-tenancy

**Highlight**: ⭐ Exemplary story - 10/10 validation score (Auth security added)

---

### Story 2.2: Stats Cards (Contextual Metrics)
**SP**: 3 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to see key metrics at the top of dashboard, so that I understand fraud trends at a glance.

**Key AC**:
- Metrics: Total Transactions, Blocked, At Risk (REVIEW), Total Saved (€)
- Layout: 1x4 horizontal row (desktop), 2x2 grid (mobile)
- Date range filter: Tabs "Today / Week / Month"

---

### Story 2.3: Filters (Decision, Date Range)
**SP**: 3 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to filter detections by decision type or date, so that I can focus on specific subsets.

**Key AC**:
- Filter 1: Decision (Shadcn `Select`) - Options: All, BLOCK, REVIEW, ALLOW
- Filter 2: Date range (Shadcn `Calendar`)
- URL state: Filters reflected in query params (shareable links)

---

### Story 2.4: Detection Details Dialog
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to view full detection details in a modal, so that I can understand why a transaction was flagged.

**Key AC**:
- Component: Shadcn `Dialog` (desktop), full-screen (mobile)
- Sections: Customer Info, Transaction Details, Detector Results (7 detectors), Trust Score, Actions

---

### Story 2.6: Mobile Navigation with Sheet
**SP**: 3 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a mobile user, I want a hamburger menu to access navigation, so that I can navigate without desktop sidebar.

**Key AC**:
- Trigger: Hamburger icon (Lucide `Menu` icon)
- Component: Shadcn `Sheet` (slide-in from left)
- Navigation links: Dashboard, Settings, Docs, Logout

---

### Story 2.7: Block Customer Action
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to block a customer with one click, so that future transactions are auto-declined.

**Key AC**:
- Button: "Block" (Shadcn `Button`, variant destructive)
- Confirmation: AlertDialog
- Update: `customer_trust_scores.isBlacklisted = true`
- Optimistic UI with rollback on error

---

### Story 2.8: Whitelist Customer Action
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to whitelist a trusted customer, so that their transactions are never flagged.

**Key AC**:
- Button: "Whitelist" (Shadcn `Button`, variant secondary)
- Update: Set `trust_score = 95`
- Undo option in toast (3s window)

---

### Story 2.9: Quick Actions Menu (3-dot)
**SP**: 2 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want secondary actions accessible via menu, so that UI stays clean but actions available.

**Key AC**:
- Trigger: 3-dot icon (Lucide `MoreVertical`)
- Component: Shadcn `Popover` with action list
- Actions: View Details, Block, Whitelist

---

### Story 2.10: Server-Sent Events (SSE) Real-Time Updates
**SP**: 8 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want new detections to appear instantly without refresh, so that I can react to fraud in real-time.

**Key AC**:
- Endpoint: `GET /api/events` (SSE stream)
- Event types: `detection.created`, `detection.updated`
- Multi-tenancy: Only send events for user's organizationId
- Animation: Slide-in from top for new cards

**Highlight**: ⭐ Excellent SSE implementation - 9.5/10 validation score

---

### Story 2.11: Mobile Responsive Design
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a mobile user, I want the dashboard fully usable on phone, so that I can monitor fraud on the go.

**Key AC**:
- Breakpoints: 375px (iPhone SE), 768px (iPad)
- Navigation: Sheet hamburger (not sidebar)
- Feed: Cards full-width, stack vertically
- Dialogs: Full-screen modals

---

### Story 2.12: Dark Mode Support (System Preference)
**SP**: 2 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a user, I want dark mode based on system preference, so that UI matches my OS theme.

**Key AC**:
- Detection: CSS `prefers-color-scheme: dark`
- Colors: Use `globals.css` `.dark` oklch variables
- No manual toggle (MVP scope - post-MVP)

---

### Story 2.13: Settings Page - Stripe Connection Management & Desktop Navigation
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a merchant, I want to access a settings page to manage my Stripe connection and navigate between pages with a desktop sidebar, so that I can view my connection status, reconnect if needed, and easily navigate between Dashboard and Settings.

**Key AC**:
- Settings page route: `/settings/stripe` accessible from navigation
- Display current Stripe connection status (Connected / Not Connected)
- "Connect Stripe" button using existing `StripeConnectButton` component
- Desktop navigation: Sidebar component integrated with navigation items
- Sidebar behavior: Collapsible on desktop, Sheet on mobile
- Active state: Current page highlighted in sidebar navigation
- Mobile responsive layout following dashboard patterns

---

### Story 2.14: Landing Page - Marketing & Conversion
**SP**: 5 | **Status**: ✅ Approved | **Epic**: 2

**User Story**: As a potential merchant, I want to see a compelling landing page that explains Orylo's value proposition and pricing, so that I can understand how Orylo protects my Stripe account and decide to sign up for a free trial.

**Key AC**:
- Hero section with headline from GTM positioning strategy
- Primary CTA "Start Free Trial" linking to login/signup
- Problem-Solution section highlighting Stripe Radar vs Orylo
- Features section showcasing 3 key differentiators
- Pricing section with 3 tiers (Free, Standard €99, Pro €399)
- Mobile responsive design with touch-friendly CTAs
- SEO optimization with meta tags and Open Graph
- Performance: Page load <2s, Lighthouse score ≥90

---

### Story 2.15: SSE Production Improvements & Rate Limiting
**SP**: 5 | **Status**: 📋 Ready | **Epic**: 2

**User Story**: As a system administrator, I want SSE connections to be rate-limited and monitored, so that the system can handle production load gracefully and prevent resource exhaustion.

**Key AC**:
- Rate limiting: Max 100 concurrent SSE connections per organization
- Connection tracking in Redis with TTL
- Graceful rejection: HTTP 429 when limit exceeded
- Support `detection.updated` events (when explanation generated, suggestion accepted)
- E2E tests for rate limiting

---

### Story 3.1: Production Webhooks avec Idempotency & Retry Logic
**SP**: 5 | **Status**: Draft | **Epic**: 3

**User Story**: As a system, I want production webhooks with idempotency and retry logic, so that webhook processing is reliable under all conditions.

**Key AC**:
- Idempotency via event.id deduplication
- Database transaction for atomicity
- Retry logic with exponential backoff (3 attempts)
- Dead letter queue for failed webhooks

---

### Story 3.2: Trust Score Auto-Update sur Chargebacks
**SP**: 3 | **Status**: Draft | **Epic**: 3

**User Story**: As a system, I want trust scores to auto-update when chargebacks occur, so that fraudulent customers are penalized automatically.

**Key AC**:
- `charge.dispute.created` webhook handler
- Trust score penalty: -50 points
- Auto-blacklist if totalChargebacks ≥ 3

---

### Story 3.3: Observability Stack - Logging, Monitoring, Alerting
**SP**: 5 | **Status**: Draft | **Epic**: 3

**User Story**: As a development team, I want comprehensive observability (logging, monitoring, alerting), so that we can debug issues and monitor system health in production.

**Key AC**:
- tslog structured logging
- Vercel Analytics integration
- PostHog events tracking
- Health check endpoint: `GET /api/health`

---

### Story 3.4: Performance Optimization (NFR1 <350ms P95)
**SP**: 5 | **Status**: Draft | **Epic**: 3

**User Story**: As a system, I want optimized performance across all layers, so that detection latency meets <350ms P95 target.

**Key AC**:
- Database query optimization (indexes, select specific columns)
- Redis caching strategy (trust scores 1h TTL, velocity 5min TTL)
- Detector parallelization validation
- Load testing with k6: 10 req/s sustained, P95 <350ms

---

### Story 3.5: Security & Compliance (GDPR, PCI)
**SP**: 3 | **Status**: Draft | **Epic**: 3

**User Story**: As a compliant platform, I want GDPR and PCI compliance implementations, so that we meet legal and security requirements.

**Key AC**:
- Data retention policy: Delete fraud_detections >90 days
- Right to deletion: `DELETE /api/customers/[id]`
- Data export: `GET /api/customers/[id]/export`
- PCI compliance: No full card numbers stored

---

### Story 3.6: Integration Tests - API & Webhooks
**SP**: 5 | **Status**: Draft | **Epic**: 3

**User Story**: As a development team, I want comprehensive integration tests for API and webhooks, so that we catch integration bugs before production.

**Key AC**:
- Test setup with test database
- Integration test: POST /api/webhooks/stripe (valid, duplicate, invalid sig)
- Integration test: GET /api/detections (filters, pagination)
- Coverage target: ≥60% for app/api/**

---

### Story 3.7: E2E Tests Critical User Journeys (Playwright)
**SP**: 5 | **Status**: Draft | **Epic**: 3

**User Story**: As a development team, I want E2E tests covering critical user journeys, so that we catch UI/UX bugs before production.

**Key AC**:
- Playwright setup (@playwright/test, chromium + webkit)
- E2E Test 1: Login → Dashboard happy path
- E2E Test 2: Block customer flow
- E2E Test 3: SSE real-time update
- E2E Test 4: Mobile responsive (375px viewport)

**Highlight**: ⭐ Comprehensive E2E strategy - 9.5/10 validation score

---

### Story 3.8: Beta Program Preparation - Documentation & Support
**SP**: 3 | **Status**: Draft | **Epic**: 3

**User Story**: As a beta program manager, I want complete documentation and support infrastructure, so that beta users have excellent onboarding experience.

**Key AC**:
- README.md enriched (value prop, features, installation)
- Beta Onboarding Guide (docs/beta-onboarding.md with screenshots)
- Discord community setup
- Bug report + feature request templates

---

### Story 3.9: Production Deployment Configuration
**SP**: 3 | **Status**: Draft | **Epic**: 3

**User Story**: As a deployment engineer, I want production deployment fully configured, so that we can deploy reliably to Vercel.

**Key AC**:
- Vercel project configuration
- Environment variables configured
- Custom domain: orylo.com (SSL auto-provisioned)
- Database & Redis production setup (Neon + Upstash)

---

### Story 3.10: Beta Launch Checklist & Epic 3 Validation
**SP**: 3 | **Status**: Draft | **Epic**: 3

**User Story**: As a product manager, I want a comprehensive beta launch checklist, so that we ensure everything is ready before going live.

**Key AC**:
- Technical checklist (all stories completed, tests passing)
- Documentation checklist (README, onboarding, FAQ)
- Support channels checklist (Discord, bug templates)
- GO/NO-GO decision gate

**Highlight**: ⭐ Excellent launch preparation - 9.5/10 validation score

---

### Story 4.1: Suggestions IA pour Whitelist/Blacklist
**SP**: 8 | **Status**: 📋 Draft | **Epic**: 4

**User Story**: As a merchant, I want to receive AI-powered suggestions for whitelisting or blacklisting customers based on historical patterns, so that I can make faster, more informed decisions while reducing false positives.

**Key AC**:
- System analyzes historical transaction patterns (successful payments, chargebacks, blocked transactions)
- AI suggests whitelist for customers with high trust score (>80) and multiple successful transactions
- AI suggests blacklist for customers with clear fraud patterns (card testing, multiple chargebacks)
- Suggestions displayed in dashboard with confidence score (0-1) and reasoning summary
- Merchant can accept/reject/modify suggestion with one click
- Performance: Suggestions generated <500ms (cached patterns)

---

### Story 4.2: Explications IA des Décisions de Fraude
**SP**: 8 | **Status**: 📋 Draft | **Epic**: 4

**User Story**: As a merchant, I want to understand why a transaction was flagged as fraudulent in plain French language, so that I can make informed decisions and learn from detection patterns.

**Key AC**:
- Explanation generated asynchronously after detection (non-blocking via Trigger.dev)
- LLM API call (OpenAI GPT-4o-mini or Anthropic Claude) with detection context
- Explanation includes: which detectors triggered, why they flagged, risk factors identified
- Language: French (with fallback to English if LLM unavailable)
- Performance: Generation <2s async (displayed progressively)
- Error handling: Fallback to template-based explanation if LLM fails

---

### Story 4.3: Recommandations de Règles Custom Personnalisées
**SP**: 8 | **Status**: 📋 Draft | **Epic**: 4

**User Story**: As a merchant, I want AI to suggest optimal custom rules based on my business context and transaction history, so that I can configure protection tailored to my specific needs without manual analysis.

**Key AC**:
- AI analyzes merchant's transaction patterns (amounts, frequencies, geolocations)
- AI identifies common fraud patterns specific to merchant's business
- Suggestions include: rule conditions (amount thresholds, velocity limits, geo restrictions)
- Merchant can preview rule impact before applying (estimated blocks/allowances)
- Applied rules tracked for effectiveness (success rate)
- Performance: Recommendations generated <1s (cached analysis)

---

### Story 4.4: Feedback Loop & Apprentissage des Overrides
**SP**: 10 | **Status**: 📋 Draft | **Epic**: 4

**User Story**: As a system, I want to track merchant overrides (accept/reject suggestions) and learn from them, so that future suggestions become more accurate and aligned with merchant preferences.

**Key AC**:
- Track all merchant actions on AI suggestions (accepted, rejected, modified)
- Store feedback in `ai_feedback` table with context (detection data, suggestion, action)
- Optional merchant reason field when rejecting suggestion
- Feedback data used to improve suggestion confidence scores
- A/B testing framework: Compare suggestion acceptance rates over time
- Dashboard metric: "AI Suggestion Accuracy" (acceptance rate)
- Privacy: Feedback data anonymized for model improvement (opt-in)

---

## 🎯 **Quick Reference**

### By Priority (Recommended Implementation Order)

**Sprint 1 (Week 2)**:
1. Story 1.1 - Stripe OAuth (Foundational)
2. Story 1.2 - Stripe Webhooks (Foundational)
3. Story 1.3 - Fraud Detection API (Core)

**Sprint 2 (Week 3)**:
4. Story 1.4 - Velocity Detector
5. Story 1.5 - Geolocation Detector
6. Story 1.6 - Trust Score System
7. Story 1.7 - Custom Rules Engine

**Sprint 3 (Week 4)**:
8. Story 2.1 - Feed Dashboard (Core UX)
9. Story 2.2 - Stats Cards
10. Story 2.7 - Block Customer Action
11. Story 2.8 - Whitelist Customer Action

**Sprint 4 (Week 5)**:
12. Story 2.3 - Filters
13. Story 2.4 - Detection Details Dialog
14. Story 2.9 - Quick Actions Menu
15. Story 2.10 - SSE Real-Time Updates
16. Story 2.11 - Mobile Responsive
17. Story 2.12 - Dark Mode
18. Story 2.6 - Mobile Navigation

**Sprint 5-6 (Week 6)**:
19. Story 3.1 - Production Webhooks (Hardening)
20. Story 3.2 - Trust Score Auto-Update
21. Story 3.3 - Observability Stack
22. Story 3.4 - Performance Optimization
23. Story 3.5 - Security & Compliance
24. Story 3.6 - Integration Tests
25. Story 3.7 - E2E Tests
26. Story 3.8 - Beta Program Prep
27. Story 3.9 - Production Deployment
28. Story 3.10 - Beta Launch Checklist

---

## 📈 **Metrics & Targets**

### Story Points Distribution

- **Epic 1**: 39 SP (31% of MVP total)
- **Epic 2**: 51 SP (40% of MVP total)
- **Epic 3**: 37 SP (29% of MVP total)
- **Epic 4**: 34 SP (Post-MVP)

### Quality Targets

- **Unit Test Coverage**: ≥80% for `@orylo/fraud-engine`
- **Integration Test Coverage**: ≥60% for `apps/web/app/api/**`
- **E2E Test Coverage**: 5 critical user journeys
- **Performance**: P95 latency <350ms for fraud detection
- **Detection Rate**: ≥85% (validated during beta)
- **False Positive Rate**: <10% (validated during beta)

### Success Criteria (Beta)

- **Beta Signups**: 15 users
- **Active Users (Week 4)**: 10 users
- **NPS Score**: 50+
- **Critical Bugs**: 0
- **Production Uptime**: >99%

---

## 🔗 **Related Documents**

- **Project Brief**: [docs/brief.md](../brief.md)
- **PRD**: [docs/prd.md](../prd.md)
- **Architecture**: [docs/architecture/system-overview.md](../architecture/system-overview.md)
- **UI/UX Spec**: [docs/front-end-spec.md](../front-end-spec.md)
- **Epics**:
  - [Epic 1](../epics/epic-1-stripe-integration.md)
  - [Epic 2](../epics/epic-2-dashboard-experience.md)
  - [Epic 3](../epics/epic-3-production-readiness.md)
  - [Epic 4](../epics/epic-4-ai-assisted-decisions.md)

---

## 📝 **Story Template**

All stories follow the template defined in `.bmad-core/templates/story-tmpl.yaml` with the following sections:

1. **Status**: Draft | Approved | InProgress | Review | Done
2. **Story**: User story (As a... I want... so that...)
3. **Acceptance Criteria**: Numbered list of testable criteria
4. **Tasks / Subtasks**: Checklist with AC references
5. **Dev Notes**: Technical context, architecture, API specs
6. **Testing**: Test strategy and standards
7. **Change Log**: Version history
8. **Dev Agent Record**: (Populated during implementation)
9. **QA Results**: (Populated after testing)

---

## 🚀 **Getting Started**

1. **Product Owner**: Review and approve stories before Sprint Planning
2. **Scrum Master**: Import stories to project management tool (Jira/Linear)
3. **Dev Team**: Start with Epic 1, Story 1.1
4. **QA Team**: Review testing sections, prepare test environments

---

**Questions?** Contact Sarah (Product Owner) or refer to the [User Guide](../../.bmad-core/user-guide.md).

---

**Last Updated**: 2026-01-26  
**Created by**: Sarah (Product Owner)  
**Validation Status**: ✅ Epic 2 Complete - All 11 Stories Approved (9.2/10 avg) 🎉  
**Epic 4 Status**: 📋 Draft - 4 Stories Created (Post-MVP)
