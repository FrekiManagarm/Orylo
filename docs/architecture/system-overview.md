# System Overview - Orylo V3

**Date:** 12 janvier 2026  
**Version:** 1.0

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js 16 App (@orylo/web)                  │   │
│  │  - Dashboard UI (Action-First)                       │   │
│  │  - Customer Management                               │   │
│  │  - Transaction Review                                │   │
│  │  - Settings & Rules                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  - Next.js API Routes                                        │
│  - Better Auth (Organizations)                               │
│  - Webhook handlers (Stripe)                                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRAUD ENGINE                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    @orylo/fraud-engine (Package Réutilisable)        │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  FraudDetectionEngine (Orchestrator)           │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                       │                               │   │
│  │        ┌──────────────┼──────────────┐               │   │
│  │        ▼              ▼              ▼               │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐           │   │
│  │  │Detector1│   │Detector2│   │Detector3│           │   │
│  │  │ (Impl)  │   │ (Impl)  │   │ (Impl)  │  ...      │   │
│  │  └─────────┘   └─────────┘   └─────────┘           │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  ScoringStrategy (Pluggable)                   │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        @orylo/database (Drizzle ORM)                 │   │
│  │                                                       │   │
│  │  Tables:                                             │   │
│  │  - organizations                                     │   │
│  │  - fraud_detections                                  │   │
│  │  - customer_trust_scores                             │   │
│  │  - custom_rules                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│              PostgreSQL (Neon Serverless)                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  - Stripe API (Payment Intents, Webhooks)                   │
│  - Redis/Upstash (Cache, Session Tracking)                  │
│  - Trigger.dev (Background Jobs, AI Explanation)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Principes d'Architecture

### 1. Injection de Dépendances
- **Interface `IDetector`** : Tous les detectors l'implémentent
- **Nouveau detector** : 1 fichier, implements IDetector, register()
- **Pas de refactoring** du engine lors de l'ajout

### 2. Multi-Tenancy Strict
- **Isolation par `organizationId`**
- Chaque query filtrée par org
- Better Auth Organizations plugin

### 3. Performance < 250ms P95
- Exécution parallèle des detectors (Promise.all)
- Early exit optimization (blacklist first)
- Cache Redis pour hot data
- In-memory cache pour custom rules

### 4. Type-Safety Maximale
- **Branded Types** : OrganizationId, PaymentIntentId, etc.
- Impossible de mélanger les IDs
- Compilation error si mauvais type

---

## 📦 Structure Monorepo

```
orylo/
├── apps/
│   └── web/                    # Next.js 16 App
│       ├── app/                # App Router
│       │   ├── (auth)/         # Auth pages
│       │   ├── (dashboard)/    # Dashboard protected
│       │   ├── api/            # API routes
│       │   └── demo/           # POC demo page
│       ├── components/         # React components
│       ├── lib/                # Utilities, auth
│       └── public/             # Static assets
│
├── packages/
│   ├── fraud-engine/           # 🧠 Core fraud detection
│   │   ├── src/
│   │   │   ├── interfaces/     # IDetector, IScoringStrategy
│   │   │   ├── types/          # Branded types, DetectionContext
│   │   │   ├── engine/         # FraudDetectionEngine
│   │   │   └── strategies/     # Scoring strategies
│   │   └── package.json
│   │
│   ├── database/               # 💾 Drizzle schemas
│   │   ├── src/schema/
│   │   │   ├── organizations.ts
│   │   │   ├── fraud-detections.ts
│   │   │   ├── customer-trust-scores.ts
│   │   │   └── custom-rules.ts
│   │   └── drizzle.config.ts
│   │
│   └── ui/                     # 🎨 Shadcn/ui components (future)
│
├── docs/                       # 📚 Documentation
│   ├── architecture/
│   │   └── adrs/               # Architecture Decision Records
│   ├── epics/                  # Epic descriptions
│   ├── user-stories/           # User stories
│   └── personas/               # User personas
│
└── turbo.json                  # Turborepo config
```

---

## 🔄 Flux de Détection de Fraude

### 1. Webhook Stripe Reçu

```typescript
POST /api/webhooks/stripe
  ↓
Vérification signature
  ↓
Event: payment_intent.created
  ↓
Extraction du context (amount, customer, card, etc.)
```

### 2. Exécution du Fraud Engine

```typescript
const context: DetectionContext = {
  organizationId,
  paymentIntentId,
  customerId,
  amount,
  currency,
  // ... autres données
};

const result = await fraudEngine.detect(context);
```

### 3. Exécution Parallèle des Detectors

```typescript
// Tous les detectors s'exécutent en parallèle
Promise.all([
  blacklistDetector.detect(context),
  cardTestingDetector.detect(context),
  geoVelocityDetector.detect(context),
  // ... autres detectors
])
  ↓
Agrégation des scores (ScoringStrategy)
  ↓
Décision finale: ALLOW | REVIEW | BLOCK
```

### 4. Actions Selon Décision

```typescript
if (decision === "BLOCK") {
  // Annuler le payment intent
  await stripe.paymentIntents.cancel(paymentIntentId);
  
  // Notifier le marchand
  await sendAlert(organizationId, "Fraude bloquée");
}

if (decision === "REVIEW") {
  // Mettre en attente pour review manuelle
  await createReviewTask(fraudDetection);
  
  // Notifier dashboard
  await sendNotification("Action requise");
}

// Toujours sauvegarder le résultat
await db.insert(fraudDetections).values({
  organizationId,
  paymentIntentId,
  decision,
  score,
  detectorResults,
  // ...
});
```

---

## 🔐 Sécurité & Authorization

### Multi-Tenancy

```typescript
// TOUJOURS filtrer par organizationId
const detections = await db
  .select()
  .from(fraudDetections)
  .where(eq(fraudDetections.organizationId, session.user.organizationId));
```

### Better Auth Organizations

- **Organization plugin** activé
- Chaque user appartient à une organization
- Session contient `user.organizationId`
- Middleware vérifie l'accès

---

## 📊 Observability

Voir [ADR-009: Observability Stack](./adrs/009-observability-stack.md)

- **Logs** : tslog structured logging
- **Tracing** : OpenTelemetry (future)
- **Metrics** : PostHog + custom metrics
- **Alerts** : Webhook → Notification

---

## 🚀 Deployment

Voir [ADR-001: Deployment Architecture](./adrs/001-deployment-architecture.md)

- **Frontend + API** : Vercel Edge Network
- **Database** : Neon Serverless PostgreSQL
- **Cache** : Upstash Redis
- **Background Jobs** : Trigger.dev
- **CDN** : Cloudflare

---

## 📚 Références

- [Architecture ADRs](./adrs/)
- [Brainstorming Session Results](../brainstorming-session-results.md)
- [GTM Strategy](../gtm-strategy.md)

---

**Dernière mise à jour** : 12 janvier 2026  
**Prochaine review** : Après Sprint 0
