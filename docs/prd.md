# Product Requirements Document (PRD)
## Orylo MVP - Fraud Detection Platform

**Document Version**: 1.0  
**Date**: 12 Janvier 2026  
**Author**: John (Product Manager)  
**Status**: ✅ APPROVED FOR EXECUTION

---

## Table des Matières

1. [Goals and Background Context](#goals-and-background-context)
2. [Requirements](#requirements)
3. [UI Design Goals](#ui-design-goals)
4. [Epic List](#epic-list)
5. [Epic 1: Stripe Integration & Detection API](#epic-1-stripe-integration--detection-api)
6. [Epic 2: Dashboard Action-First Experience](#epic-2-dashboard-action-first-experience)
7. [Epic 3: Integration & Production Readiness](#epic-3-integration--production-readiness)
8. [Checklist Results Report](#checklist-results-report)
9. [Next Steps](#next-steps)

---

## Goals and Background Context

### Business Goals (6-Week MVP Timeline)

**Primary Goal**: Launch beta avec 15 e-commerce merchants, valider detection accuracy ≥85%, prouver value proposition (save ≥€30K/year per merchant).

**Success Metrics**:
- ✅ 15 beta signups (Goal: Week 7)
- ✅ 10 active users week 4 of beta
- ✅ Detection rate ≥85% (manual ground truth validation)
- ✅ False positive rate <10% (user feedback)
- ✅ Conversion Free → Standard: 30% (post-beta)
- ✅ NPS: 50+ (beta survey)
- ✅ Dashboard performance: <2s load, P95 latency <350ms

### Target Users (Personas)

**Persona 1: Marie - Merchant Operations Manager**
- Rôle : Supervise 500-2000 transactions/jour
- Pain point : 77% false positives = wasted time reviewing legitimate transactions
- Goal : Reduce review queue by 60%, save 10h/week

**Persona 2: Thomas - Fraud Analyst**
- Rôle : Configure fraud rules, investigate patterns
- Pain point : Static rules miss evolving fraud patterns
- Goal : Real-time detection, data-driven insights

**Persona 3: Sophie - E-commerce Founder**
- Rôle : 10-50 transactions/jour, no dedicated fraud team
- Pain point : Losing €50K/year to chargebacks
- Goal : Automated fraud protection, zero manual work

### Background Context (From Brief)

**Problem Statement**: E-commerce merchants lose €191B/year to payment fraud, yet 77% of transactions flagged by traditional systems are false positives. Current solutions (Stripe Radar, Sift) are expensive (€500-5000/month), slow (detection after payment), and require manual rule tuning.

**Proposed Solution**: Orylo = Stripe-native fraud detection platform with:
- Real-time API-based detection (webhook-triggered)
- Trust score system (learning from merchant behavior)
- One-click actions (block, whitelist, custom rules)
- Transparent pricing (Free beta, €99/month Standard, €399/month Pro)

**MVP Scope**: 3 core screens (Dashboard Feed, Block Flow, Mobile), 7 detectors (velocity, geolocation, trust score, IP reputation, device fingerprint, payment patterns, chargeback history), Stripe-only integration, single-user accounts.

---

## Requirements

### Functional Requirements (Descoped from 14 → 10 for 6-week timeline)

#### ✅ MVP Scope (Sprint 1-5)

**FR1**: Stripe OAuth connection (Story 1.1)
**FR2**: Webhook-triggered detection pipeline (Story 1.2)
**FR3**: Real-time detection API <350ms P95 (Story 1.3)
**FR4**: 7 fraud detectors parallel execution (Story 1.4-1.5)
**FR5**: Trust score system (Story 1.6)
**FR6**: Custom rules engine (Story 1.7)
**FR7**: Dashboard feed with filters (Story 2.1-2.6)
**FR8**: One-click block/whitelist actions (Story 2.7-2.9)
**FR9**: Server-Sent Events real-time updates (Story 2.10)
**FR10**: Mobile responsive (Story 2.11-2.12)

#### 🚫 Post-MVP (Descoped to protect timeline)

**FR11**: Trust Scores UI page (separate screen) → Post-MVP
**FR12**: Refund & Block combined action → Post-MVP (complexity risk)
**FR13**: Trust score auto-update on chargebacks → **RESCOPED to Story 3.2** (webhook only, no UI)
**FR14**: Team member invitations → Post-MVP (multi-user auth complexity)

### Non-Functional Requirements (Adjusted from original)

**NFR1**: Latency P95 <350ms (adjusted from 200ms - more feasible)
**NFR2**: Detection rate ≥85% (adjusted from 92% - realistic MVP target)
**NFR3**: False positive rate <10% (maintained)
**NFR4**: Availability 99.5% (maintained, Vercel SLA)
**NFR5**: Multi-tenancy via Better Auth Organizations (maintained)
**NFR6**: Budget €300/month infrastructure (maintained: Vercel €20, Neon €20, Upstash €15, Stripe dev mode free, Resend €15 optional)
**NFR7**: Security: HTTPS-only, session tokens, env vars secured (maintained)
**NFR8**: GDPR: 90-day data retention, right to deletion (maintained)
**NFR9**: PCI: No card numbers stored (Stripe tokens only) (maintained)
**NFR10**: Observability: tslog structured logging (maintained)
**NFR11**: Type safety: TypeScript strict mode, branded types (maintained)
**NFR12**: Analytics: PostHog events tracking (maintained)
**NFR13**: Error tracking: Vercel logs (Sentry optional if budget) (maintained)
**NFR14**: Testing: Unit ≥80% (fraud-engine), Integration ≥60% (API), E2E 5 paths (maintained)
**NFR15**: Mobile: iOS Safari + Android Chrome support (maintained)
**NFR16**: Idempotency: Webhook replay protection (maintained)

---

## UI Design Goals

### Design Principles

**1. Action-First Experience**
- Primary CTA: "Block" button visible, one-click
- Secondary actions: Whitelist, View Details (progressive disclosure)
- Minimize clicks: Feed → Action = 1 click

**2. Shadcn UI Component Maximization**
- Utiliser 34/51 components disponibles dans `@components/ui/`
- Design system: oklch colors de `globals.css` (no custom colors)
- Composants mappés par écran (voir tableau ci-dessous)

**3. Mobile-First Responsive**
- Breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop)
- Touch targets: ≥44px (iOS guidelines)
- Navigation: Sheet hamburger menu (mobile), Sidebar (desktop)

**4. Real-Time Feedback**
- SSE: New detections appear instantly avec animation
- Toast: Action confirmations (3s display)
- Optimistic UI: Button disabled during API call

**5. Accessibility**
- Keyboard navigation: Tab order logical, Escape closes dialogs
- ARIA labels: All interactive elements labeled
- Color contrast: WCAG AA compliant (oklch colors validated)

### Shadcn Component Mapping (34/51 Components Used)

#### Feed Dashboard Screen (13 components)
- `Card` + `Card.Header` + `Card.Content` + `Card.Footer` → Detection cards
- `Badge` → Decision labels (BLOCK/ALLOW/REVIEW) + NEW variant "warning"
- `Button` → Primary actions (Block, Whitelist)
- `Select` → Filters (Decision, Date range)
- `Separator` → Visual dividers entre sections
- `Skeleton` → Loading states (feed initial load)
- `Spinner` → In-progress actions
- `Tooltip` → Hover info (detector scores, risk indicators)
- `ScrollArea` → Feed infinite scroll
- `Avatar` → Customer icons (fallback initials)
- `Kbd` → Keyboard shortcuts hints

#### Action Flows (8 components)
- `AlertDialog` → Block confirmation modal
- `Dialog` → Detection details (full info)
- `Sheet` → Mobile navigation drawer
- `Popover` → Quick actions menu (3-dot menu)
- `Label` → Form field labels
- `Checkbox` → "Remember preference" toggles
- `Switch` → Settings toggles
- `Sonner` (Toast) → Action feedback

#### Stats & Data Display (6 components)
- `Tabs` → Switch views (Today/Week/Month stats)
- `Table` → Tabular data (if needed post-MVP)
- `Progress` → Trust score bars
- `Slider` → Custom rule thresholds (Story 1.7)
- `Calendar` → Date range picker (filters)
- `Combobox` → Searchable selects

#### Navigation & Layout (4 components)
- `Sidebar` → Main navigation (desktop)
- `Breadcrumb` → Navigation hierarchy
- `NavigationMenu` → Top-level menu
- `Dropdown` → User account menu

#### Forms & Inputs (3 components)
- `Input` → Text fields (custom rules)
- `Textarea` → Multi-line inputs (notes)
- `Field` → Form field wrappers

**Unused Components (17)** : Accordion, AspectRatio, ButtonGroup, Calendar (duplicate), Carousel, Chart, Collapsible, Command, ContextMenu, Drawer, Empty, HoverCard, InputOTP, InputGroup, Menubar, Pagination, RadioGroup, Resizable, ToggleGroup, Toggle → Post-MVP ou not applicable MVP

### Color System (oklch from `globals.css`)

**Existants** :
- `--background`, `--foreground`, `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground` (BLOCK decision)
- `--success`, `--success-foreground` (ALLOW decision)
- `--border`, `--input`, `--ring`

**À ajouter** (Story 2.1 AC6) :
- `--warning`, `--warning-foreground` (REVIEW decision badge)

```css
/* globals.css - Ajout proposé */
:root {
  --warning: oklch(0.834 0.154 89.52); /* Yellow-500 */
  --warning-foreground: oklch(0.147 0.004 49.25);
}

.dark {
  --warning: oklch(0.712 0.143 84.42); /* Yellow-600 dark */
  --warning-foreground: oklch(0.147 0.004 49.25);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

**Badge Component Update** :

```typescript
// components/ui/badge.tsx - variant warning
const badgeVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "bg-destructive text-destructive-foreground",
        warning: "bg-warning text-warning-foreground", // NEW
        success: "bg-success text-success-foreground",
        // ...
      }
    }
  }
)
```

### Responsive Behavior

**Mobile (375px-767px)** :
- Navigation: Sheet hamburger (top-left)
- Feed: 1 column, cards stack vertically
- Stats: 2x2 grid (4 stat cards)
- Dialogs: Full-screen modals
- Actions: Full-width buttons

**Desktop (1024px+)** :
- Navigation: Sidebar (left, 240px)
- Feed: 1 column (centered 720px max-width)
- Stats: 1x4 horizontal row
- Dialogs: Centered modals (max 600px width)
- Actions: Inline buttons (auto-width)

---

## Epic List

### Epic 1: Stripe Integration & Detection API
**Timeline**: Sprint 1-2 (Week 2-3, 10 jours ouvrés)  
**Stories**: 7 stories  
**Goal**: Merchant connecte Stripe, webhook déclenche détection, résultat stocké DB.

### Epic 2: Dashboard Action-First Experience
**Timeline**: Sprint 3-4 (Week 4-5, 10 jours ouvrés)  
**Stories**: 12 stories  
**Goal**: Dashboard affiche feed real-time, actions one-click, mobile responsive.

### Epic 3: Integration & Production Readiness
**Timeline**: Sprint 5 (Week 6, 5 jours ouvrés)  
**Stories**: 10 stories  
**Goal**: Production deployment, tests E2E, beta documentation, monitoring.

**Total**: 29 stories sur 5 sprints (25 jours ouvrés + 1 semaine buffer)

---

## Epic 1: Stripe Integration & Detection API

**Epic Goal**: Établir l'intégration Stripe bout-en-bout avec OAuth, webhooks robustes, pipeline de détection modulaire (7 detectors), trust score system, et custom rules engine. À l'issue de cet epic, chaque payment intent Stripe déclenche automatiquement une analyse fraud, résultat stocké en DB avec decision (BLOCK/ALLOW/REVIEW) et accessible via API.

### Story 1.1: Stripe OAuth Connection Flow

**As a** merchant,  
**I want** to connect my Stripe account via OAuth with one click,  
**so that** Orylo can access my payment data securely without manual API key management.

**Acceptance Criteria**:
- AC1: OAuth button "Connect Stripe" (Stripe Express pattern)
- AC2: Redirect to Stripe OAuth consent screen, scope: read-only payments
- AC3: Callback handler stores `stripe_account_id` in `organizations` table
- AC4: Success message: "Stripe connected successfully"
- AC5: Error handling: Invalid token → Retry flow, user-friendly error message
- AC6: Multi-tenancy: Each org isolated, no cross-org data leakage
- AC7: Session security: Better Auth session validated before OAuth redirect
- AC8: E2E test: Mock OAuth flow, verify DB record created

### Story 1.2: Stripe Webhook Configuration & Handler

**As a** system,  
**I want** to receive and verify Stripe webhooks for `payment_intent.created` events,  
**so that** every new transaction triggers fraud detection automatically.

**Acceptance Criteria**:
- AC1: Webhook endpoint: `POST /api/webhooks/stripe`
- AC2: Signature verification via `stripe.webhooks.constructEvent()`
- AC3: Event filter: Only process `payment_intent.created`
- AC4: Payload extraction: `payment_intent.id`, `amount`, `currency`, `customer`, `metadata`
- AC5: Async processing: Trigger detection engine, don't block webhook response
- AC6: Response: 200 OK within 2s (Stripe timeout = 30s)
- AC7: Error handling: 400 if invalid signature, 500 if internal error (Stripe will retry)
- AC8: Logging: Log every webhook received (INFO level)
- AC9: Integration test: Stripe CLI `stripe trigger payment_intent.created`

### Story 1.3: Fraud Detection API Endpoint

**As a** fraud detection system,  
**I want** a unified API endpoint that orchestrates all detectors and returns decision,  
**so that** webhook handler can call one function and get final result.

**Acceptance Criteria**:
- AC1: Function: `detectFraud(context: DetectionContext): Promise<DetectionResult>`
- AC2: Input: `DetectionContext` = payment intent data + customer data + metadata
- AC3: Output: `DetectionResult` = decision (BLOCK/ALLOW/REVIEW), risk_score (0-100), detector_results[], confidence (0-1)
- AC4: Decision logic: `risk_score ≥80 → BLOCK`, `20-79 → REVIEW`, `<20 → ALLOW`
- AC5: Performance: P95 latency <350ms (measured via logging timestamps)
- AC6: Error handling: If detector crashes → log error, continue with other detectors (partial detection)
- AC7: Database write: Store `fraud_detections` record with all results
- AC8: Unit test: Mock detectors, verify decision logic correct

### Story 1.4: Velocity Detector (transactions per timeframe)

**As a** fraud detection engine,  
**I want** to flag customers making unusually high transaction counts per hour,  
**so that** card testing attacks are detected.

**Acceptance Criteria**:
- AC1: Query: Count transactions from this `customerId` in last 1 hour (Redis cached)
- AC2: Thresholds: `>10 tx/hour → HIGH risk (score +40)`, `5-10 → MEDIUM (+20)`, `<5 → LOW (+0)`
- AC3: Redis key: `velocity:{customerId}:{hour}` (TTL 1 hour)
- AC4: Metadata: Return `{txCount, timeframe: '1h', threshold: 10}`
- AC5: Edge case: First transaction → velocity = 0 (no false positive)
- AC6: Performance: <10ms (Redis in-memory lookup)
- AC7: Unit test: Mock Redis, verify thresholds correct

### Story 1.5: Geolocation Detector (IP country vs card country)

**As a** fraud detection engine,  
**I want** to flag mismatches between customer IP country and card billing country,  
**so that** cross-border fraud is detected.

**Acceptance Criteria**:
- AC1: Extract: `payment_intent.charges[0].billing_details.address.country` (card country)
- AC2: Lookup: Customer IP → Country via GeoIP2 MaxMind DB (self-hosted, no API call)
- AC3: Logic: `ip_country != card_country → HIGH risk (score +30)`, `match → LOW (+0)`
- AC4: Exception: VPN detected → MEDIUM risk (+15) instead of HIGH (avoid false positives)
- AC5: Metadata: Return `{ipCountry, cardCountry, mismatch: true/false}`
- AC6: Performance: <5ms (local DB lookup)
- AC7: Unit test: Mock GeoIP data, verify mismatch logic

### Story 1.6: Trust Score System & Detector

**As a** merchant,  
**I want** customers to build trust scores over time based on behavior,  
**so that** repeat legitimate customers are never falsely blocked.

**Acceptance Criteria**:
- AC1: Table: `customer_trust_scores` (customerId, organizationId, score 0-100, updatedAt, metadata)
- AC2: Initial score: New customer = 50 (neutral)
- AC3: Score evolution:
  - Successful payment → +5 points
  - Chargeback → -50 points
  - Blocked transaction → -10 points
  - Whitelisted → Set to 90 (manual override)
- AC4: Detector logic: `score <30 → HIGH risk (+40)`, `30-70 → MEDIUM (+20)`, `>70 → LOW (+0)`
- AC5: Cache: Redis `trust:{organizationId}:{customerId}` (TTL 1h)
- AC6: Database update: Async after detection completes (don't block detection)
- AC7: Unit test: Verify score evolution rules

### Story 1.7: Custom Rules Engine (user-defined thresholds)

**As a** merchant,  
**I want** to define custom rules like "block if amount >€500 AND velocity >5",  
**so that** I can tailor detection to my business risk tolerance.

**Acceptance Criteria**:
- AC1: Table: `custom_rules` (organizationId, name, conditions JSON, action BLOCK/REVIEW, enabled boolean)
- AC2: Condition syntax: `{field: 'amount', operator: '>', value: 50000}` (cents)
- AC3: Operators supported: `>`, `<`, `=`, `!=`, `IN` (for categorical fields)
- AC4: Logical operators: `AND`, `OR` (evaluate AST)
- AC5: Execution: Run after detectors, apply matching rules
- AC6: Priority: Custom rules override detector decision if matched
- AC7: UI component: Slider + Input (Shadcn) for threshold configuration
- AC8: Performance: <10ms rule evaluation (max 10 rules per org)
- AC9: Unit test: Verify rule evaluation logic

---

## Epic 2: Dashboard Action-First Experience

**Epic Goal**: Créer le dashboard action-first avec feed real-time de détections, stats contextuelles, filtres pratiques, actions one-click (block/whitelist), Server-Sent Events pour mises à jour live, et version mobile responsive avec Sheet navigation. À l'issue de cet epic, le merchant peut surveiller et agir sur la fraude sans quitter le dashboard.

### Story 2.1: Feed Dashboard avec Detection Cards

**As a** merchant,  
**I want** to see a real-time feed of fraud detections with key info at a glance,  
**so that** I can quickly identify risky transactions.

**Acceptance Criteria**:
- AC1: Layout: Vertical feed, cards stack, most recent at top
- AC2: Card structure: Shadcn `Card` component
- AC3: Card content: Customer email/ID, Amount, Decision badge, Risk score, Timestamp, Primary CTA "Block"
- AC4: Badge variants: BLOCK (destructive), ALLOW (success), REVIEW (warning - NEW variant)
- AC5: Initial load: Fetch 20 most recent detections via `GET /api/detections?limit=20`
- AC6: Skeleton loading: Display 5 Skeleton cards during fetch
- AC7: Empty state: "No detections yet. Connect Stripe to get started."
- AC8: Pagination: Infinite scroll (load more on scroll bottom)
- AC9: Mobile: Cards full-width, touch-friendly
- AC10: Accessibility: Keyboard navigation, ARIA labels

### Story 2.2: Stats Cards (Contextual Metrics)

**As a** merchant,  
**I want** to see key metrics at the top of dashboard,  
**so that** I understand fraud trends at a glance.

**Acceptance Criteria**:
- AC1: Metrics displayed: Total Transactions, Blocked, At Risk (REVIEW), Total Saved (€)
- AC2: Layout: 1x4 horizontal row (desktop), 2x2 grid (mobile)
- AC3: Component: Shadcn `Card` per metric
- AC4: Calculation: Query `fraud_detections` table, filter by date range
- AC5: Total Saved: `SUM(amount WHERE decision = BLOCK)`
- AC6: Refresh: Auto-refresh every 30s (SSE update)
- AC7: Date range filter: Tabs "Today / Week / Month" (Shadcn `Tabs`)
- AC8: Loading state: Spinner during fetch

### Story 2.3: Filters (Decision, Date Range)

**As a** merchant,  
**I want** to filter detections by decision type or date,  
**so that** I can focus on specific subsets.

**Acceptance Criteria**:
- AC1: Filter 1: Decision (Shadcn `Select`) - Options: All, BLOCK, REVIEW, ALLOW
- AC2: Filter 2: Date range (Shadcn `Calendar`) - Presets: Today, Last 7 days, Last 30 days, Custom
- AC3: API: `GET /api/detections?decision=BLOCK&dateFrom=2026-01-01&dateTo=2026-01-12`
- AC4: UI update: Feed refreshes on filter change
- AC5: Reset button: Clear all filters → Show all detections
- AC6: URL state: Filters reflected in query params (shareable links)
- AC7: Performance: Filters applied server-side (DB query), not client-side

### Story 2.4: Detection Details Dialog

**As a** merchant,  
**I want** to view full detection details in a modal,  
**so that** I can understand why a transaction was flagged.

**Acceptance Criteria**:
- AC1: Trigger: Click detection card anywhere (not CTA button)
- AC2: Component: Shadcn `Dialog` (desktop), full-screen (mobile)
- AC3: Content sections: Customer Info, Transaction Details, Detector Results (7 detectors), Trust Score, Actions (Block/Whitelist)
- AC4: Detector Results: Table showing each detector's decision, risk contribution, metadata
- AC5: Trust Score: Progress bar (Shadcn `Progress`), current score / 100
- AC6: Close: Escape key, X button, click outside
- AC7: Accessibility: Focus trap, ARIA role="dialog"

### Story 2.5: Search & Sort (Optional MVP - Can defer)

**Status**: ⚠️ DEFERRED to post-MVP (protect timeline)

### Story 2.6: Mobile Navigation with Sheet

**As a** mobile user,  
**I want** a hamburger menu to access navigation,  
**so that** I can navigate without desktop sidebar.

**Acceptance Criteria**:
- AC1: Trigger: Hamburger icon (top-left, Lucide `Menu` icon)
- AC2: Component: Shadcn `Sheet` (slide-in from left)
- AC3: Content: Navigation links (Dashboard, Settings, Docs, Logout)
- AC4: Active state: Current page highlighted
- AC5: Close: Swipe left, X button, click outside, Escape key
- AC6: Animation: Smooth slide transition (300ms)
- AC7: Accessibility: Focus trap when open

### Story 2.7: Block Customer Action

**As a** merchant,  
**I want** to block a customer with one click,  
**so that** future transactions are auto-declined.

**Acceptance Criteria**:
- AC1: Button: "Block" (Shadcn `Button`, variant destructive)
- AC2: Confirmation: Shadcn `AlertDialog` - "Block this customer? Future transactions will be auto-declined."
- AC3: API: `POST /api/customers/[id]/block` → Update `customer_trust_scores.isBlacklisted = true`
- AC4: Optimistic UI: Button shows spinner, card grayed out immediately
- AC5: Success feedback: Toast (Shadcn `Sonner`) "Customer blocked successfully"
- AC6: Error handling: If API fails → Revert UI, show error toast
- AC7: Badge update: Detection badge changes to "Blacklisted"
- AC8: Cache invalidation: Clear Redis trust score cache
- AC9: E2E test: Click block → Verify DB updated, toast displayed

### Story 2.8: Whitelist Customer Action

**As a** merchant,  
**I want** to whitelist a trusted customer,  
**so that** their transactions are never flagged.

**Acceptance Criteria**:
- AC1: Button: "Whitelist" (Shadcn `Button`, variant secondary)
- AC2: Confirmation: AlertDialog - "Whitelist this customer? Future transactions will auto-approve."
- AC3: API: `POST /api/customers/[id]/whitelist` → Set `trust_score = 95`
- AC4: Optimistic UI: Button spinner, immediate visual feedback
- AC5: Success: Toast "Customer whitelisted"
- AC6: Badge update: Show "Whitelisted" badge
- AC7: Undo option: "Undo" button in toast (3s window)

### Story 2.9: Quick Actions Menu (3-dot)

**As a** merchant,  
**I want** secondary actions accessible via menu,  
**so that** UI stays clean but actions available.

**Acceptance Criteria**:
- AC1: Trigger: 3-dot icon (Lucide `MoreVertical`)
- AC2: Component: Shadcn `Popover` with action list
- AC3: Actions: View Details, Block, Whitelist, Add Note (post-MVP)
- AC4: Position: Align right, avoid overflow
- AC5: Close: Click outside, select action
- AC6: Keyboard: Arrow keys to navigate, Enter to select

### Story 2.10: Server-Sent Events (SSE) Real-Time Updates

**As a** merchant,  
**I want** new detections to appear instantly without refresh,  
**so that** I can react to fraud in real-time.

**Acceptance Criteria**:
- AC1: Endpoint: `GET /api/events` (SSE stream)
- AC2: Event types: `detection.created`, `detection.updated`
- AC3: Authentication: Verify session token in request headers
- AC4: Multi-tenancy: Only send events for user's organizationId
- AC5: Client: `EventSource` connection, auto-reconnect on disconnect
- AC6: UI update: New detection card prepended to feed avec animation (slide-in from top)
- AC7: Animation: Shadcn `tw-animate-css` fade-in + slide
- AC8: Performance: Max 100 concurrent SSE connections (rate limit)
- AC9: Heartbeat: Send ping every 30s to keep connection alive
- AC10: E2E test: Trigger webhook → Verify SSE event received → Card appears

### Story 2.11: Mobile Responsive Design

**As a** mobile user,  
**I want** the dashboard fully usable on phone,  
**so that** I can monitor fraud on the go.

**Acceptance Criteria**:
- AC1: Breakpoints: 375px (iPhone SE), 768px (iPad)
- AC2: Navigation: Sheet hamburger (not sidebar)
- AC3: Feed: Cards full-width, stack vertically
- AC4: Stats: 2x2 grid
- AC5: Dialogs: Full-screen modals
- AC6: Buttons: Full-width on mobile, tap targets ≥44px
- AC7: Filters: Vertical stack (not horizontal row)
- AC8: Tested browsers: iOS Safari, Android Chrome
- AC9: E2E test: Playwright viewport 375x667

### Story 2.12: Dark Mode Support (System Preference)

**As a** user,  
**I want** dark mode based on system preference,  
**so that** UI matches my OS theme.

**Acceptance Criteria**:
- AC1: Detection: CSS `prefers-color-scheme: dark`
- AC2: Colors: Use `globals.css` `.dark` oklch variables
- AC3: Toggle: System preference only (no manual toggle MVP - post-MVP)
- AC4: Components: All Shadcn components auto-adapt (built-in dark mode)
- AC5: Test: Verify both light and dark mode render correctly

---

## Epic 3: Integration & Production Readiness

**Epic Goal**: Finaliser l'intégration Stripe en production avec webhooks robustes (idempotency, retry logic, error handling), implémenter la mise à jour automatique des Trust Scores lors de chargebacks confirmés, établir la stack complète d'observability (logging, monitoring, alerting), et exécuter les tests end-to-end critiques validant les user journeys complets. L'epic inclut également l'optimisation des performances (latency <350ms P95, dashboard <2s load), la préparation du programme beta (documentation, Discord support, onboarding guide), et le déploiement production-ready sur Vercel avec toutes les configurations de sécurité et compliance (GDPR, PCI). À l'issue de cet epic, Orylo est prêt pour accueillir 15 beta users avec une solution stable, performante, et observable.

### Story 3.1: Production Webhooks avec Idempotency & Retry Logic

**Acceptance Criteria**:
- AC1: Idempotency via event.id deduplication (NFR16)
- AC2: Stripe signature verification renforcée
- AC3: Database transaction pour atomicité
- AC4: Retry logic avec exponential backoff
- AC5: Dead letter queue pour failed webhooks
- AC6: Webhook events expansion (`charge.succeeded`, `charge.failed`, `charge.dispute.created`)
- AC7: Performance monitoring per webhook type
- AC8: Integration test avec Stripe CLI

### Story 3.2: Trust Score Auto-Update sur Chargebacks

**Acceptance Criteria**:
- AC1: `charge.dispute.created` webhook handler
- AC2: Trust score penalty application (-50 points)
- AC3: Auto-blacklist logic pour repeat offenders (≥3 chargebacks)
- AC4: Metadata enrichment (lastChargebackDate, totalChargebacks)
- AC5: Cache invalidation
- AC6: Unit test trust score logic

### Story 3.3: Observability Stack - Logging, Monitoring, Alerting

**Acceptance Criteria**:
- AC1: tslog structured logging finalized
- AC2: Log levels configuration (INFO production, DEBUG dev)
- AC3: Vercel Analytics integration (API routes latency)
- AC4: PostHog events tracking (user_login, stripe_connected, customer_blocked, etc.)
- AC5: Error tracking avec Sentry (optional si budget)
- AC6: Alerting rules (email via Resend if budget)
- AC7: Health check endpoint enhancement (`/api/health`)
- AC8: Monitoring dashboard bookmarks

### Story 3.4: Performance Optimization (NFR1 <350ms P95)

**Acceptance Criteria**:
- AC1: Database query optimization (indexes, select specific columns)
- AC2: Redis caching strategy (trust scores TTL 1h, velocity TTL 5min)
- AC3: Detector parallelization validation (each <100ms)
- AC4: External API optimizations (self-hosted MaxMind GeoIP)
- AC5: Bundle size optimization frontend (<500KB)
- AC6: Image optimization (Next.js Image, WebP)
- AC7: Performance testing (Lighthouse CI: Performance ≥80, TTI <2s)
- AC8: Load testing webhooks (k6 or artillery: 10 req/s, P95 <350ms)
- AC9: Monitoring performance in production (Vercel Analytics)

### Story 3.5: Security & Compliance (GDPR, PCI)

**Acceptance Criteria**:
- AC1: Data retention policy implementation (delete >90 days)
- AC2: Right to deletion API (DELETE /api/customers/[id])
- AC3: Data export API (GET /api/customers/[id]/export)
- AC4: PCI compliance verification (no full card numbers)
- AC5: HTTPS only enforcement (Vercel automatic)
- AC6: Environment variables security (.env.local gitignored)
- AC7: Session security (Better Auth secure cookies)
- AC8: Privacy policy page (/app/privacy/page.tsx)

### Story 3.6: Integration Tests - API & Webhooks

**Acceptance Criteria**:
- AC1: Test setup avec test database (Neon branch or SQLite)
- AC2: Integration test: POST /api/webhooks/stripe (valid, duplicate, invalid sig)
- AC3: Integration test: GET /api/detections (filters, pagination)
- AC4: Integration test: POST /api/customers/[id]/block
- AC5: Integration test: Trust score update flow
- AC6: Test coverage integration (≥60% apps/web/app/api/**)
- AC7: CI/CD integration (GitHub Actions)

### Story 3.7: E2E Tests Critical User Journeys (Playwright)

**Acceptance Criteria**:
- AC1: Playwright setup (@playwright/test, chromium + webkit)
- AC2: E2E Test 1: Login → Dashboard happy path
- AC3: E2E Test 2: Block customer flow
- AC4: E2E Test 3: SSE real-time update
- AC5: E2E Test 4: Mobile responsive (375px viewport)
- AC6: E2E Test 5: Filters functionality
- AC7: Screenshots on failure
- AC8: CI/CD integration (run on Vercel preview)

### Story 3.8: Beta Program Preparation - Documentation & Support

**Acceptance Criteria**:
- AC1: README.md enrichi (value prop, features, installation, architecture)
- AC2: Beta Onboarding Guide (docs/beta-onboarding.md avec screenshots)
- AC3: Discord community setup (channels: announcements, general, bug-reports, feature-requests)
- AC4: Bug report template (.github/ISSUE_TEMPLATE/bug_report.md)
- AC5: Feature request template
- AC6: FAQ document (docs/faq.md)
- AC7: Beta recruitment email template (docs/beta-email-template.md)
- AC8: Feedback collection plan (Google Forms, weekly check-ins)

### Story 3.9: Production Deployment Configuration

**Acceptance Criteria**:
- AC1: Vercel project configuration (orylo-production, Next.js, root: apps/web)
- AC2: Environment variables configured (DATABASE_URL, REDIS_URL, BETTER_AUTH_*, STRIPE_*, LOG_LEVEL)
- AC3: Custom domain configuration (orylo.com, SSL auto-provisioned)
- AC4: Vercel deployment protection (main branch only, preview for others)
- AC5: Database production setup (Neon Scale tier, connection pooling, backups)
- AC6: Redis production setup (Upstash pay-as-you-go, TLS)
- AC7: Stripe production webhooks (endpoint configured, events subscribed)
- AC8: Monitoring & alerts setup (Vercel Analytics, PostHog, Sentry optional)
- AC9: Rollback plan documented (docs/rollback-procedure.md)

### Story 3.10: Beta Launch Checklist & Epic 3 Validation

**Acceptance Criteria**:
- AC1: Technical checklist (all stories completed, tests passing, performance validated, production deployed)
- AC2: Documentation checklist (README, onboarding guide, FAQ, privacy policy)
- AC3: Support channels checklist (Discord, bug templates)
- AC4: Beta recruitment checklist (email template, Reddit/Twitter outreach lists)
- AC5: Onboarding checklist (signup flow tested, Stripe OAuth tested)
- AC6: Smoke testing production (manual login, trigger webhook, block customer, mobile test)
- AC7: Beta user communication plan (announcement posts, weekly check-ins)
- AC8: Metrics tracking setup (beta KPIs dashboard)
- AC9: Contingency plans documented (backup recruitment, iteration plans)
- AC10: Launch decision gate (PM review, founder approval, GO/NO-GO)

---

## Checklist Results Report

### 1. User Focus ✅ PASS

**Evidence**:
- ✅ Chaque story commence par "As a [persona], I want [goal], so that [value]"
- ✅ 3 personas bien définis : Merchant Ops Manager, Fraud Analyst, E-commerce Founder
- ✅ User pain points explicites : "77% false positives", "losing €50K/year to chargebacks"
- ✅ Success metrics alignés user value : "Reduce false positive rate to <10%", "Save ≥€30K/year"

**Verdict**: **STRONG USER FOCUS** 🟢

### 2. Feasibility ✅ PASS (avec ajustements)

**Evidence**:
- ✅ Descoping validé : 4 features retirées (Trust Scores UI, Refund & Block, Team Invitations, advanced Filters)
- ✅ Timeline réaliste : 5 sprints de 1 semaine (5 jours ouvrés)
- ✅ Stack technique mature : Next.js 16, Drizzle, PostgreSQL, Better Auth, Stripe
- ✅ UI accélérée : 34/51 Shadcn components mappés, no custom design needed
- ⚠️ Risk mitigation : Detection accuracy ≥85% (was 92%) = more realistic
- ⚠️ Latency adjusted : P95 <350ms (was 200ms) = feasible sans optimization sprint

**Contingency Plans**:
- Si Sprint 2 déborde → Simplify filters to post-MVP
- Si E2E tests prennent >1 jour → Reduce to 3 critical paths
- Si Stripe OAuth setup complexe → Manual API key fallback for beta

**Verdict**: **FEASIBLE avec monitoring proactif** 🟡→🟢

### 3. Measurable Success ✅ PASS

**Metrics Tracking**:
- ✅ Beta Goal : 15 beta signups (PostHog event `user_login`)
- ✅ Engagement : 10 active users week 4 (PostHog weekly active users)
- ✅ Detection Rate : ≥85% (manual validation vs ground truth)
- ✅ False Positive Rate : <10% (user feedback survey)
- ✅ Performance : P95 <350ms (Vercel Analytics), Dashboard <2s (Lighthouse CI)
- ✅ Conversion : 30% Free → Standard (PostHog event `plan_upgraded` post-beta)
- ✅ NPS : 50+ (Google Form survey)

**Verdict**: **STRONG MEASURABILITY** 🟢

### 4. Risk Awareness ✅ PASS

**Identified Risks & Mitigation**:
- ✅ Risk 1 : Detection accuracy <85% → Iterate detectors based on beta feedback
- ✅ Risk 2 : Beta signups <10 → Backup channels (LinkedIn, Indie Hackers)
- ✅ Risk 3 : Performance degradation → Optimization sprint, monitoring alerts
- ✅ Risk 4 : Stripe OAuth complexity → Manual API key fallback
- ✅ Risk 5 : Scope creep → Post-MVP roadmap clear, protect 6-week timeline

**Contingency Budget**: 1 week buffer post-Sprint 5 for hotfixes before beta launch

**Verdict**: **COMPREHENSIVE RISK COVERAGE** 🟢

### 5. Alignment avec Goals ✅ PASS

| Brief Goal | PRD Epic/Story | Status |
|------------|----------------|--------|
| Merchants detect fraud real-time | Epic 1: Detection API + Webhooks | ✅ Delivered |
| Dashboard action-first UI | Epic 2: Feed + Actions + SSE | ✅ Delivered |
| Stripe-native integration | Epic 1: Stripe OAuth + Webhooks | ✅ Delivered |
| 15 beta users | Epic 3: Beta program + Documentation | ✅ Delivered |
| Validate detection accuracy | Epic 3: Ground truth validation | ✅ Delivered |
| Prove merchant value | Goals: €30K saved/year metric | ✅ Measured |
| GDPR + PCI compliance | Epic 3: Security & Compliance | ✅ Delivered |

**Verdict**: **100% GOAL ALIGNMENT** 🟢

### Overall PRD Quality Score

**Dimensions**:
- User Focus: 🟢 STRONG
- Feasibility: 🟢 ADJUSTED & REALISTIC
- Measurability: 🟢 COMPREHENSIVE
- Risk Awareness: 🟢 THOROUGH
- Goal Alignment: 🟢 PERFECT

**Final Score**: **5/5 PASS** ✅

**Recommendation**: **PRD APPROVED FOR EXECUTION** - Ready to hand off to UX Expert (wireframes) and Architect (technical design).

---

## Next Steps

### Phase 1: UX Design (UX Expert) - Week 1

**Prompt pour `/BMad/agents/ux-expert`**:

```
Bonjour Sarah (UX Expert) ! 👋

Le PRD pour Orylo MVP est validé (@docs/prd.md).

🎯 Votre mission : Créer les wireframes et design system pour les 3 écrans principaux :
1. Feed Dashboard (detection cards, stats, filters)
2. Block Customer Flow (AlertDialog confirmation)
3. Mobile responsive (Sheet navigation, 375px viewport)

📋 Contraintes :
- Utiliser TOUS les Shadcn components mappés (34 components @components/ui/)
- Respecter le design system oklch colors dans @globals.css
- Ajouter variant "warning" au Badge component (pour "REVIEW" decision)
- Design mobile-first, desktop-enhanced (pas d'UI desktop-only)
- Accessibilité : tap targets ≥44px, keyboard navigation, ARIA labels

📂 Deliverables attendus :
- Wireframes Figma ou Excalidraw (low-fi suffisant pour MVP)
- Component mapping document : Quel Shadcn component pour chaque UI element
- Design tokens audit : Confirmer colors, spacing, typography
- Interaction specs : SSE animation, dialog transitions, toast feedback

🔗 Références :
- PRD @docs/prd.md (Epic 2 Stories = UI specs détaillées)
- Shadcn components @components/ui/
- Design system @globals.css
- Personas @docs/brief.md Section 4

⏱️ Timeline : 2-3 jours (Week 1 Sprint 1)

Prêt·e à créer une UX action-first pour nos beta users ? 🚀
```

### Phase 2: Technical Architecture (Architect) - Week 1-2

**Prompt pour `/BMad/agents/architect`**:

```
Bonjour Alex (Architect) ! 👋

Le PRD Orylo MVP est validé (@docs/prd.md) et la stack technique POC existe déjà.

🎯 Votre mission : Raffiner l'architecture technique et créer les specs d'implémentation pour les 3 epics :

Epic 1 : Stripe Integration & Detection API (Sprint 1-2)
Epic 2 : Dashboard Action-First Experience (Sprint 3-4)
Epic 3 : Integration & Production Readiness (Sprint 5)

📋 Contraintes techniques :
- Monorepo Turborepo avec Bun (@orylo/web, @orylo/fraud-engine, @orylo/database)
- Next.js 16 App Router + Server Actions
- Better Auth avec Organizations plugin (multi-tenancy)
- Drizzle ORM + PostgreSQL (Neon Serverless)
- Upstash Redis (caching & rate limiting)
- Stripe webhooks avec idempotency + retry logic
- Performance NFR : P95 <350ms, Dashboard <2s
- Security NFR : GDPR compliant (90-day retention), PCI compliant (no card data)

📂 Deliverables attendus :
1. API Specs : Routes, request/response schemas (Zod), error handling
2. Database Schema : Drizzle migrations (4 tables: organizations, fraud_detections, customer_trust_scores, custom_rules)
3. Fraud Engine Architecture : Detector interfaces, scoring strategy, parallel execution
4. SSE Architecture : Real-time updates flow (webhook → event stream → dashboard)
5. Caching Strategy : Redis keys, TTLs, invalidation logic
6. Testing Strategy : Unit tests (fraud-engine ≥80%), Integration tests (API ≥60%), E2E tests (5 critical paths)
7. Deployment Architecture : Vercel (Next.js) + Neon (DB) + Upstash (Redis) + Stripe webhooks

🔗 Références :
- PRD @docs/prd.md (tous les 29 stories = specs fonctionnelles)
- POC existant : @packages/fraud-engine/, @packages/database/, @apps/web/lib/auth.ts
- ADRs @docs/architecture/adrs/ (10 ADRs = décisions déjà prises)
- System Overview @docs/architecture/system-overview.md

⏱️ Timeline : 3-4 jours (Week 1-2 Sprint 1)

Prêt à transformer ce PRD en architecture production-ready ? 🏗️
```

### Phase 3: Development Kickoff (Developer) - Week 2-6

**Prompt pour `/BMad/agents/dev` (after architecture ready)**:

```
Bonjour Mike (Developer) ! 👋

Le PRD (@docs/prd.md), wireframes, et architecture specs sont prêts.

🎯 Votre mission : Implémenter les 3 epics sur 5 sprints (6 semaines).

📋 Sprint Plan :
- Sprint 1 (Week 2) : Epic 1 Stories 1-4 (Stripe OAuth, webhooks, detection API)
- Sprint 2 (Week 3) : Epic 1 Stories 5-7 (detectors, trust scores, custom rules)
- Sprint 3 (Week 4) : Epic 2 Stories 1-6 (feed UI, stats, filters)
- Sprint 4 (Week 5) : Epic 2 Stories 7-12 (actions, SSE, mobile)
- Sprint 5 (Week 6) : Epic 3 Stories 1-10 (production readiness, tests, deployment)

🔗 Références :
- PRD @docs/prd.md (29 stories avec Acceptance Criteria détaillés)
- Architecture specs (from Architect)
- Wireframes (from UX Expert)
- POC codebase @packages/ et @apps/web/

⏱️ Timeline : 5 sprints = 6 semaines (25 jours ouvrés + 1 semaine buffer)

Prêt à builder Orylo MVP ? Let's ship it! 🚀
```

---

## 🎉 PRD COMPLET ET VALIDÉ

**Document Statistics**:
- **29 User Stories** réparties en 3 epics
- **5 Sprints** planifiés (6 semaines)
- **34/51 Shadcn Components** mappés
- **7 KPIs** mesurables
- **5 Risks** identifiés avec mitigation
- **Quality Score**: 5/5 PASS ✅

**Status**: **READY FOR EXECUTION** 🚀

---

*Document créé le 12 Janvier 2026 par John (Product Manager)*  
*Prochaine étape: Hand-off to UX Expert & Architect*
