# Stripe CLI Testing Guide

**Purpose**: Manual testing guide for Stripe webhook integration (Story 1.2 - AC9)

---

## Prerequisites

- Stripe account (test mode)
- Development server running on localhost:3000
- Stripe CLI installed

---

## Installation

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### Windows
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

---

## Setup

### 1. Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate with your Stripe account.

### 2. Get Webhook Secret

When you run `stripe listen`, it will output a webhook signing secret:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Output:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy this secret** and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Restart Dev Server

```bash
bun run dev
```

---

## Testing Webhooks

### Forward Webhooks to Localhost

In **Terminal 1**, start webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Keep this terminal open. You'll see webhook events here.

### Trigger Test Events

In **Terminal 2**, trigger test events:

```bash
# Trigger payment_intent.created (Story 1.2)
stripe trigger payment_intent.created

# Trigger with specific amount
stripe trigger payment_intent.created --add payment_intent:amount=5000

# Trigger with metadata
stripe trigger payment_intent.created \
  --add payment_intent:metadata[customer_ip]=1.2.3.4 \
  --add payment_intent:metadata[order_id]=test_order_123
```

---

## Expected Behavior

### Successful Webhook Processing

**Terminal 1 (stripe listen):**
```
2026-01-13 12:34:56   --> payment_intent.created [evt_xxxxx]
2026-01-13 12:34:56   <-- [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

**Application Logs:**
```json
{
  "level": "INFO",
  "message": "[stripe_webhook_received]",
  "eventId": "evt_xxxxx",
  "eventType": "payment_intent.created",
  "timestamp": "2026-01-13T12:34:56.789Z"
}

{
  "level": "INFO",
  "message": "[stripe_webhook_success]",
  "eventId": "evt_xxxxx",
  "paymentIntentId": "pi_xxxxx",
  "responseTimeMs": 145
}

{
  "level": "INFO",
  "message": "[fraud_detection_triggered]",
  "eventId": "evt_xxxxx",
  "organizationId": "org_xxxxx",
  "paymentIntentId": "pi_xxxxx"
}
```

### Response Time Verification

Response time should be **< 2000ms** (AC6):

```bash
# Check response time in application logs
grep "responseTimeMs" logs/app.log
```

---

## Testing Error Scenarios

### Invalid Signature

Stop `stripe listen` and send a manual request:

```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{"type": "payment_intent.created"}'
```

**Expected**: `400 Bad Request` - Invalid signature

**Log:**
```json
{
  "level": "ERROR",
  "message": "[stripe_webhook_signature_invalid]",
  "error": "Invalid signature"
}
```

### Missing Required Fields

Trigger event with incomplete data (simulated):

**Expected**: `500 Internal Server Error` - Missing required fields

**Log:**
```json
{
  "level": "ERROR",
  "message": "[stripe_webhook_missing_field]",
  "eventId": "evt_xxxxx",
  "paymentIntentId": "pi_xxxxx",
  "missingFields": {
    "amount": false,
    "currency": true
  }
}
```

---

## Verification Checklist

Use this checklist to verify Story 1.2 implementation:

- [ ] **AC1**: Webhook endpoint accessible at `/api/webhooks/stripe`
- [ ] **AC2**: Signature verified successfully
- [ ] **AC3**: Only `payment_intent.created` events processed
- [ ] **AC4**: All fields extracted: id, amount, currency, customer, metadata
- [ ] **AC5**: Fraud detection triggered asynchronously
- [ ] **AC6**: Response time < 2s
- [ ] **AC7**: 400 returned for invalid signature
- [ ] **AC7**: 500 returned for internal errors
- [ ] **AC8**: All events logged with INFO level
- [ ] **AC9**: Integration test passed with Stripe CLI

---

## Common Issues & Troubleshooting

### Issue: Webhook Secret Mismatch

**Symptom**: All webhooks return 400 Invalid Signature

**Solution**:
1. Check `.env.local` has correct `STRIPE_WEBHOOK_SECRET`
2. Restart dev server after updating env vars
3. Verify secret matches output from `stripe listen`

### Issue: No Organization Found

**Symptom**: Log shows `[stripe_webhook_no_org]`

**Solution**:
1. Ensure Stripe account is connected via OAuth (Story 1.1)
2. Check `organizations` table has `stripeAccountId` populated
3. Verify webhook includes `account` field

### Issue: Detection Not Triggered

**Symptom**: Webhook succeeds but no `[fraud_detection_triggered]` log

**Solution**:
1. Check organization ID is found
2. Verify `processFraudDetection()` is called
3. Look for `[fraud_detection_error]` logs
4. Note: Full detection requires Story 1.3 implementation

---

## Advanced Testing

### Test Multiple Events

```bash
# Trigger 10 events rapidly
for i in {1..10}; do
  stripe trigger payment_intent.created &
done
wait
```

Verify all 10 webhooks processed successfully.

### Test Different Event Types

```bash
# These should be ignored (AC3)
stripe trigger customer.created
stripe trigger charge.succeeded
stripe trigger payment_intent.succeeded
```

Expected: 200 OK but not processed (log shows `[stripe_webhook_ignored]`)

### Test Performance Under Load

```bash
# Install hey (HTTP load testing tool)
brew install hey

# Send 100 requests concurrently
hey -n 100 -c 10 -m POST \
  -H "stripe-signature: $(stripe listen --print-secret)" \
  http://localhost:3000/api/webhooks/stripe
```

Verify: All responses < 2s (AC6)

---

## Production Setup

When deploying to production:

1. **Create production webhook endpoint** in Stripe Dashboard
2. **Copy production webhook secret** to production env vars
3. **Set webhook URL** to: `https://yourdomain.com/api/webhooks/stripe`
4. **Select events**: Only `payment_intent.created`
5. **Enable webhook**: Activate in Stripe Dashboard

---

## Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Webhooks Locally](https://stripe.com/docs/webhooks/test)

---

**Last Updated**: 2026-01-13  
**Story**: 1.2 - Stripe Webhook Configuration & Handler
