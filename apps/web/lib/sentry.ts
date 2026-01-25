/**
 * Sentry Error Tracking (Optional)
 * 
 * Story 3.3 AC5: Error tracking with Sentry
 * 
 * Condition: Include Sentry if budget allows (€15/month within €300 NFR6 budget)
 * Installation required: bun add @sentry/nextjs
 */

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized || !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  try {
    // Dynamic import to avoid errors if package not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require("@sentry/nextjs");

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% sampling
      beforeSend(event) {
        // Remove PII
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.log("[Sentry] Initialized");
  } catch {
    console.warn(
      "[Sentry] Package not installed. Run: bun add @sentry/nextjs"
    );
  }
}

// Auto-initialize if DSN is set
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  initSentry();
}
