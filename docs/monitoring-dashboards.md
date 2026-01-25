# Monitoring Dashboards

**Story 3.3 AC8**: Monitoring dashboard bookmarks and access information

---

## Vercel Analytics

- **URL**: https://vercel.com/orylo/analytics
- **Metrics**: 
  - API latency (P95, P99)
  - Error rates
  - Page performance (LCP, FID, CLS)
- **Alerts**: P95 latency >350ms
- **Access**: Automatic for Vercel projects

---

## PostHog

- **URL**: https://app.posthog.com/project/xxxxx
- **Dashboards**:
  - **Beta KPIs**: User signups, active users, feature usage
  - **Fraud Metrics**: Detections per day, block rate, trust score distribution
- **Funnels**: 
  - Signup → Stripe Connect → First Detection
- **Events Tracked**:
  - `user_login`
  - `stripe_connected`
  - `customer_blocked`
  - `detection_created`
  - `webhook_processed`
- **Access**: Requires `NEXT_PUBLIC_POSTHOG_KEY` environment variable

---

## Sentry (Optional)

- **URL**: https://sentry.io/orylo
- **Monitors**: 
  - Error rate
  - Crash-free sessions
  - Performance issues
- **Alerts**: 
  - New error types
  - Spike in error rate (>10 errors/min)
- **Access**: Requires `NEXT_PUBLIC_SENTRY_DSN` environment variable
- **Status**: Optional (€15/month)

---

## Neon Database

- **URL**: https://console.neon.tech/
- **Metrics**: 
  - Query performance
  - Connection pool usage
  - Storage usage
  - Active connections
- **Alerts**: 
  - High connection count
  - Slow queries (>1s)

---

## Upstash Redis

- **URL**: https://console.upstash.com/
- **Metrics**: 
  - Cache hit rate
  - Memory usage
  - Latency (P50, P95, P99)
  - Commands per second
- **Alerts**: 
  - Memory usage >80%
  - Cache hit rate <50%

---

## Health Check Endpoint

- **URL**: https://orylo.com/api/health
- **Status Codes**:
  - `200`: All services healthy
  - `503`: One or more services down
- **Response**:
  ```json
  {
    "status": "healthy" | "unhealthy",
    "checks": {
      "database": true | false,
      "redis": true | false
    },
    "timestamp": "2026-01-24T12:00:00Z",
    "version": "1.0.0"
  }
  ```

---

## Monitoring Best Practices

1. **Daily Checks**: Review Vercel Analytics for error spikes
2. **Weekly Reviews**: PostHog dashboards for user behavior trends
3. **Alert Thresholds**: 
   - P95 latency >500ms (investigate)
   - Error rate >1% (critical)
   - Cache hit rate <60% (optimize)
4. **On-Call**: Monitor Sentry alerts (if enabled) for production errors
