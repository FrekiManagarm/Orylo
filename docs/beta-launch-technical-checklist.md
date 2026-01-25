# Beta Launch Technical Validation Checklist

**Purpose**: Technical verification checklist for PM/QA to validate all technical requirements before beta launch.

**Owner**: PM/QA Lead (with Dev support for technical verification)

---

## Epic Completion Verification

### Epic 1: Detection Engine (7 stories)
- [ ] Story 1.1: Stripe OAuth ✅
- [ ] Story 1.2: Stripe Webhooks ✅
- [ ] Story 1.3: Fraud Detection API ✅
- [ ] Story 1.4: Velocity Detector ✅
- [ ] Story 1.5: Geolocation Detector ✅
- [ ] Story 1.6: Trust Score Detector ✅
- [ ] Story 1.7: Custom Rules Engine ✅

**Verification**: Check GitHub/Linear for all stories marked "Ready for Review" or "Completed"

### Epic 2: Dashboard & Actions (12 stories)
- [ ] Story 2.1: Feed Dashboard ✅
- [ ] Story 2.2: Stats Cards ✅
- [ ] Story 2.3: Filters ✅
- [ ] Story 2.4: Detection Details Dialog ✅
- [ ] Story 2.6: Mobile Navigation ✅
- [ ] Story 2.7: Block Customer Action ✅
- [ ] Story 2.8: Whitelist Customer Action ✅
- [ ] Story 2.9: Quick Actions Menu ✅
- [ ] Story 2.10: SSE Real-Time Updates ✅
- [ ] Story 2.11: Mobile Responsive Design ✅
- [ ] Story 2.12: Dark Mode Support ✅

**Verification**: Check GitHub/Linear for all stories marked "Ready for Review" or "Completed"

### Epic 3: Production Readiness (10 stories)
- [ ] Story 3.1: Production Webhooks (Idempotency) ✅
- [ ] Story 3.2: Trust Score Auto-Update (Chargebacks) ✅
- [ ] Story 3.3: Observability Stack ✅
- [ ] Story 3.4: Performance Optimization ✅
- [ ] Story 3.5: Security & Compliance (GDPR, PCI) ✅
- [ ] Story 3.6: Integration Tests ✅
- [ ] Story 3.7: E2E Tests (Playwright) ✅
- [ ] Story 3.8: Beta Program Preparation ✅
- [ ] Story 3.9: Production Deployment Config ✅
- [ ] Story 3.10: Beta Launch Checklist ✅

**Verification**: Check GitHub/Linear for all stories marked "Ready for Review" or "Completed"

**Total**: 29 stories completed

---

## Test Coverage Verification

### Unit Tests
- [ ] Run: `cd apps/web && bun run test`
- [ ] All tests pass
- [ ] Coverage ≥80% for `@orylo/fraud-engine`
- [ ] Coverage ≥70% for UI components

**Command**: `bun run test --coverage`

### Integration Tests
- [ ] Run: `cd apps/web && bun run test:integration:run`
- [ ] All integration tests pass
- [ ] Coverage ≥60% for API routes (`app/api/**`)

**Command**: `bun run test:integration:run`

### E2E Tests
- [ ] Run: `cd apps/web && bun run test:e2e`
- [ ] All E2E tests pass (5 critical paths)
- [ ] Tests cover: Login, Dashboard, Block Customer, Filters, Mobile

**Command**: `bun run test:e2e`

### Test Summary
- [ ] All test suites passing
- [ ] No flaky tests
- [ ] CI/CD pipeline green

---

## Performance Validation

### Webhook Latency
- [ ] P95 latency <350ms (target from Story 3.4)
- [ ] Verified via k6 load test: `k6 run scripts/load-test.js`
- [ ] Results logged and reviewed

**Command**: `k6 run scripts/load-test.js`

### Frontend Performance
- [ ] Lighthouse CI passing (Performance ≥80)
- [ ] LCP <2s (Largest Contentful Paint)
- [ ] Bundle size <500KB
- [ ] TTI <2s (Time to Interactive)

**Verification**: Check Lighthouse CI reports or run locally

### Database Performance
- [ ] Query optimization verified (selective columns, indexes)
- [ ] Connection pooling enabled (Neon)
- [ ] Cache hit rate acceptable (Redis)

**Verification**: Check Neon dashboard for query performance

---

## Production Deployment Verification

### Vercel Configuration
- [ ] Project created: `orylo-production`
- [ ] Custom domain configured: `https://orylo.com`
- [ ] SSL certificate valid (padlock icon)
- [ ] Environment variables set (all required)
- [ ] Build successful
- [ ] Deployment successful

**Verification**: Visit Vercel Dashboard → Deployments

### Environment Variables
- [ ] `DATABASE_URL` (Neon production)
- [ ] `REDIS_URL` (Upstash production)
- [ ] `BETTER_AUTH_SECRET`
- [ ] `BETTER_AUTH_URL` (https://orylo.com)
- [ ] `STRIPE_SECRET_KEY` (live key)
- [ ] `STRIPE_WEBHOOK_SECRET` (production)
- [ ] `CRON_SECRET`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] `LOG_LEVEL=info`
- [ ] All other required variables

**Verification**: Vercel Dashboard → Settings → Environment Variables

### Database
- [ ] Migrations run successfully
- [ ] All tables created
- [ ] Indexes created
- [ ] Connection pooling enabled

**Verification**: Check Neon dashboard or run migration command

### Redis
- [ ] Production instance created
- [ ] TLS enabled
- [ ] Connection tested

**Verification**: Test connection from production environment

### Stripe Webhooks
- [ ] Production endpoint configured: `https://orylo.com/api/webhooks/stripe`
- [ ] Events subscribed: `payment_intent.created`, `charge.dispute.created`
- [ ] Webhook secret configured in Vercel
- [ ] Test webhook received successfully

**Verification**: Stripe Dashboard → Webhooks → Test endpoint

---

## Smoke Testing (Production)

### Test 1: Homepage
- [ ] Visit `https://orylo.com`
- [ ] Page loads without errors
- [ ] SSL certificate valid
- [ ] No console errors

### Test 2: Login Flow
- [ ] Navigate to login page
- [ ] Enter test credentials
- [ ] Login successful
- [ ] Redirected to dashboard
- [ ] Session persists

### Test 3: Dashboard Load
- [ ] Dashboard loads after login
- [ ] Detection feed visible (or empty state)
- [ ] Stats panel displays
- [ ] Filters visible

### Test 4: Stripe OAuth
- [ ] Click "Connect Stripe"
- [ ] OAuth flow completes
- [ ] Success confirmation appears
- [ ] Stripe account linked

### Test 5: Webhook → Detection
- [ ] Trigger test webhook (Stripe CLI or test payment)
- [ ] Detection appears in feed (within 2s)
- [ ] Detection has correct data
- [ ] SSE update received

### Test 6: Block Customer
- [ ] Click Block button on detection
- [ ] Confirm in dialog
- [ ] Toast notification appears
- [ ] Customer status updated

### Test 7: Mobile Responsive
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Mobile navigation works
- [ ] Detection cards stack correctly
- [ ] Tap targets adequate (44px+)

---

## Monitoring & Observability

### Vercel Analytics
- [ ] Analytics enabled
- [ ] Dashboard accessible
- [ ] Metrics tracking (P95 latency, error rate)

### PostHog
- [ ] Events tracking configured
- [ ] Dashboard accessible
- [ ] Test events appearing
- [ ] Beta KPIs dashboard created

**Verification**: PostHog Dashboard → Events

### Health Endpoint
- [ ] `GET /api/health` returns 200
- [ ] Database check passes
- [ ] Redis check passes

**Command**: `curl https://orylo.com/api/health`

### Logging
- [ ] Structured logging working (tslog)
- [ ] Logs visible in Vercel
- [ ] Error tracking configured (if Sentry enabled)

---

## Security Verification

### HTTPS
- [ ] HTTPS enforced (redirects HTTP to HTTPS)
- [ ] SSL certificate valid
- [ ] Security headers configured

**Verification**: Check browser padlock icon

### Authentication
- [ ] Better Auth configured correctly
- [ ] Secure cookies (HttpOnly, Secure, SameSite)
- [ ] Session management working

### PCI Compliance
- [ ] No full card numbers stored
- [ ] Only Stripe tokens used
- [ ] Verified via audit (Story 3.5)

### GDPR Compliance
- [ ] Privacy policy live at `/privacy`
- [ ] Data retention policy implemented (90 days)
- [ ] Right to deletion API working
- [ ] Data export API working

---

## Documentation Verification

### Core Documentation
- [ ] README.md updated (value prop, architecture)
- [ ] Beta onboarding guide created (PM task)
- [ ] FAQ document created (PM task)
- [ ] Privacy policy live at `/privacy`
- [ ] Rollback procedure documented

**Verification**: Check `docs/` directory

### Support Channels
- [ ] Bug report template created
- [ ] Feature request template created
- [ ] Discord server configured (PM task)

**Verification**: Check `.github/ISSUE_TEMPLATE/`

---

## Technical GO/NO-GO Criteria

### ✅ GO if ALL conditions met:
- All 29 stories completed
- All tests passing (unit, integration, E2E)
- P95 latency <500ms (buffer from 350ms target)
- Production smoke tests pass (7/7)
- Environment variables configured
- Database and Redis connected
- Stripe webhooks working
- Monitoring configured
- Security verified

### ❌ NO-GO if ANY condition met:
- Critical bugs in production
- Performance >1s P95 latency
- E2E tests failing
- Stripe OAuth broken
- SSE not working
- Database connection failing
- Security vulnerabilities

---

## Quick Verification Commands

```bash
# Run all tests
cd apps/web
bun run test                    # Unit tests
bun run test:integration:run    # Integration tests
bun run test:e2e               # E2E tests

# Performance testing
k6 run scripts/load-test.js     # Load test

# Health check
curl https://orylo.com/api/health

# Check deployment
# Visit Vercel Dashboard → Deployments
```

---

## Notes

- This checklist should be completed by PM/QA with Dev support
- All technical items must be verified before GO decision
- Document any blockers or issues found
- Update this checklist as needed during validation
