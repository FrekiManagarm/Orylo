# User Stories - Orylo V3

**Date de création** : 12 janvier 2026  
**Status** : En cours de création

---

## 📋 Vue d'Ensemble

Ce document contient toutes les User Stories pour Orylo V3, regroupées par Epic.

### Template User Story

```
US-XXX : [Titre Court]

En tant que [PERSONA]
Je veux [ACTION]
Afin de [BÉNÉFICE]

Critères d'Acceptation :
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

Story Points : [1, 2, 3, 5, 8, 13]
Priorité : [Must Have, Should Have, Could Have, Won't Have]
Epic : [Nom de l'epic]
```

---

## 🏗️ EPIC 1 : Foundation & Architecture

### US-001 : Setup Monorepo Turborepo

**En tant que** Développeur  
**Je veux** un monorepo Turborepo fonctionnel avec Bun  
**Afin de** structurer le projet de manière scalable et maintenable

**Critères d'Acceptation :**
- [x] Turborepo installé et configuré
- [x] Structure `/apps` et `/packages` créée
- [x] Bun comme package manager
- [x] Scripts `dev`, `build`, `lint`, `type-check` fonctionnent
- [x] Turbo cache configuré

**Story Points** : 3  
**Priorité** : Must Have  
**Epic** : Foundation & Architecture  
**Status** : ✅ COMPLÉTÉ

---

### US-002 : Créer package @orylo/fraud-engine

**En tant que** Développeur  
**Je veux** un package fraud-engine indépendant avec interfaces core  
**Afin de** avoir une architecture modulaire et testable

**Critères d'Acceptation :**
- [x] Package `@orylo/fraud-engine` créé
- [x] Interface `IDetector` définie
- [x] Interface `IScoringStrategy` définie
- [x] Branded types (OrganizationId, PaymentIntentId, etc.)
- [x] `FraudDetectionEngine` class implémentée
- [x] `AdditiveScoringStrategy` implémentée
- [x] Type-check passe

**Story Points** : 5  
**Priorité** : Must Have  
**Epic** : Foundation & Architecture  
**Status** : ✅ COMPLÉTÉ

---

### US-003 : Créer package @orylo/database

**En tant que** Développeur  
**Je veux** des schémas Drizzle ORM centralisés  
**Afin de** gérer la base de données de manière type-safe

**Critères d'Acceptation :**
- [x] Package `@orylo/database` créé
- [x] Schema `organizations` défini
- [x] Schema `fraud_detections` défini
- [x] Schema `customer_trust_scores` défini
- [x] Schema `custom_rules` défini
- [x] Drizzle config avec migrations
- [x] Type-check passe

**Story Points** : 5  
**Priorité** : Must Have  
**Epic** : Foundation & Architecture  
**Status** : ✅ COMPLÉTÉ

---

### US-004 : Setup Better Auth avec Organizations

**En tant que** Développeur  
**Je veux** Better Auth configuré avec le plugin Organizations  
**Afin de** gérer l'authentification multi-tenant

**Critères d'Acceptation :**
- [x] Better Auth installé
- [x] Plugin Organizations activé
- [x] API route `/api/auth/[...all]` configurée
- [x] Auth client créé (`lib/auth-client.ts`)
- [x] Type-check passe

**Story Points** : 3  
**Priorité** : Must Have  
**Epic** : Foundation & Architecture  
**Status** : ✅ COMPLÉTÉ

---

### US-005 : Page de Démo POC

**En tant que** Développeur  
**Je veux** une page de démo qui prouve l'intégration  
**Afin de** valider que tous les packages fonctionnent ensemble

**Critères d'Acceptation :**
- [x] Page `/demo` créée
- [x] Import `@orylo/fraud-engine` dans Next.js fonctionne
- [x] DemoDetector créé et enregistré
- [x] Exécution du FraudDetectionEngine fonctionne
- [x] Affichage des résultats (décision, score, detectors)
- [x] UI basique avec Tailwind CSS

**Story Points** : 3  
**Priorité** : Must Have  
**Epic** : Foundation & Architecture  
**Status** : ✅ COMPLÉTÉ

---

## 🛡️ EPIC 2 : Multi-Vector Fraud Detection

### US-010 : Implémenter BlacklistDetector

**En tant que** Système  
**Je veux** un detector qui vérifie les blacklists/whitelists  
**Afin de** bloquer immédiatement les fraudeurs connus

**Critères d'Acceptation :**
- [ ] Classe `BlacklistDetector` implements `IDetector`
- [ ] Check email dans blacklist
- [ ] Check IP dans blacklist
- [ ] Check carte (hash) dans blacklist
- [ ] Early exit si match (priorité 1)
- [ ] Tests unitaires 100% coverage
- [ ] Performance < 50ms

**Story Points** : 5  
**Priorité** : Must Have - CRITICAL  
**Epic** : Multi-Vector Fraud Detection  
**Status** : 🔴 TODO

---

### US-011 : Implémenter CardTestingDetector

**En tant que** Système  
**Je veux** détecter les attaques de card testing  
**Afin de** bloquer les fraudeurs qui testent des cartes volées

**Critères d'Acceptation :**
- [ ] Classe `CardTestingDetector` implements `IDetector`
- [ ] Track session avec Redis : `uniqueCards`, `attemptsLast10Min`
- [ ] Seuil : 5+ cartes ET 8+ tentatives ET montant < 10€
- [ ] Score 90-100 si card testing détecté
- [ ] Tests avec scénarios réels
- [ ] Performance < 100ms

**Story Points** : 8  
**Priorité** : Must Have - CRITICAL  
**Epic** : Multi-Vector Fraud Detection  
**Status** : 🔴 TODO

---

### US-012 : Implémenter DeviceFingerprintDetector

**En tant que** Système  
**Je veux** détecter les multiples comptes depuis même device  
**Afin de** identifier les fraudeurs qui créent plusieurs comptes

**Critères d'Acceptation :**
- [ ] Integration Fingerprint.js ou similaire
- [ ] Détecte > 5 comptes depuis même fingerprint
- [ ] Score 60-80 si multiple accounts détecté
- [ ] Cache fingerprints en Redis
- [ ] Tests avec mocks
- [ ] Performance < 100ms

**Story Points** : 8  
**Priorité** : Must Have  
**Epic** : Multi-Vector Fraud Detection  
**Status** : 🔴 TODO

---

### US-013 : Implémenter GeoVelocityDetector

**En tant que** Système  
**Je veux** détecter les changements géographiques impossibles  
**Afin de** bloquer les transactions avec géolocalisation incohérente

**Critères d'Acceptation :**
- [ ] IP country vs Card country mismatch
- [ ] Calcul vélocité : Paris → Tokyo en 5 min = impossible
- [ ] Integration GeoIP database
- [ ] Score 70-90 si geo-velocity impossible
- [ ] Tests avec scénarios géographiques
- [ ] Performance < 100ms

**Story Points** : 8  
**Priorité** : Must Have  
**Epic** : Multi-Vector Fraud Detection  
**Status** : 🔴 TODO

---

### US-014 : Implémenter AdditiveScoringStrategy

**En tant que** Système  
**Je veux** une stratégie de scoring additive  
**Afin de** combiner les scores des detectors en décision finale

**Critères d'Acceptation :**
- [x] Classe `AdditiveScoringStrategy` implements `IScoringStrategy`
- [x] Moyenne pondérée par confidence
- [x] Seuils configurables (30 = REVIEW, 70 = BLOCK)
- [ ] Tests avec différents scénarios
- [ ] Performance < 10ms

**Story Points** : 3  
**Priorité** : Must Have  
**Epic** : Multi-Vector Fraud Detection  
**Status** : 🟡 EN COURS

---

## 📊 EPIC 3 : Action-First Dashboard

### US-020 : Hero Section - Protection Status

**En tant que** Marchand (Thomas)  
**Je veux** voir immédiatement si mon compte est protégé  
**Afin de** savoir en 3 secondes si tout va bien

**Critères d'Acceptation :**
- [ ] Component `ProtectionStatus` créé
- [ ] 3 états : ✅ Safe / ⚠️ Warning / 🔴 Critical
- [ ] Affiche : fraudes bloquées aujourd'hui, argent économisé
- [ ] Design moderne avec Shadcn/ui
- [ ] Responsive mobile
- [ ] Tests React Testing Library

**Story Points** : 5  
**Priorité** : Must Have  
**Epic** : Action-First Dashboard  
**Status** : 🔴 TODO

---

### US-021 : Section Actions Requises

**En tant que** Marchand (Thomas)  
**Je veux** voir uniquement les actions qui nécessitent mon attention  
**Afin de** ne pas perdre de temps sur ce qui va déjà bien

**Critères d'Acceptation :**
- [ ] Component `ActionableItems` créé
- [ ] Liste transactions en REVIEW seulement
- [ ] CTA "Reviewer maintenant" → Modal détail
- [ ] Modal permet ALLOW ou BLOCK avec justification
- [ ] Empty state si aucune action requise
- [ ] Tests interactions utilisateur

**Story Points** : 8  
**Priorité** : Must Have  
**Epic** : Action-First Dashboard  
**Status** : 🔴 TODO

---

## 👥 EPIC 4 : Customer Management

### US-030 : Liste Clients avec Filtres

**En tant que** Marchand (Thomas)  
**Je veux** voir la liste de tous mes clients Stripe avec leur statut  
**Afin de** identifier rapidement les clients VIP vs suspects

**Critères d'Acceptation :**
- [ ] Page `/customers` créée
- [ ] Table avec colonnes : Name, Email, Trust Score, Last Transaction, Status
- [ ] Filtres : All / VIP / Suspicious / Blocked / Whitelisted
- [ ] Recherche par nom ou email
- [ ] Pagination (50 clients par page)
- [ ] Load time < 1s
- [ ] Tests CRUD operations

**Story Points** : 8  
**Priorité** : Should Have  
**Epic** : Customer Management  
**Status** : 🔴 TODO

---

### US-031 : Actions Rapides sur Clients

**En tant que** Marchand (Thomas)  
**Je veux** pouvoir rapidement whitelister/blacklister un client  
**Afin de** gérer les exceptions sans code

**Critères d'Acceptation :**
- [ ] Bouton "Add to Whitelist" avec modal confirmation
- [ ] Bouton "Mark as VIP" → Trust score +50
- [ ] Bouton "Block" → Blacklist + alert email
- [ ] Actions persist en DB immédiatement
- [ ] IA apprend des overrides manuels
- [ ] Tests pour chaque action

**Story Points** : 5  
**Priorité** : Should Have  
**Epic** : Customer Management  
**Status** : 🔴 TODO

---

## 📈 Métriques

**Total Stories créées** : 14  
**Must Have** : 11 (79%)  
**Should Have** : 3 (21%)  
**Story Points Total** : 79

**Status :**
- ✅ Complété : 5 stories (36%)
- 🟡 En cours : 1 story (7%)
- 🔴 TODO : 8 stories (57%)

---

## 🗓️ Prochaines Actions

1. **Terminer AdditiveScoringStrategy tests** (US-014)
2. **Commencer Sprint 1** : Implémenter les 6 detectors (US-010 à US-013)
3. **Créer stories manquantes** pour les autres epics

---

**Dernière mise à jour** : 12 janvier 2026  
**Prochaine review** : Fin Sprint 0
