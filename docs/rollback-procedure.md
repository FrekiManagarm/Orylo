# Production Rollback Procedure

## When to Rollback

- Critical bug affecting core functionality (login, detections, actions)
- Data loss or corruption
- Security vulnerability exposed
- Performance degradation (P95 >2s)
- Service outage (health check failing)

## Rollback Steps

### Step 1: Assess Impact (2 minutes)

1. Check Vercel Analytics for error spike
2. Check Sentry for error details (if enabled)
3. Check Discord #bug-reports for user reports
4. Check PostHog for event anomalies
5. Determine if rollback needed (critical impact vs minor bug)

**Decision Matrix:**

| Severity | Example | Action | Timeline |
|----------|---------|--------|----------|
| P0 (Critical) | Auth broken, data loss | Immediate rollback | <5 min |
| P1 (High) | Detection not saving | Rollback if no quick fix | <15 min |
| P2 (Medium) | UI bug, slow performance | Fix forward if possible | N/A |
| P3 (Low) | Typo, minor visual issue | Fix in next deploy | N/A |

### Step 2: Identify Last Stable Deployment (1 minute)

1. Go to Vercel Dashboard → Deployments
2. Sort by date (newest first)
3. Identify last deployment before bug (check commit message + timestamp)
4. Review deployment logs for any warnings/errors

### Step 3: Promote Previous Deployment (1 minute)

1. Click "..." menu on last stable deployment
2. Click "Promote to Production"
3. Confirm promotion
4. Wait for deployment to complete (~30 seconds)

**Alternative (if promotion fails):**
- Revert commit in GitHub
- Push to main branch
- Vercel will auto-deploy

### Step 4: Verify Rollback (2 minutes)

1. Visit https://orylo.com (or production domain)
2. Test login flow
3. Test detection feed load
4. Test block customer action
5. Check Vercel Analytics: Error rate should drop
6. Check health endpoint: `https://orylo.com/api/health` should return 200

### Step 5: Communicate (5 minutes)

1. Post in Discord #announcements:
   ```
   🚨 We've rolled back production due to [brief issue description].
   All services are now restored. We're investigating the root cause.
   Apologies for any disruption.
   ```
2. If user-facing impact: Email beta users via broadcast
3. Create postmortem document (within 24 hours)

### Step 6: Root Cause Analysis

1. Identify what caused the bug
2. Write postmortem: `docs/postmortems/YYYY-MM-DD-incident.md`
3. Add preventative measures (new tests, monitoring, etc.)
4. Fix bug in new PR with thorough testing

## Expected Rollback Time

- **Total**: <10 minutes (from decision to verified)
- **Downtime**: ~30 seconds (during deployment switch)

## Emergency Contacts

- **On-Call Engineer**: [Phone/Slack - to be configured]
- **Founder**: [Phone - to be configured]
- **Vercel Support**: support@vercel.com (Pro plan support)
- **Neon Support**: support@neon.tech
- **Upstash Support**: support@upstash.com

## Prevention Checklist

Before deploying to production:

- [ ] All tests pass (unit, integration, E2E)
- [ ] Code review approved
- [ ] Database migrations tested in staging
- [ ] Environment variables verified
- [ ] Smoke test checklist completed
- [ ] Rollback plan reviewed

## Post-Rollback Actions

1. **Immediate** (within 1 hour):
   - Verify all services restored
   - Monitor error rates
   - Communicate status to users

2. **Short-term** (within 24 hours):
   - Write postmortem
   - Identify root cause
   - Create fix PR with tests

3. **Long-term** (within 1 week):
   - Implement preventative measures
   - Update monitoring/alerting
   - Review deployment process

## Rollback Scenarios

### Scenario 1: Database Migration Failure

**Symptoms**: Database errors, migrations failing

**Action**:
1. Rollback deployment
2. Check migration logs
3. Fix migration locally
4. Test migration in staging
5. Redeploy with fixed migration

### Scenario 2: Environment Variable Missing

**Symptoms**: Application errors, missing config

**Action**:
1. Add missing env var in Vercel Dashboard
2. Redeploy (no rollback needed if non-critical)
3. If critical: Rollback, add env var, redeploy

### Scenario 3: API Route Breaking Change

**Symptoms**: API errors, 500 responses

**Action**:
1. Rollback deployment
2. Review API route changes
3. Fix breaking change
4. Add integration tests
5. Redeploy

### Scenario 4: Performance Degradation

**Symptoms**: Slow response times, timeouts

**Action**:
1. Check Vercel Analytics for latency spike
2. Review recent code changes
3. If P95 >2s: Consider rollback
4. If fixable quickly: Fix forward
5. Add performance monitoring

## Notes

- Always prioritize user experience over deployment velocity
- When in doubt, rollback (better safe than sorry)
- Document all rollbacks for postmortem analysis
- Use feature flags for risky changes (future enhancement)
