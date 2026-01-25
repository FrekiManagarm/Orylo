# Orylo - Real-Time Fraud Detection for Stripe

> Orylo protège votre compte Stripe des fraudes que Radar laisse passer, grâce à une IA collective qui devient plus forte à chaque marchand protégé.

**Orylo is an AI-powered fraud detection platform for Stripe merchants. Get real-time alerts on suspicious transactions and take action with one click.**

## Overview

Orylo provides real-time fraud detection for Stripe merchants, helping you identify and block fraudulent transactions before they become chargebacks. Our AI-powered system analyzes multiple risk factors in parallel, delivering detection results in under 350ms.

## Features

- **7 AI Detectors**: Velocity, geolocation, trust score, amount anomaly, time-of-day, device fingerprint, BIN analysis
- **Real-Time Updates**: Server-Sent Events (SSE) push new detections instantly to your dashboard
- **Action-First**: Block or whitelist customers with one click
- **Trust Score System**: Adaptive scoring based on transaction history and chargebacks
- **Custom Rules**: Define your own fraud rules (Epic 4)
- **Multi-Tenant**: Supports multiple organizations with complete data isolation
- **Production-Ready**: Idempotent webhooks, retry logic, dead letter queue, observability stack

## Quick Start (Beta Users)

1. Sign up at [orylo.com](https://orylo.com) (beta access required)
2. Connect your Stripe account via OAuth
3. Configure webhook endpoint (automatic)
4. Start monitoring detections in real-time

For detailed setup instructions, see [Beta Onboarding Guide](./docs/beta-onboarding.md) (coming soon).

## 🏗️ Architecture

### Monorepo Structure

Monorepo Turborepo avec Bun comme gestionnaire de packages.

```
orylo/
├── apps/
│   └── web/              # Frontend Next.js 16
├── packages/
│   ├── fraud-engine/     # 🧠 Fraud Detection Engine
│   ├── database/         # 💾 Drizzle ORM schemas
│   └── ui/               # 🎨 Shadcn/ui components
└── docs/                 # 📚 Documentation
```

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn/ui
- **Backend**: Next.js API Routes, Better Auth, Drizzle ORM
- **Database**: Neon PostgreSQL (serverless)
- **Cache**: Upstash Redis
- **Observability**: Vercel Analytics, PostHog, tslog, Sentry (optional)
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Deployment**: Vercel
- **Monorepo**: Turborepo
- **Runtime**: Bun

### System Architecture

```
User Browser
    ↓
Next.js App (Vercel)
    ↓
┌─────────────────────────────────────┐
│  API Routes                         │
│  ├─ /api/detections (GET)          │
│  ├─ /api/customers/[id]/block      │
│  ├─ /api/webhooks/stripe (POST)    │
│  └─ /api/events (SSE stream)       │
└─────────────────────────────────────┘
    ↓                    ↓
Neon PostgreSQL      Redis Cache
    ↓
Stripe API (webhooks, payments)
```

### Fraud Detection Pipeline

1. **Webhook Ingestion**: Stripe sends `payment_intent.created` event
2. **Idempotency Check**: Verify event not already processed (Story 3.1)
3. **Detection**: 7 detectors run in parallel (<350ms target)
4. **Decision**: Aggregate scores → Allow/Review/Block
5. **Persistence**: Save detection to PostgreSQL
6. **Real-Time Push**: SSE broadcasts detection to connected clients
7. **Action**: Merchant can block/whitelist via dashboard

### Performance

- **P95 Latency**: <350ms (webhook → detection saved)
- **Detector Speed**: Each <100ms (parallel execution)
- **SSE Latency**: <500ms (detection created → UI update)
- **Bundle Size**: <500KB (frontend, optimized)
- **Database**: Indexed queries, selective column fetching
- **Cache**: Redis with 1h TTL for trust scores, 5min for velocity data

## 🚀 Quick Start

### Prérequis

- **Bun** >= 1.2.3
- **Node.js** >= 20.0.0
- **PostgreSQL** database (ou Neon serverless)

### Installation

```bash
# Installer les dépendances
bun install

# Copier le fichier d'environnement
cp apps/web/.env.example apps/web/.env

# Configurer votre DATABASE_URL dans apps/web/.env
```

### Développement

```bash
# Démarrer le dev server (tous les packages)
bun dev

# Démarrer uniquement le web app
bun --filter @orylo/web dev

# Build tous les packages
bun run build

# Linter
bun run lint

# Type-checking
bun run type-check
```

### Database

```bash
# Générer les migrations Drizzle
bun --filter @orylo/database db:generate

# Appliquer les migrations
bun --filter @orylo/database db:push

# Ouvrir Drizzle Studio
bun --filter @orylo/database db:studio
```

## 📦 Packages

### @orylo/fraud-engine

Engine de détection de fraude modulaire avec injection de dépendances.

**Features :**
- ✅ Interface `IDetector` pour extensibilité
- ✅ Branded types pour type-safety
- ✅ Stratégies de scoring pluggables
- ✅ Exécution parallèle des détecteurs
- ✅ Performance < 250ms garantie

### @orylo/database

Schémas Drizzle ORM pour PostgreSQL.

**Tables :**
- `organizations` - Multi-tenancy
- `fraud_detections` - Résultats de détection
- `customer_trust_scores` - Trust score par client
- `custom_rules` - Règles personnalisées

## 🧪 POC Validation

Pour valider que tout fonctionne :

```bash
# Démarrer le dev server
bun dev

# Ouvrir http://localhost:3000/demo
```

La page de démo montre :
- ✅ Import du package `@orylo/fraud-engine` dans Next.js
- ✅ Exécution du Fraud Detection Engine
- ✅ Résultats en temps réel

## 📚 Documentation

- [Architecture ADRs](./docs/architecture/adrs/)
- [Brainstorming Results](./docs/brainstorming-session-results.md)
- [GTM Strategy](./docs/gtm-strategy.md)

## 🛠️ Stack Technique

- **Framework:** Next.js 16 (App Router)
- **Runtime:** Bun
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM
- **Auth:** Better Auth (avec Organizations)
- **UI:** Shadcn/ui + Tailwind CSS v4
- **Payments:** Stripe
- **State:** Zustand + React Query
- **Background Jobs:** Trigger.dev
- **Monorepo:** Turborepo

## 🎯 Roadmap MVP (6 semaines)

- **Sprint 0 (S1):** Foundation ✅ POC validé !
- **Sprint 1-2 (S2-3):** 6 Detectors + Scoring
- **Sprint 3-4 (S4-5):** Dashboard UI
- **Sprint 5-6 (S6):** Beta testing

## Security & Compliance

- **PCI Compliant**: No full card numbers stored (only Stripe tokens: pi_xxx, cus_xxx)
- **GDPR Compliant**: 90-day data retention, right to deletion, data export API
- **Multi-Tenancy**: Row-level security, organizationId isolation
- **HTTPS Only**: Enforced via Vercel
- **Secure Sessions**: HttpOnly, Secure, SameSite cookies (Better Auth)
- **Data Encryption**: Database encryption at rest (Neon PostgreSQL)

## Contributing (Beta Phase)

We're currently in private beta. If you encounter bugs or have feature requests:

1. Check [existing issues](https://github.com/orylo/orylo/issues)
2. Use issue templates for [bug reports](.github/ISSUE_TEMPLATE/bug_report.md) or [feature requests](.github/ISSUE_TEMPLATE/feature_request.md)
3. Join our [Discord community](#) for support (beta invite required)

## Support

- **Discord**: [Join Beta Community](#) (invite-only during beta)
- **Email**: support@orylo.com
- **Documentation**: [docs.orylo.com](#) (coming soon)

## 📝 License

Proprietary - © 2026 Orylo (Beta - internal use only)
