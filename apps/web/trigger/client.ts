import { TriggerClient } from "@trigger.dev/sdk/v3";

/**
 * Trigger.dev Client Configuration
 * 
 * Story 4.2: ADR-006 - Background Jobs Architecture
 * 
 * Environment variables required:
 * - TRIGGER_SECRET_KEY: From trigger.dev dashboard
 * - TRIGGER_API_URL: https://api.trigger.dev (default)
 * - TRIGGER_PROJECT_ID: From trigger.dev dashboard
 */
export const client = new TriggerClient({
  id: process.env.TRIGGER_PROJECT_ID || "proj_local",
  apiKey: process.env.TRIGGER_SECRET_KEY || "tr_dev_local",
  apiUrl: process.env.TRIGGER_API_URL || "https://api.trigger.dev",
});
