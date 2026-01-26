# Epic 4: Validation Technique - Système de Décisions Assisté par IA

**Epic**: Epic 4 - Système de Décisions Assisté par IA  
**Status**: 📋 Pending Technical Validation  
**Date**: 2026-01-26  
**Owner**: Product Owner (Sarah) + Technical Team

---

## Objectif de la Validation

Valider la faisabilité technique, l'architecture, et les dépendances des 4 stories de l'Epic 4 avant le début du développement (Sprint 6).

---

## Participants Recommandés

- **Product Owner** (Sarah) - Facilite la session
- **Backend Lead** - Valide architecture, Trigger.dev, LLM integration
- **Frontend Lead** - Valide UI components, intégrations dashboard
- **DevOps** - Valide infrastructure, coûts, monitoring
- **QA Lead** - Valide testabilité, coverage requirements

---

## Checklist de Validation Globale

### Infrastructure & Services Externes

- [ ] **Trigger.dev** : Compte créé, projet configuré, SDK installé
- [ ] **OpenAI API** : Compte créé, clé API obtenue, usage limits configurés
- [ ] **Anthropic API** : (Optionnel) Compte créé pour backup
- [ ] **Budget validé** : Coûts estimés <€200/mois acceptables
- [ ] **Redis** : Configuration existante suffisante (cache + rate limiting)

### Base de Données

- [ ] **Schémas validés** : 4 nouvelles tables (`ai_suggestions`, `ai_explanations`, `ai_rule_recommendations`, `ai_feedback`) compatibles avec structure existante
- [ ] **Migrations** : Plan de migration validé, pas de breaking changes
- [ ] **Indexes** : Performance des requêtes validée (indexes nécessaires identifiés)
- [ ] **Relations** : Foreign keys et cascades validés

### Architecture & Intégrations

- [ ] **Trigger.dev Jobs** : Architecture async validée (ADR-006 respectée)
- [ ] **LLM Integration** : Pattern d'intégration validé (client library, error handling, fallback)
- [ ] **Cache Strategy** : Stratégie de cache Redis validée (TTLs, invalidation)
- [ ] **Rate Limiting** : Implémentation validée (10 explanations/minute)

### Dépendances

- [ ] **Epic 1** : Tables `fraud_detections`, `customer_trust_scores`, `custom_rules` disponibles
- [ ] **Epic 2** : Components `detection-details-dialog.tsx`, Settings page disponibles
- [ ] **Epic 3** : Redis, Trigger.dev, observability stack disponibles

---

## Validation par Story

### Story 4.1: Suggestions IA pour Whitelist/Blacklist

#### Questions Techniques

1. **Pattern Analysis** :
   - ✅ Les requêtes sur `fraud_detections` pour historique (90 jours) sont-elles performantes ?
   - ✅ Le calcul de patterns (successful transactions, chargebacks) est-il faisable en <500ms ?
   - ❓ **Question** : Faut-il pré-agréger les statistiques dans une table dédiée pour performance ?

2. **Intégration Trust Score** :
   - ✅ `updateTrustScore()` existe et fonctionne (Epic 1)
   - ✅ Le champ `status` ('whitelisted', 'blacklisted') est utilisé correctement
   - ❓ **Question** : Comment gérer les clients avec `status='vip'` ? Suggérer whitelist quand même ?

3. **UI Integration** :
   - ✅ `detection-details-dialog.tsx` existe (Epic 2)
   - ❓ **Question** : Où exactement afficher la suggestion ? Section dédiée ou intégrée dans les actions existantes ?

4. **Performance** :
   - ✅ Cache Redis validé (TTL 30min pour patterns)
   - ❓ **Question** : Le calcul de suggestions en temps réel est-il acceptable, ou faut-il background job ?

#### Décisions à Prendre

- [ ] **Décision 1** : Pré-agrégation des statistiques client (Oui/Non)
- [ ] **Décision 2** : Gestion des clients VIP (Suggérer whitelist / Ignorer)
- [ ] **Décision 3** : Timing de génération suggestions (Temps réel / Background job)

#### Risques Identifiés

- ⚠️ **Risque 1** : Performance si historique très volumineux (>10K transactions/client)
  - **Mitigation proposée** : Limiter analyse à 90 jours, cache agressif
  - **Validation requise** : Backend Lead doit valider performance

- ⚠️ **Risque 2** : Suggestions trop fréquentes (spam UI)
  - **Mitigation proposée** : Seulement 1 suggestion par détection, confidence >0.6 minimum
  - **Validation requise** : Frontend Lead doit valider UX

---

### Story 4.2: Explications IA des Décisions de Fraude

#### Questions Techniques

1. **Trigger.dev Job** :
   - ✅ Trigger.dev configuré (ADR-006)
   - ❓ **Question** : Le job doit-il être déclenché pour TOUTES les détections ou seulement BLOCK/REVIEW ?
   - ❓ **Question** : Queue priority (HIGH/NORMAL) suffisante ou besoin de plus de granularité ?

2. **LLM Integration** :
   - ✅ OpenAI GPT-4o-mini choisi (coût optimisé)
   - ❓ **Question** : Fallback Anthropic nécessaire en production ou optionnel ?
   - ❓ **Question** : Retry logic (3 attempts) suffisant ou besoin de plus ?

3. **Prompt Engineering** :
   - ✅ Template de prompt fourni
   - ❓ **Question** : Le format des `detectorResults` est-il standardisé ? Format exact à valider
   - ❓ **Question** : Longueur maximale de l'explication ? (500 tokens max actuellement)

4. **UI Display** :
   - ✅ `detection-details-dialog.tsx` existe
   - ❓ **Question** : Polling (1s) ou SSE pour mettre à jour l'explication quand générée ?
   - ❓ **Question** : Afficher "Generating..." pendant combien de temps avant timeout ?

#### Décisions à Prendre

- [ ] **Décision 1** : Déclencher explications pour (Toutes / BLOCK+REVIEW seulement / BLOCK seulement)
- [ ] **Décision 2** : Fallback Anthropic (Obligatoire / Optionnel / Pas de fallback)
- [ ] **Décision 3** : Mécanisme de mise à jour UI (Polling / SSE / WebSocket)
- [ ] **Décision 4** : Timeout explication (30s / 60s / 120s)

#### Risques Identifiés

- ⚠️ **Risque 1** : Coût LLM si toutes détections génèrent explication
  - **Mitigation proposée** : Rate limiting 10/minute, cache similar detections
  - **Validation requise** : DevOps doit valider budget et monitoring

- ⚠️ **Risque 2** : Latence explication >2s impacte UX
  - **Mitigation proposée** : Affichage progressif, fallback template si >5s
  - **Validation requise** : Frontend Lead doit valider UX acceptable

---

### Story 4.3: Recommandations de Règles Custom Personnalisées

#### Questions Techniques

1. **Pattern Analysis** :
   - ✅ Analyse transaction history (90 jours) validée
   - ❓ **Question** : Calcul des statistiques (average, distribution, geo patterns) en <1s faisable ?
   - ❓ **Question** : Faut-il background job pour pré-calculer stats quotidiennement ?

2. **Rule Format** :
   - ✅ Format JSON compatible avec `custom_rules.condition` validé
   - ❓ **Question** : Les champs supportés (amount, velocity, ipCountry) sont-ils tous disponibles dans `fraud_detections` ?
   - ❓ **Question** : Support des opérateurs (>, <, =, IN) suffisant ou besoin de plus (AND/OR) ?

3. **Impact Preview** :
   - ✅ Simulation sur historique (30 jours) validée
   - ❓ **Question** : Performance de simulation si >1000 transactions à analyser ?
   - ❓ **Question** : Calcul false positives/true positives nécessite ground truth - comment obtenir ?

4. **Effectiveness Tracking** :
   - ✅ Lien `ai_rule_recommendations.customRuleId` → `custom_rules.id` validé
   - ❓ **Question** : Comment calculer "true positives" vs "false positives" sans ground truth ?
   - ❓ **Question** : Période d'évaluation (7 jours / 30 jours) ?

#### Décisions à Prendre

- [ ] **Décision 1** : Background job pour stats (Oui / Non, temps réel suffit)
- [ ] **Décision 2** : Champs supportés dans règles (Amount, Velocity, Geo / Plus de champs)
- [ ] **Décision 3** : Calcul effectiveness (Basé sur merchant feedback / Basé sur chargebacks / Autre)
- [ ] **Décision 4** : Période d'évaluation effectiveness (7 jours / 30 jours / 90 jours)

#### Risques Identifiés

- ⚠️ **Risque 1** : Recommandations peu pertinentes si historique insuffisant
  - **Mitigation proposée** : Minimum 30 transactions requises, confidence basse si <30
  - **Validation requise** : Backend Lead doit valider seuils

- ⚠️ **Risque 2** : Impact preview imprécis (faux positifs/négatifs)
  - **Mitigation proposée** : Estimation basée sur patterns, disclaimer "estimation"
  - **Validation requise** : Product Owner doit valider UX acceptable

---

### Story 4.4: Feedback Loop & Apprentissage des Overrides

#### Questions Techniques

1. **Feedback Tracking** :
   - ✅ Endpoints accept/reject existent (Story 4.1)
   - ❓ **Question** : Tracking automatique sur tous les endpoints ou explicite via endpoint dédié ?
   - ❓ **Question** : Context à stocker (full detection data / partial) pour privacy ?

2. **Model Updates** :
   - ✅ Trigger.dev scheduled job validé (daily)
   - ❓ **Question** : Où stocker les thresholds ajustés ? (Redis / DB config table / Fichier config)
   - ❓ **Question** : Fréquence de mise à jour (Daily / Weekly / On-demand) ?

3. **A/B Testing** :
   - ✅ Framework de comparaison avant/après validé
   - ❓ **Question** : Période de comparaison (1 semaine / 2 semaines) ?
   - ❓ **Question** : Métriques à comparer (Acceptance rate seulement / Plus de métriques) ?

4. **Privacy & Anonymization** :
   - ✅ Opt-in checkbox validé
   - ❓ **Question** : Quels champs anonymiser exactement ? (emails, customer IDs, amounts ?)
   - ❓ **Question** : Export anonymisé pour training futur (Oui / Non / Plus tard) ?

#### Décisions à Prendre

- [ ] **Décision 1** : Stockage thresholds ajustés (Redis / DB / Config file)
- [ ] **Décision 2** : Fréquence mise à jour modèle (Daily / Weekly / On-demand)
- [ ] **Décision 3** : Champs à anonymiser (Liste exacte)
- [ ] **Décision 4** : Export anonymisé pour training (Oui / Non / Post-MVP)

#### Risques Identifiés

- ⚠️ **Risque 1** : Feedback insuffisant pour améliorer modèle (cold start)
  - **Mitigation proposée** : Seuils par défaut conservateurs, amélioration progressive
  - **Validation requise** : Backend Lead doit valider algorithmes

- ⚠️ **Risque 2** : Privacy concerns (anonymisation incomplète)
  - **Mitigation proposée** : Review légale, opt-in explicite, audit anonymisation
  - **Validation requise** : Legal/Compliance review si nécessaire

---

## Questions Transversales

### Performance

1. **Latence globale** : Impact sur performance dashboard avec suggestions/explications ?
   - **Réponse attendue** : Backend Lead
   - **Critère** : Dashboard load <2.5s maintenu

2. **Scalabilité** : Comportement avec 100+ marchands, 10K+ détections/jour ?
   - **Réponse attendue** : DevOps
   - **Critère** : Pas de dégradation performance

### Coûts

1. **Budget LLM** : €200/mois suffisant pour 50K explications/mois ?
   - **Calcul** : 50K * 200 tokens * $0.15/1M = ~$1.50/mois ✅
   - **Validation** : DevOps doit confirmer monitoring en place

2. **Trigger.dev** : Free tier (100K runs) suffisant ?
   - **Calcul** : 50K explications + 10K feedback analysis = 60K runs/mois ✅
   - **Validation** : Backend Lead doit confirmer

### Sécurité & Privacy

1. **API Keys** : Gestion sécurisée des clés OpenAI/Anthropic ?
   - **Validation** : DevOps doit confirmer Vercel env vars sécurisés

2. **GDPR** : Anonymisation feedback conforme ?
   - **Validation** : Legal/Compliance review si nécessaire

### Testing

1. **Coverage** : ≥80% coverage pour logique IA faisable ?
   - **Validation** : QA Lead doit confirmer

2. **E2E Tests** : Tests Playwright pour flows IA ?
   - **Validation** : QA Lead doit confirmer faisabilité

---

## Plan d'Action Post-Validation

### Si Validation ✅ PASS

1. **Infrastructure Setup** : Suivre `docs/epics/epic-4-infrastructure-setup.md`
2. **Sprint Planning** : Intégrer Epic 4 dans Sprint 6-7
3. **Kickoff** : Démarrer Story 4.1 ou 4.2 (selon dépendances)

### Si Validation ⚠️ CONCERNS

1. **Documenter concerns** : Liste des risques/blocages identifiés
2. **Mitigation plan** : Solutions alternatives proposées
3. **Re-validation** : Session de suivi après mitigation

### Si Validation ❌ FAIL

1. **Documenter blockers** : Raisons du rejet
2. **Alternatives** : Proposer solutions de contournement
3. **Re-scope** : Réduire scope Epic 4 si nécessaire

---

## Template de Réponse

Pour chaque question, documenter :

```markdown
### Question: [Titre question]

**Réponse** : [Réponse de l'équipe technique]

**Décision** : [Décision prise]

**Action Items** : 
- [ ] [Action 1]
- [ ] [Action 2]

**Notes** : [Notes additionnelles]
```

---

## Résultat de la Validation

### Validation Globale

- [ ] ✅ **APPROUVÉ** - Toutes les stories sont faisables, pas de blockers
- [ ] ⚠️ **APPROUVÉ AVEC CONDITIONS** - Faisable mais nécessite ajustements
- [ ] ❌ **REJETÉ** - Blocages majeurs, nécessite re-scoping

### Stories Validées

- [ ] Story 4.1 : ✅ / ⚠️ / ❌
- [ ] Story 4.2 : ✅ / ⚠️ / ❌
- [ ] Story 4.3 : ✅ / ⚠️ / ❌
- [ ] Story 4.4 : ✅ / ⚠️ / ❌

### Décisions Prises

[Liste des décisions prises pendant la validation]

### Action Items Post-Validation

- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

---

## Notes de Session

[À remplir pendant la session de validation]

---

**Date de Validation** : [À remplir]  
**Participants** : [À remplir]  
**Durée** : [À remplir]  
**Prochaine Review** : [À remplir]

---

**Created**: 2026-01-26  
**Owner**: Product Owner (Sarah)  
**Last Updated**: 2026-01-26
