# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All unit tests pass (`bun run test`)
- [ ] All integration tests pass (`bun run test:integration:run`)
- [ ] All E2E tests pass (`bun run test:e2e`)
- [ ] Code review approved
- [ ] No linter errors
- [ ] TypeScript compilation successful

### Database
- [ ] Database migrations tested in staging
- [ ] Migration scripts reviewed
- [ ] Backup strategy verified
- [ ] Connection pooling enabled (Neon)

### Environment Variables
- [ ] All required env vars set in Vercel Dashboard
- [ ] Production secrets configured
- [ ] Preview env vars separate from production
- [ ] `.env.example` updated with all variables

### Infrastructure
- [ ] Vercel project configured (orylo-production)
- [ ] Custom domain configured (orylo.com)
- [ ] SSL certificate valid
- [ ] DNS records configured correctly
- [ ] Redis production instance ready (Upstash)
- [ ] Database production instance ready (Neon Scale tier)

### External Services
- [ ] Stripe webhook endpoint configured
- [ ] Stripe webhook events subscribed
- [ ] PostHog project configured
- [ ] Sentry project configured (if enabled)
- [ ] Monitoring dashboards accessible

### Security
- [ ] All secrets marked as "Sensitive" in Vercel
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS settings verified
- [ ] Rate limiting configured (if applicable)

## Deployment

### Vercel Configuration
- [ ] Project name: `orylo-production`
- [ ] Framework: Next.js
- [ ] Root directory: `apps/web`
- [ ] Build command: `cd apps/web && bun run build`
- [ ] Install command: `bun install`
- [ ] Production branch: `main` only
- [ ] Preview deployments: Enabled for other branches

### Deployment Steps
1. [ ] Merge PR to `main` branch
2. [ ] Vercel auto-deploys (or trigger manually)
3. [ ] Monitor deployment logs
4. [ ] Wait for deployment to complete
5. [ ] Verify deployment URL accessible

## Post-Deployment Smoke Testing

### Basic Functionality
- [ ] Production domain loads (https://orylo.com)
- [ ] SSL certificate valid (padlock icon)
- [ ] Homepage renders correctly
- [ ] No console errors

### Authentication
- [ ] Login page accessible
- [ ] Login flow completes successfully
- [ ] Session persists after login
- [ ] Logout works correctly

### Dashboard
- [ ] Dashboard loads after login
- [ ] Detection feed loads (or shows empty state)
- [ ] Stats panel displays correctly
- [ ] Filters work correctly

### Actions
- [ ] Block customer action works
- [ ] Whitelist customer action works
- [ ] Toast notifications appear
- [ ] Actions persist to database

### Real-Time
- [ ] SSE connection established (check Network tab)
- [ ] New detections appear in feed (if webhook triggered)
- [ ] Feed updates without page refresh

### Mobile
- [ ] Mobile navigation sheet opens
- [ ] Detection cards stack vertically
- [ ] Action buttons have adequate tap targets
- [ ] Responsive design works on 375px viewport

### API Endpoints
- [ ] Health check: `GET /api/health` returns 200
- [ ] Detections API: `GET /api/detections` returns data
- [ ] Webhook endpoint: `POST /api/webhooks/stripe` processes events

### Webhooks
- [ ] Stripe webhook endpoint receives events
- [ ] Webhook signature verification works
- [ ] Detections created from webhooks
- [ ] Idempotency prevents duplicates

### Monitoring
- [ ] Vercel Analytics showing data
- [ ] PostHog events appearing in dashboard
- [ ] Error tracking working (Sentry if enabled)
- [ ] Health endpoint returns healthy status

## Post-Deployment Monitoring (First 24 Hours)

### Metrics to Watch
- [ ] Error rate < 1%
- [ ] P95 latency < 350ms
- [ ] Uptime > 99.9%
- [ ] Database connection pool healthy
- [ ] Redis cache hit rate acceptable

### Alerts Configured
- [ ] Error rate spike alert
- [ ] Latency degradation alert
- [ ] Health check failure alert
- [ ] Database connection failure alert

### Communication
- [ ] Deployment announced in Discord #announcements (if major change)
- [ ] Beta users notified (if breaking change)
- [ ] Support team briefed (if user-facing changes)

## Rollback Readiness

- [ ] Last stable deployment identified
- [ ] Rollback procedure documented
- [ ] Emergency contacts updated
- [ ] Rollback tested in staging (if possible)

## Documentation

- [ ] Deployment notes updated
- [ ] Changelog updated (if applicable)
- [ ] API documentation updated (if API changes)
- [ ] User-facing docs updated (if feature changes)

## Notes

- Run smoke tests within 5 minutes of deployment
- Monitor closely for first hour
- Be ready to rollback if critical issues arise
- Document any issues encountered
