# Epic 4: Infrastructure Setup Guide

**Epic**: Epic 4 - Système de Décisions Assisté par IA  
**Status**: 📋 Preparation  
**Timeline**: Before Sprint 6 (Week 7)  
**Owner**: DevOps / Backend Team

---

## Overview

Ce document guide la préparation de l'infrastructure nécessaire pour l'Epic 4 (Système de Décisions Assisté par IA). L'infrastructure doit être prête avant le début du Sprint 6.

---

## Prerequisites Checklist

### ✅ Pre-Requisites (Must be completed before Epic 4)

- [ ] Epic 1 completed (Detection API functional)
- [ ] Epic 2 completed (Dashboard functional)
- [ ] Epic 3 completed (Production ready, observability stack)
- [ ] Database migrations for Epic 1-3 applied
- [ ] Redis/Upstash configured and tested
- [ ] Vercel production environment configured

---

## 1. Trigger.dev Setup

### 1.1 Create Trigger.dev Account

**Steps**:
1. Go to [https://trigger.dev](https://trigger.dev)
2. Sign up with GitHub account (recommended for team access)
3. Create new project: "Orylo Production"
4. Note down: **Project ID** and **API Key**

**Account Type**: Free tier (100K runs/month) → Upgrade to Pro ($20/mois) if needed

### 1.2 Install Trigger.dev SDK

```bash
# In apps/web directory
cd apps/web
bun add @trigger.dev/sdk@latest
```

### 1.3 Initialize Trigger.dev

```bash
# Run Trigger.dev CLI init
bunx trigger.dev@latest init

# Follow prompts:
# - Project ID: [from trigger.dev dashboard]
# - API Key: [from trigger.dev dashboard]
# - Framework: Next.js
# - Root directory: apps/web
```

### 1.4 Project Structure

Create the following structure:

```
apps/web/
├── trigger/
│   ├── client.ts                    # Trigger.dev client configuration
│   ├── jobs/
│   │   ├── ai-explanation.job.ts   # Story 4.2: AI explanation generation
│   │   └── analyze-feedback.job.ts # Story 4.4: Daily feedback analysis
│   └── index.ts                     # Job exports
└── .env.local                       # Environment variables
```

### 1.5 Environment Variables

Add to `.env.local` (and Vercel production):

```bash
# Trigger.dev Configuration
TRIGGER_SECRET_KEY=tr_dev_...          # From trigger.dev dashboard
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_ID=proj_...            # From trigger.dev dashboard
```

### 1.6 Test Trigger.dev Connection

Create test job to verify setup:

```typescript
// trigger/jobs/test-connection.job.ts
import { task } from "@trigger.dev/sdk/v3";

export const testConnection = task({
  id: "test-connection",
  run: async () => {
    console.log("Trigger.dev connection successful!");
    return { success: true, timestamp: new Date().toISOString() };
  },
});
```

Run test:
```bash
# Start Trigger.dev dev server
bunx trigger.dev@latest dev

# In another terminal, trigger the job
# (via API or dashboard)
```

**Verification**: Check Trigger.dev dashboard → Jobs → Should see "test-connection" job executed

---

## 2. LLM API Setup

### 2.1 OpenAI Setup (Primary Choice)

**Why OpenAI**: GPT-4o-mini is cost-effective ($0.15/1M input tokens, $0.60/1M output tokens)

**Steps**:
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new API key: "Orylo Production"
5. **IMPORTANT**: Copy key immediately (shown only once)
6. Set usage limits:
   - Hard limit: $200/month (Epic 4 budget)
   - Soft limit: $150/month (alert threshold)

**Model Choice**: `gpt-4o-mini` (cheaper than GPT-4, sufficient quality)

### 2.2 Anthropic Claude Setup (Backup Option)

**Why Anthropic**: Backup if OpenAI has issues, or for comparison testing

**Steps**:
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new API key: "Orylo Production"
5. Set usage limits: $200/month

**Model Choice**: `claude-3-haiku-20240307` (cheapest, fast)

### 2.3 Install LLM SDKs

```bash
# OpenAI SDK
bun add openai@latest

# Anthropic SDK (optional, for backup)
bun add @anthropic-ai/sdk@latest
```

### 2.4 Environment Variables

Add to `.env.local` (and Vercel production):

```bash
# OpenAI Configuration (Primary)
OPENAI_API_KEY=sk-...                  # From OpenAI dashboard
OPENAI_MODEL=gpt-4o-mini               # Model to use

# Anthropic Configuration (Optional Backup)
ANTHROPIC_API_KEY=sk-ant-...           # From Anthropic dashboard (optional)
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### 2.5 Create LLM Client Library

```typescript
// apps/web/lib/ai/llm-client.ts
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize OpenAI (primary)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Anthropic (backup, optional)
export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Unified LLM call function
export async function generateExplanation(
  prompt: string,
  options?: { model?: "openai" | "anthropic" }
): Promise<string> {
  const provider = options?.model || "openai";
  
  if (provider === "openai") {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert en détection de fraude..." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    return completion.choices[0].message.content || "";
  }
  
  // Fallback to Anthropic if OpenAI fails
  if (anthropic) {
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });
    return message.content[0].type === "text" ? message.content[0].text : "";
  }
  
  throw new Error("No LLM provider available");
}
```

### 2.6 Test LLM Connection

Create test script:

```typescript
// scripts/test-llm.ts
import { generateExplanation } from "../apps/web/lib/ai/llm-client";

async function test() {
  try {
    const result = await generateExplanation(
      "Explique en français pourquoi une transaction de 100€ depuis la France avec une carte américaine est suspecte."
    );
    console.log("✅ LLM test successful!");
    console.log("Response:", result);
  } catch (error) {
    console.error("❌ LLM test failed:", error);
    process.exit(1);
  }
}

test();
```

Run test:
```bash
bun run scripts/test-llm.ts
```

**Verification**: Should see French explanation generated successfully

---

## 3. Database Schema Migrations

### 3.1 Create Migration Files

Create Drizzle migrations for Epic 4 tables:

```bash
cd packages/database
bun run drizzle-kit generate
```

**Tables to create**:
- `ai_suggestions` (Story 4.1)
- `ai_explanations` (Story 4.2)
- `ai_rule_recommendations` (Story 4.3)
- `ai_feedback` (Story 4.4)

### 3.2 Migration Files Location

```
packages/database/
├── drizzle/
│   └── migrations/
│       └── 000X_epic4_ai_tables.sql
```

### 3.3 Apply Migrations

**Development**:
```bash
cd packages/database
bun run drizzle-kit push
```

**Production** (Vercel):
- Migrations run automatically on deploy (via `package.json` scripts)
- Or manually via Neon dashboard SQL editor

**Verification**: Check database → Should see 4 new tables created

---

## 4. Redis Cache Configuration

### 4.1 Cache Keys Strategy

Add to Redis configuration:

```typescript
// apps/web/lib/ai/suggestion-cache.ts
export const CACHE_KEYS = {
  // Story 4.1: Suggestions cache
  suggestion: (detectionId: string) => `suggestion:${detectionId}`,
  pattern: (customerId: string) => `pattern:${customerId}`,
  
  // Story 4.2: Explanations cache (similar detections)
  explanation: (detectorPattern: string) => `explanation:${detectorPattern}`,
  
  // Story 4.3: Recommendations cache
  recommendations: (organizationId: string) => `recommendations:${organizationId}`,
  stats: (organizationId: string) => `stats:${organizationId}`,
};

export const CACHE_TTL = {
  suggestion: 3600,        // 1 hour
  pattern: 1800,           // 30 minutes
  explanation: 86400,      // 24 hours
  recommendations: 86400,  // 24 hours
  stats: 3600,             // 1 hour
};
```

### 4.2 Rate Limiting Configuration

Add rate limiting for LLM API calls:

```typescript
// apps/web/lib/ai/rate-limiter.ts
import { redis } from "@/lib/redis";

export async function checkRateLimit(
  organizationId: string,
  limit: number = 10 // 10 explanations per minute
): Promise<boolean> {
  const key = `rate_limit:ai_explanation:${organizationId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  return current <= limit;
}
```

---

## 5. Monitoring & Observability

### 5.1 PostHog Events

Add tracking events for Epic 4:

```typescript
// apps/web/lib/ai/analytics.ts
import { posthog } from "@/lib/posthog";

export function trackAISuggestion(
  organizationId: string,
  action: "accepted" | "rejected" | "modified",
  suggestionType: "whitelist" | "blacklist" | "rule"
) {
  posthog.capture({
    distinctId: organizationId,
    event: "ai_suggestion_action",
    properties: {
      action,
      suggestionType,
      timestamp: new Date().toISOString(),
    },
  });
}

export function trackAIExplanation(
  organizationId: string,
  tokensUsed: number,
  latency: number,
  model: string
) {
  posthog.capture({
    distinctId: organizationId,
    event: "ai_explanation_generated",
    properties: {
      tokensUsed,
      latency,
      model,
      timestamp: new Date().toISOString(),
    },
  });
}
```

### 5.2 Cost Monitoring

Create cost tracking:

```typescript
// apps/web/lib/ai/cost-tracker.ts
import { db } from "@orylo/database";
import { aiExplanations } from "@orylo/database/schema";

export async function getMonthlyCost(organizationId: string): Promise<number> {
  // Calculate cost based on tokens used
  // GPT-4o-mini: $0.15/1M input, $0.60/1M output
  const explanations = await db
    .select()
    .from(aiExplanations)
    .where(
      and(
        eq(aiExplanations.organizationId, organizationId),
        gte(aiExplanations.generatedAt, startOfMonth())
      )
    );
  
  const totalTokens = explanations.reduce((sum, e) => sum + (e.tokensUsed || 0), 0);
  const cost = (totalTokens / 1_000_000) * 0.15; // Rough estimate
  
  return cost;
}
```

---

## 6. Testing Infrastructure

### 6.1 Mock LLM for Tests

Create mock LLM client for testing:

```typescript
// apps/web/lib/ai/__mocks__/llm-client.ts
export const mockGenerateExplanation = jest.fn(async (prompt: string) => {
  return "Cette transaction a été signalée car elle présente plusieurs indicateurs de fraude...";
});

export const openai = {
  chat: {
    completions: {
      create: mockGenerateExplanation,
    },
  },
};
```

### 6.2 Test Environment Variables

Add to `.env.test`:

```bash
# Use mock LLM in tests
OPENAI_API_KEY=mock_key_for_testing
TRIGGER_SECRET_KEY=mock_trigger_key
```

---

## 7. Security Checklist

### 7.1 API Key Security

- [ ] API keys stored in environment variables (never in code)
- [ ] `.env.local` in `.gitignore` (verified)
- [ ] Vercel environment variables configured (production)
- [ ] API keys rotated every 90 days (schedule reminder)
- [ ] Usage limits set on OpenAI/Anthropic dashboards

### 7.2 Rate Limiting

- [ ] Rate limiting implemented (10 explanations/minute per org)
- [ ] Redis rate limit keys configured
- [ ] Error handling for rate limit exceeded

### 7.3 Data Privacy

- [ ] PII anonymization for feedback data (Story 4.4)
- [ ] Opt-in checkbox for sharing feedback
- [ ] Data retention policy: 90 days (same as detections)

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied (production)
- [ ] Trigger.dev project connected to production
- [ ] LLM API keys tested in staging
- [ ] Rate limiting tested
- [ ] Cost monitoring dashboard created

### 8.2 Post-Deployment

- [ ] Trigger.dev jobs visible in dashboard
- [ ] Test job execution successful
- [ ] LLM API calls working (test explanation generation)
- [ ] Redis cache working (test suggestion caching)
- [ ] PostHog events tracking (verify events appear)
- [ ] Cost alerts configured (if >€150/month)

---

## 9. Cost Estimation

### 9.1 Monthly Cost Breakdown

**Trigger.dev**:
- Free tier: $0 (100K runs/month)
- Pro tier: $20/mois (if >100K runs)

**OpenAI GPT-4o-mini**:
- Estimated: 50K explanations/month
- Average: 200 tokens/explanation = 10M tokens
- Cost: (10M / 1M) * $0.15 = **$1.50/mois**

**Total Estimated**: **$1.50-21.50/mois** (well under €200 budget)

### 9.2 Cost Monitoring

- Set alert at €150/month (75% of budget)
- Review costs weekly during beta
- Optimize if costs exceed €100/month

---

## 10. Troubleshooting Guide

### 10.1 Trigger.dev Issues

**Problem**: Jobs not executing
- Check `TRIGGER_SECRET_KEY` is correct
- Verify Trigger.dev dev server running (`bunx trigger.dev@latest dev`)
- Check Trigger.dev dashboard for errors

**Problem**: Jobs timing out
- Increase timeout in job config
- Check database connection
- Verify LLM API response time

### 10.2 LLM API Issues

**Problem**: OpenAI API rate limit
- Check rate limiting implementation
- Verify usage limits in OpenAI dashboard
- Implement exponential backoff retry

**Problem**: High costs
- Review token usage (check `tokensUsed` in DB)
- Optimize prompts (shorter, more focused)
- Consider caching more aggressively

### 10.3 Database Issues

**Problem**: Migrations failing
- Check database connection string
- Verify table names don't conflict
- Check foreign key constraints

---

## 11. Success Criteria

Infrastructure is ready when:

- [x] Trigger.dev account created and connected
- [x] Test job executes successfully
- [x] OpenAI API key configured and tested
- [x] Database migrations applied (4 new tables)
- [x] Redis cache configured for suggestions/explanations
- [x] Rate limiting tested and working
- [x] PostHog events tracking configured
- [x] Cost monitoring dashboard created
- [x] Environment variables set in Vercel production
- [x] Documentation complete

---

## 12. Next Steps

Once infrastructure is ready:

1. **Story 4.1**: Start with suggestion engine (no LLM needed initially)
2. **Story 4.2**: Implement Trigger.dev job for explanations
3. **Story 4.3**: Add recommendation engine
4. **Story 4.4**: Implement feedback tracking

---

**Created**: 2026-01-26  
**Owner**: DevOps / Backend Team  
**Last Updated**: 2026-01-26
