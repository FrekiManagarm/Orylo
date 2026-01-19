# Orylo V3 - Project Brief

**Version** : 1.0  
**Date** : Janvier 2026  
**Product Owner** : Mathieu Chambaud  
**Status** : ✅ Ready for Development

---

## Executive Summary

**Orylo** est une **solution anti-fraude intelligente pour marchands Stripe** qui détecte **95%+ des fraudes en <250ms**, sans bloquer les clients légitimes.

### Le Problème
Les marchands Stripe perdent **2-5% de leur CA en fraudes** malgré Stripe Radar, qui ne détecte que 60-70% des cas. Les solutions actuelles (Sift, Signifyd) coûtent **500-2000€/mois** et sont trop complexes pour PME.

### La Solution
Orylo utilise une **détection multi-vecteurs** (6 détecteurs simultanés) et un **dashboard action-first** pour identifier et bloquer la fraude en temps réel. Installation en **5 minutes** via webhooks Stripe.

### Target Market
- **ICP** : E-commerce/SaaS sur Stripe, 10-100K€ CA/mois, 1-3% taux de fraude
- **TAM** : 50K+ marchands Stripe en France/Europe
- **Go-to-Market** : Freemium + content marketing (bootstrap)

### Business Model
- **Free** : 0€ (jusqu'à 10K€ CA/mois)
- **Standard** : 99€/mois (jusqu'à 100K€ CA/mois)
- **Pro** : 199€/mois (CA illimité + ML model)

### MVP Timeline
**6 semaines** (Janvier-Mars 2026) → Beta (15 users) → Launch officiel (Avril 2026)

### Key Metrics
- **Detection rate** : 95%+ (vs 70% Radar)
- **Latency** : <250ms P95
- **False positive rate** : <5%
- **Beta conversion** : 30% Free → Standard

---

## Problem Statement

### Context

Les **marchands Stripe** (e-commerce, SaaS, marketplaces) subissent des **pertes importantes dues à la fraude** :
- **2-5% du CA** perdu en chargebacks et transactions frauduleuses
- **15-20€ de frais** par chargeback (+ temps de gestion)
- **Impact psychologique** : stress constant, perte de confiance

**Stripe Radar**, la solution native de Stripe, ne suffit plus :
- Détecte seulement **60-70% des fraudes** (based on user testimonials)
- **Faux positifs** élevés : bloque clients légitimes (VPN, voyageurs internationaux)
- **Boîte noire** : impossible de personnaliser les règles ou whitelister des VIP
- **Réactif, pas proactif** : Les marchands découvrent la fraude via chargebacks 2-3 semaines après

### Pain Points (par ordre de sévérité)

#### 1. Détection Insuffisante (CRITIQUE)
**"Stripe Radar rate 30-40% des fraudes"**

- Radar se concentre sur patterns génériques (velocity, high-risk countries)
- Ne détecte pas : card testing sophistiqué, fraudeurs récurrents cross-marchands, anomalies comportementales
- Résultat : **Pertes financières directes** (milliers d'€/mois pour marchands moyens)

**Persona Thomas** (E-commerce SaaS, 10K€ CA/mois) :
> "J'ai eu 15 chargebacks le mois dernier (1500€ perdus), alors que Radar était activé. Je ne comprends pas ce qui passe à travers."

---

#### 2. Faux Positifs Tuent le CA (HIGH)
**"Radar bloque mes meilleurs clients"**

- Voyageurs internationaux bloqués (VPN, adresse IP ≠ carte)
- Clients récurrents flaggés comme suspects (velocity false positive)
- Achats volumineux légitimes rejetés
- Résultat : **15-20% de CA perdu** sur transactions légitimes bloquées

**Persona Sarah** (Marketplace, 50K€ CA/mois) :
> "Un client VIP à 5000€ de commandes/mois a été bloqué parce qu'il voyage. J'ai perdu le client définitivement."

---

#### 3. Réaction Trop Lente (HIGH)
**"Je découvre la fraude 2-3 semaines après"**

- Stripe envoie les chargebacks avec délai (client a 60-120 jours pour disputer)
- Marchand ne peut pas agir en temps réel (bloquer fraudeur avant prochaine tentative)
- Résultat : **Fraudeur récidive plusieurs fois** avant détection

**Persona David** (International, 100K€ CA/mois) :
> "J'ai eu 10 transactions frauduleuses du même fraudeur (IP différentes mais device fingerprint identique) avant de m'en rendre compte."

---

#### 4. Impossible à Personnaliser (MEDIUM)
**"Radar = boîte noire, je ne contrôle rien"**

- Pas de règles custom (ex : "bloquer tout montant >500€ depuis Nigeria")
- Pas de whitelist/blacklist manuel
- Pas de tuning des thresholds (risk score Radar non configurable)
- Résultat : **Frustration**, marchands cherchent solutions alternatives

---

### Current Solutions & Gaps

| Solution | Prix | Détection Rate | Faux Positifs | Customization | Gap |
|----------|------|---------------|---------------|---------------|-----|
| **Stripe Radar** | Inclus | 60-70% | 10-15% | ❌ Aucune | Insuffisant |
| **Sift** | 500€+/mois | 85-90% | 5-8% | ✅ Oui | Trop cher |
| **Signifyd** | 1000€+/mois | 90-95% | 3-5% | ✅ Oui | Trop cher + complexe |
| **Riskified** | 2000€+/mois | 95%+ | <3% | ✅✅ Oui | Enterprise only |

**Gap identifié** : Pas de solution **abordable** (99-199€/mois) avec **95%+ detection** et **<5% faux positifs** pour PME/startups.

---

### Why Now?

1. **Stripe dominance** : 3M+ marchands mondialement, croissance 30%/an
2. **Fraude en hausse** : +20% fraude e-commerce post-COVID (source: Sift Q4 2023 report)
3. **Radar insuffisant** : Communauté Stripe se plaint régulièrement (Reddit r/stripe, forums)
4. **Tech mature** : ML/AI fraud detection accessible, APIs Stripe robustes
5. **Freemium model** : Adoption facile, low barrier to entry

---

## Proposed Solution

### Value Proposition

> **"Orylo détecte 95%+ des fraudes en <250ms, sans bloquer vos clients légitimes. Installation en 5 minutes, 0 configuration."**

### Core Differentiation

1. **Multi-Vector Detection** : 6 détecteurs simultanés (vs Radar = 2-3 vecteurs)
2. **Action-First Dashboard** : Bloquez/whitelistez en 1 clic (vs Radar = readonly)
3. **Sub-250ms Latency** : Détection temps réel sans ralentir checkout
4. **Affordable** : 99-199€/mois (vs 500-2000€ concurrents)
5. **5-Min Setup** : Webhooks Stripe, aucune intégration code

---

### How It Works (Architecture Simplifiée)

```
┌─────────────┐      Webhook        ┌──────────────┐
│   Stripe    │ ─────────────────> │  Orylo API   │
│ (Payment)   │  payment_intent.*  │              │
└─────────────┘                     └──────┬───────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     │      Fraud Detection Engine             │
                     │  (6 Detectors running in parallel)      │
                     │                                          │
                     │  1. Velocity      4. Amount Anomaly     │
                     │  2. High-Risk Geo 5. Known Fraudster    │
                     │  3. Card Testing  6. Midnight Activity  │
                     └────────────────────┬────────────────────┘
                                          │
                              ┌───────────┴──────────┐
                              │  Scoring Strategy    │
                              │  (Additive + ML)     │
                              └───────────┬──────────┘
                                          │
                          ┌───────────────┴────────────────┐
                          │  Decision: ALLOW/REVIEW/BLOCK  │
                          └───────────────┬────────────────┘
                                          │
                       ┌──────────────────┴──────────────────┐
                       │         Dashboard (Real-time)        │
                       │  Merchant takes action if needed     │
                       └──────────────────────────────────────┘
```

**Flow détaillé** :
1. Client effectue paiement sur site marchand (Stripe Checkout)
2. Stripe envoie webhook `payment_intent.created` à Orylo
3. Orylo exécute 6 détecteurs en parallèle (<100ms chacun)
4. Scoring strategy agrège résultats → Score 0-100
5. Decision engine : ALLOW (<30), REVIEW (30-70), BLOCK (>70)
6. Dashboard affiche alerte temps réel, marchand peut agir

---

### Key Features (MVP)

#### 1. Multi-Vector Fraud Detection Engine

**6 Detectors** (exécutés en parallèle) :

- **Velocity Detector** : Détecte rafales anormales (>3 transactions en 5 min = score +20)
- **High-Risk Geo Detector** : Pays à forte fraude (Nigeria, Vietnam, etc. = score +15)
- **Card Testing Detector** : Patterns de montants suspects (1€, 2€, 5€ = score +25)
- **Amount Anomaly Detector** : Montant inhabituel pour client (>2x moyenne = score +10)
- **Known Fraudster Detector** : Cross-merchant fraud DB (email/IP blacklisté = score +30)
- **Midnight Activity Detector** : Transactions nocturnes suspectes (2h-5h AM = score +10)

**Scoring Strategy** (MVP = Additive simple) :
- Score total = Somme des scores détecteurs
- ALLOW : <30
- REVIEW : 30-70
- BLOCK : >70

**Post-MVP** : ML-based scoring (XGBoost model, training sur données beta)

---

#### 2. Dashboard Action-First

**Real-time Detection Feed** :
- Liste des transactions analysées (live updates via SSE)
- Score de fraude, décision (ALLOW/REVIEW/BLOCK), raison
- Détails : montant, client, pays, IP, device fingerprint

**Actions en 1 clic** :
- **Block Customer** : Blacklist permanent (toutes futures transactions auto-bloquées)
- **Whitelist Customer** : Trust score +100, plus jamais flaggé
- **Review Later** : Marque transaction pour analyse manuelle
- **Refund & Block** : Rembourse via Stripe API + blacklist

**Filters & Search** :
- Par décision (BLOCK only, REVIEW only)
- Par date (7 derniers jours, 30 jours)
- Par montant (>500€)
- Par pays

---

#### 3. Stripe Integration (Webhooks)

**Webhooks écoutés** :
- `payment_intent.created` : Analyse dès création
- `charge.succeeded` : Confirme transaction légitime (update trust score +5)
- `charge.failed` : Possible fraude (si raison = card declined)
- `charge.dispute.created` : Chargeback confirmé (update trust score -50, blacklist auto)

**Metadata injection** :
- Orylo injecte `fraud_score`, `fraud_decision`, `detector_ids` dans Stripe metadata
- Marchand peut voir dans Stripe Dashboard

**API Stripe utilisée** :
- Read : `PaymentIntent`, `Customer`, `Charge`
- Write : `Refund.create`, `Customer.update` (metadata)

---

#### 4. Authentication & Multi-Tenancy

**Better Auth** :
- Email/Password login
- Organizations plugin (multi-tenancy native)
- Invitation system (owner invite team members)

**Row-Level Security** :
- Toutes queries filtrées par `organizationId`
- Isolation stricte des données entre marchands

**Roles** (Post-MVP) :
- Owner : Full access
- Admin : Read/Write, pas de billing
- Viewer : Read-only

---

#### 5. Whitelist/Blacklist Manual

**Customer Management basique** :
- Liste des clients avec trust score
- Actions : Whitelist, Blacklist, Reset Score
- Recherche par email, ID Stripe

**Trust Score** :
- 0-100 (50 = neutral)
- +5 par transaction réussie
- -50 par chargeback
- Manual override possible

**Post-MVP** : VIP tagging, automatic trust score evolution

---

#### 6. Basic Observability

**Logging** :
- tslog (structured JSON logs)
- Niveaux : ERROR, WARN, INFO, DEBUG

**Monitoring** :
- Vercel Analytics : Latency, error rate
- PostHog : User events (login, action taken, etc.)

**Alerting** (Post-MVP) :
- Slack/Discord notifications si BLOCK decisions
- Email alerts si latency >250ms P95

---

## Target Users

### Ideal Customer Profile (ICP)

**Primary ICP** :
- **Business type** : E-commerce, SaaS, Marketplaces
- **Platform** : Stripe (obligatoire)
- **CA mensuel** : 10K-100K€
- **Taux de fraude** : 1-3% (sensibles au problème)
- **Team size** : 1-10 personnes (pas d'équipe fraude dédiée)
- **Pain** : Stripe Radar insuffisant, pertes régulières

**Secondary ICP** :
- Larger e-commerce (100K-500K€ CA/mois) cherchant alternative Sift/Signifyd
- Startups en forte croissance (fraude augmente avec volume)

---

### Personas Détaillées

#### Persona 1 : Thomas (E-commerce SaaS)

**Demographics** :
- Âge : 32 ans
- Rôle : Founder/CTO
- Entreprise : SaaS B2B (facturation Stripe)
- CA : 10K€/mois
- Taux de fraude : 2% (200€/mois perdus)

**Goals** :
- Réduire fraude à <0.5%
- Protéger croissance sans ajouter friction checkout
- Solution abordable (<150€/mois)

**Frustrations** :
- Stripe Radar rate 30% des fraudes
- Faux positifs bloquent clients internationaux
- Pas de visibilité temps réel

**Willingness to Pay** : 100-150€/mois si détection >90%

---

#### Persona 2 : Sarah (Marketplace)

**Demographics** :
- Âge : 28 ans
- Rôle : Head of Operations
- Entreprise : Marketplace B2C (Stripe Connect)
- CA : 50K€/mois
- Taux de fraude : 5% (2500€/mois perdus) - **URGENCE**

**Goals** :
- Réduire fraude à <1% rapidement
- Whitelister VIP manuellement
- Règles custom par catégorie produit

**Frustrations** :
- Radar bloque VIP (voyageurs, VPN)
- 10+ chargebacks/mois tuent margins
- Support Stripe lent

**Willingness to Pay** : 200€+/mois sans hésiter

---

#### Persona 3 : David (International)

**Demographics** :
- Âge : 45 ans
- Rôle : CFO
- Entreprise : E-commerce international
- CA : 100K€/mois
- Taux de fraude : 3% (3000€/mois)

**Goals** :
- Détection multi-géo (Afrique, Asie)
- Dashboard pour équipe (5 personnes)
- API pour intégrer dans backoffice

**Frustrations** :
- Fraudeurs récurrents (mêmes devices)
- Card testing massif (100+ tentatives/jour)
- Pas de network effect (fraud DB isolée)

**Willingness to Pay** : 300€+/mois + custom plan

---

### User Journey (Thomas - Primary Persona)

#### Phase 1 : Awareness
- Thomas lit article "Stripe Radar Alternative" sur Reddit
- Clique lien vers blog Orylo
- Lit case study "E-commerce SaaS réduit fraude de 2% à 0.3%"

#### Phase 2 : Consideration
- S'inscrit Free tier (0€, no credit card)
- Connecte compte Stripe via OAuth
- Voit dashboard avec premières détections (5 min setup)

#### Phase 3 : Trial
- Utilise Free tier pendant 1 mois
- Détecte 15 fraudes que Radar avait ratées
- 0 faux positifs (clients légitimes non bloqués)

#### Phase 4 : Conversion
- CA passe à 12K€ → dépasse limite Free (10K€)
- Upgrade Standard 99€/mois
- ROI évident : 200€ fraude économisée vs 99€ coût

#### Phase 5 : Retention
- Whitelist 3 VIP clients
- Crée règle custom "Block Nigeria >100€"
- Refer un peer founder → Referral bonus

---

## Goals & Success Metrics

### North Star Metric

**"Montant total de fraude bloquée pour les marchands"** (€ saved)
- Reflète impact direct du produit
- Aligné avec valeur client
- Mesurable et compréhensible

---

### MVP Success Metrics (Beta Program - Weeks 8-11)

| Metric | Target | Critical Threshold | Rationale |
|--------|--------|-------------------|-----------|
| **Beta signups** | 15 users | ≥10 users | Validation product-market fit |
| **Active beta users (week 4)** | 10 users | ≥5 users | Engagement |
| **Detection rate** | 95% | ≥85% | Core value prop |
| **False positive rate** | <5% | <10% | Pas de friction |
| **Detection latency P95** | <250ms | <500ms | Performance |
| **Beta NPS** | 50+ | 30+ | Satisfaction |
| **Conversion Free → Standard** | 30% | ≥15% | Willingness to pay |

---

### Launch Success Metrics (Month 3 post-launch)

| Metric | Target | Stretch Goal | Rationale |
|--------|--------|-------------|-----------|
| **Paying customers** | 5 | 10 | Revenue validation |
| **MRR** | 750€ | 1500€ | Viability |
| **Churn rate** | <10% | <5% | Retention |
| **Organic signups/month** | 20 | 50 | Growth engine |
| **Content traffic** | 1000 visits/month | 2000 | Marketing working |

---

### Product-Market Fit Indicators

- **40%+ users** "very disappointed" if product disappeared (Sean Ellis test)
- **Organic referrals** : 20%+ signups via word-of-mouth
- **Retention cohort** : 70%+ active after 3 months
- **NPS** : 50+ (promoters > detractors)

---

### Long-Term Goals (12 months)

| Metric | Target | Ambitious |
|--------|--------|-----------|
| **Paying customers** | 50 | 100 |
| **ARR** | 60K€ | 120K€ |
| **Detection rate** | 97% | 99% |
| **False positive rate** | <3% | <1% |
| **Team size** | 2-3 | 5 |
| **Funding** | Bootstrap | Pre-seed 500K€ |

---

## MVP Scope

### Must-Have Features (6-Week Sprint)

#### Sprint 1-2 : Core Detection Engine

1. **FraudDetectionEngine** :
   - 6 detectors implemented
   - Parallel execution
   - Additive scoring strategy

2. **Database schema** :
   - Organizations
   - FraudDetections
   - CustomerTrustScores
   - CustomRules

3. **Stripe webhook handler** :
   - `payment_intent.created`
   - `charge.succeeded`
   - `charge.dispute.created`

---

#### Sprint 3-4 : Dashboard UI

1. **Detection Feed** :
   - Real-time updates (SSE)
   - Score + Decision display
   - Filters (date, decision, amount)

2. **Action buttons** :
   - Block customer
   - Whitelist customer
   - Review later

3. **Stripe connection flow** :
   - OAuth integration
   - Webhook registration

---

#### Sprint 5 : Integration & Polish

1. **E2E testing** :
   - Fraud scenarios
   - Dashboard actions
   - Stripe webhooks

2. **Performance optimization** :
   - Latency <250ms P95
   - Database indexing
   - Connection pooling

3. **Beta prep** :
   - Onboarding flow
   - Documentation
   - Support Discord

---

### Out of Scope (Post-MVP)

**Phase 2** (Months 3-6) :
- Customer profiles détaillés
- Custom rules builder (visual)
- ML-based scoring model
- Chargebacks tracking
- Slack/Discord notifications

**Phase 3** (Months 6-12) :
- Public API
- Webhooks outbound
- Multi-organization dashboard
- White-label option
- Shopify/PayPal expansion

---

## Post-MVP Vision

### Phase 2 : Intelligence Layer (Months 3-6)

#### ML-Based Scoring
- XGBoost model training sur données beta
- Features : transaction history, device fingerprint, behavioral patterns
- Continuous learning : model re-train weekly

#### Custom Rules Builder
- Visual rule editor (no-code)
- If/Then logic : "IF country = NG AND amount > 500€ THEN BLOCK"
- Rule testing sandbox

#### Customer Intelligence
- Full customer profiles : history, trust score evolution, lifetime value
- VIP auto-detection (>10 transactions, 0 chargebacks)
- Behavioral anomaly detection

---

### Phase 3 : Platform (Months 6-12)

#### Public API
- RESTful API for integrations
- Rate limiting : 1000 req/min
- Webhooks outbound (fraud.detected, customer.blocked)

#### Network Effect
- Cross-merchant fraud database
- Anonymous sharing : email hashes, device fingerprints
- Privacy-preserving (GDPR compliant)

#### Expansion
- **Shopify Payments** : 2nd biggest market
- **PayPal** : Potential
- **Adyen** : Enterprise

---

### Phase 4 : Enterprise (Year 2+)

- Multi-team workspaces
- SSO (SAML, OIDC)
- White-label option
- Dedicated ML models per merchant
- SLA 99.99% uptime
- Dedicated support

---

## Technical Considerations

### Tech Stack ✅ Validated

**Frontend** :
- Next.js 16.1.1 (App Router)
- React 19.2.3
- TypeScript 5.7.3
- Base UI 1.0.0 + Tailwind CSS v4

**Backend** :
- Next.js API Routes (serverless)
- Trigger.dev v4 (background jobs)
- Better Auth 0.1.10 (authentication)

**Database** :
- PostgreSQL (Neon Serverless)
- Drizzle ORM 0.31.8
- Drizzle Kit (migrations)

**Cache** :
- Redis (Upstash Serverless)

**Monorepo** :
- Turborepo 2.7.4
- Bun 1.2.3 (package manager)

**Deployment** :
- Vercel (frontend + API)
- Neon (database)
- Upstash (Redis)

**External APIs** :
- Stripe API
- Fingerprint.js (device fingerprinting)
- GeoIP lookup (country detection)

---

### Architecture Decisions (ADRs)

Toutes les décisions architecturales sont documentées dans `/docs/architecture/adrs/` :

- **ADR-001** : Deployment (Vercel Serverless)
- **ADR-002** : Database (PostgreSQL + Drizzle)
- **ADR-003** : Cache (Redis Upstash)
- **ADR-004** : Detector Execution (Plugin-based, parallel)
- **ADR-005** : Type System (Branded types + Zod)
- **ADR-006** : Background Jobs (Trigger.dev)
- **ADR-007** : API Architecture (Next.js API Routes + tRPC post-MVP)
- **ADR-008** : Realtime (Server-Sent Events)
- **ADR-009** : Observability (tslog + Vercel Analytics + PostHog)
- **ADR-010** : Security (Better Auth + RLS)

**Voir** : `/docs/architecture/adrs/README.md` pour détails

---

### Performance Requirements

| Requirement | Target | Critical | Validated |
|------------|--------|----------|-----------|
| Detection latency P50 | <100ms | <150ms | ✅ 2.5ms POC |
| Detection latency P95 | <250ms | <500ms | ✅ 2.5ms POC |
| Detection latency P99 | <500ms | <1000ms | ✅ 2.5ms POC |
| Database query | <50ms | <100ms | ✅ |
| Dashboard load time | <1s | <2s | To validate |
| Real-time updates latency | <2s | <5s | To validate |

**Note** : POC a validé latency 2.5ms pour détection simple. Production cible <250ms P95 avec 6 détecteurs + DB queries.

---

### Security & Compliance

**Data Security** :
- HTTPS only
- Better Auth session management
- Row-Level Security (organizationId filter)
- API rate limiting (1000 req/min)

**GDPR Compliance** :
- Data retention : 90 jours max
- Right to deletion
- Data export (JSON)
- Privacy policy

**PCI Compliance** :
- Orylo ne stocke JAMAIS card numbers
- Seulement last4 + country (de Stripe)
- Stripe handles PCI compliance

---

### Scalability Plan

**Current** (MVP - 20 marchands) :
- Vercel Hobby → Pro (20€/mois)
- Neon Free → Scale (20€/mois)
- Upstash Free → Pro (10€/mois)

**Scale to 100 marchands** :
- Vercel Pro (no change)
- Neon Scale → Pro (50€/mois)
- Upstash Pro (30€/mois)
- Total : ~100€/mois infrastructure

**Scale to 1000 marchands** :
- Vercel Pro → Enterprise (custom)
- Neon Pro → Business (200€/mois)
- Upstash Pro (100€/mois)
- CDN (Cloudflare, 50€/mois)
- Total : ~500€/mois infrastructure

**Optimization strategies** :
- Database indexing (organizationId, paymentIntentId, createdAt)
- Redis caching (customer trust scores)
- Edge functions (geo-distributed)
- Connection pooling (Drizzle)

---

## Constraints & Assumptions

### Constraints

#### Budget
- **Marketing** : 0-500€/mois (bootstrap mode)
  - Pas de paid ads
  - Focus organic : SEO, Reddit, Twitter
  
- **Infrastructure** : <100€/mois MVP (0-20 marchands)
  - Vercel Pro : ~20€/mois
  - Neon : ~20€/mois
  - Upstash : ~10€/mois
  - APIs (Fingerprint, GeoIP) : ~30€/mois

- **Development** : Solo founder (pas de budget salaires)

---

#### Timeline
- **Sprint 0** : Foundation ✅ COMPLÉTÉ
- **Sprint 1-2** : Detection Engine (Weeks 2-3)
- **Sprint 3-4** : Dashboard UI (Weeks 4-5)
- **Sprint 5** : Integration & Polish (Week 6)
- **Beta** : Weeks 7-11 (15 users)
- **Launch** : Week 12 (Avril 2026)

**Contrainte dure** : 6 semaines MVP non-négociable

---

#### Resources
- **1 Full-Stack Developer** (temps plein, 40h/semaine)
- Compétences : ✅ TypeScript, React, Node.js, PostgreSQL
- Gaps : ❓ Design UI/UX, ❓ ML/AI, ❌ Marketing/Growth

---

#### Technical Constraints
- **Performance** : <250ms P95 = hard requirement
- **Scalability** : Architecture doit supporter 100 marchands sans refactoring
- **Third-party dependencies** : Stripe API stability, Fingerprint.js, Upstash

---

### Key Assumptions

**Product Assumptions** :
- ✅ Marchands paieront 99-199€/mois (to validate in beta)
- ✅ 95%+ detection rate atteignable avec 6 détecteurs
- ⚠️ Customer Management peut attendre post-MVP

**Market Assumptions** :
- ✅ 10-20 marchands beta trouvables via Reddit/Twitter
- ✅ Marché anti-fraude Stripe sous-servi
- ⚠️ Content marketing génèrera 500-1000 visiteurs/mois d'ici 6 mois

**Technical Assumptions** :
- ✅ Vercel serverless scale jusqu'à 100+ marchands
- ✅ Neon Serverless supporte charge (1M+ transactions/mois)
- ✅ Bun stabilité production
- ⚠️ Fingerprint.js détecte efficacement multiples comptes

**Business Model Assumptions** :
- ✅ Freemium model fonctionne pour acquisition
- ⚠️ Churn <10% atteignable
- ⚠️ CAC <500€ avec organic channels

---

## Risks & Open Questions

### Critical Risks

#### 🔴 HIGH - Willingness to Pay Non-Validée
- **Risk** : Marchands ne paient pas 99-199€/mois
- **Impact** : Revenue model entier s'effondre
- **Probability** : Medium (30%)
- **Mitigation** : Beta pricing dès jour 1, exit surveys, ajuster pricing si nécessaire

#### 🔴 HIGH - Detection Accuracy <90%
- **Risk** : Taux détection réel inférieur à 90% en production
- **Impact** : Value prop compromise
- **Probability** : Medium (30%)
- **Mitigation** : Architecture multi-vecteurs, learning loop, ML model Phase 2

#### 🔴 CRITICAL - Stripe Améliore Radar
- **Risk** : Stripe lance Radar 2.0 avec 95%+ detection
- **Impact** : Orylo devient obsolète
- **Probability** : Unknown
- **Mitigation** : Network effect (cross-merchant DB = moat), iterate faster

---

### Medium Risks

#### 🟡 MEDIUM - Beta Recruitment Failure
- **Risk** : <10 beta users recrutés
- **Impact** : Pas de validation PMF
- **Probability** : Medium (30%)
- **Mitigation** : Warm outreach dès maintenant, multiple channels

#### 🟡 MEDIUM - False Positives >5%
- **Risk** : Taux faux positifs trop élevé
- **Impact** : Churn immédiat
- **Probability** : Medium (30%)
- **Mitigation** : Whitelist/Blacklist manual, REVIEW mode par défaut, fine-tuning

#### 🟡 MEDIUM - Bun Production Bugs
- **Risk** : Bun moins mature que npm/pnpm
- **Impact** : Stability issues
- **Probability** : Medium
- **Mitigation** : Fallback npm possible, monitoring errors

---

### Open Questions (PM Decisions Needed)

**Product Questions** :
- **Q1** : Faut-il limiter le nombre de règles custom par marchand ? (10/50/Unlimited)
- **Q2** : Customer Management doit-il être dans MVP ? (+1 semaine timeline)
- **Q3** : Quel niveau de configurabilité pour scoring strategy ? (Fixed vs tunable thresholds)
- **Q4** : Faut-il un "Test Mode" pour tester sans bloquer vraies transactions ?

**Timeline decisions** :
- Q2 : Decision Semaine 3
- Q3 : Decision Semaine 2
- Q4 : Decision Semaine 4

**Technical Questions** :
- **Q5** : Quelle stratégie versioning pour détecteurs ? (v1/v2 opt-in vs rolling updates)
- **Q6** : Faut-il un A/B testing framework dès MVP ? (feature flags vs LaunchDarkly)
- **Q8** : Logging tool final ? (Vercel Observability vs PostHog vs Axiom)

**Timeline decisions** :
- Q5 : Before production
- Q6 : Decision Semaine 5
- Q8 : Decision Semaine 4

**GTM Questions** :
- **Q9** : Faut-il un public roadmap dès launch ? (transparency vs competitive moat)
- **Q10** : Pricing granularity ? (Flat vs usage-based vs hybrid)
- **Q11** : Referral program dès Mois 1 ? (20% commission vs 1 mois gratuit)

---

## Appendices

### A. Architecture Decision Records
Voir `/docs/architecture/adrs/` pour :
- ADR-001 à ADR-010
- System Overview : `/docs/architecture/system-overview.md`

### B. User Research
- **Brainstorming** : `/docs/brainstorming-session-results.md`
- **User Stories** : `/docs/user-stories/README.md` (14 stories)
- **Personas** : Thomas, Sarah, David (détaillés dans brainstorming)

### C. Go-to-Market Strategy
- **GTM Strategy** : `/docs/gtm-strategy.md`
- **Content Templates** : `/docs/gtm-content-templates.md`
- **Positioning** : "Anti-fraude intelligent pour marchands Stripe"
- **ICP** : E-commerce/SaaS, 10-100K€ CA/mois, 1-3% fraude
- **Pricing** : Free (0€), Standard (99€), Pro (199€)
- **Channels** : SEO, Reddit, Twitter, Cold outreach

### D. Technical POC
- **POC Report** : `/POC-VALIDATION.md`
- **Results** : ✅ Detection 2.5ms, ✅ Type safety, ✅ Monorepo, ✅ Better Auth
- **Next Steps** : `/NEXT-STEPS.md`

### E. Key Metrics Recap

**Beta Success** (Weeks 8-11) :
- 15 signups, 10 active users
- 95% detection, <5% false positives
- 30% conversion Free → Standard

**Launch Success** (Month 3) :
- 5 paying customers, 750€ MRR
- <10% churn
- 20 organic signups/month

### F. Timeline Recap

```
✅ Sprint 0 (Week 1) : Foundation COMPLÉTÉ
🚀 Sprint 1-2 (Weeks 2-3) : Detection Engine
🎨 Sprint 3-4 (Weeks 4-5) : Dashboard UI
🔧 Sprint 5 (Week 6) : Integration & Polish
👥 Beta (Weeks 7-11) : 15 users validation
🎉 Launch (Week 12 - Avril 2026)
```

### G. Glossary

**Fraud Terms** :
- **Chargeback** : Dispute transaction, merchant loses money + fee
- **Card Testing** : Fraudster tests stolen cards
- **Velocity** : Transaction frequency
- **False Positive** : Legit transaction flagged as fraud
- **Device Fingerprint** : Unique identifier for device/browser

**Tech Terms** :
- **Branded Types** : TypeScript types with brand for stronger safety
- **Detector** : Module analyzing transaction for fraud signals
- **Webhook** : HTTP callback from Stripe

**Business Terms** :
- **ARR** : Annual Recurring Revenue
- **MRR** : Monthly Recurring Revenue
- **CAC** : Customer Acquisition Cost
- **LTV** : Lifetime Value
- **PMF** : Product-Market Fit

---

## Next Actions for PM

1. ✅ **Review this brief** thoroughly
2. ⚠️ **Decide on Open Questions** urgentes (Q2, Q4) avant Sprint 2
3. 🚀 **Kickoff Sprint 1** : Implement 6 detectors
4. 📊 **Setup tracking** : PostHog events, metrics dashboard
5. 📣 **Start beta recruitment** : Reddit/Twitter outreach (ne pas attendre Semaine 7)

---

**Brief Status** : ✅ **COMPLET - READY FOR HANDOFF**

**Document Maintenance** :
- Created : Janvier 2026
- Version : 1.0
- Review Cadence : Monthly during dev, Quarterly post-launch

---

*Fin du Brief Orylo V3*
