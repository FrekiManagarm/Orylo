# Orylo V3 - Anti-Fraud Platform

> Orylo protège votre compte Stripe des fraudes que Radar laisse passer, grâce à une IA collective qui devient plus forte à chaque marchand protégé.

## 🏗️ Architecture

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

## 📝 License

Proprietary - © 2026 Orylo
