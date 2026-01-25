import { Logger } from "tslog";

/**
 * Structured Logging with tslog
 * 
 * Story 3.3: Production-grade logging
 * AC1: Structured JSON logs in production
 * AC2: Environment-based log levels (INFO prod, DEBUG dev)
 */

// AC2: Environment-based log levels
const LOG_LEVEL =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = new Logger({
  name: "orylo",
  type: process.env.NODE_ENV === "production" ? "json" : "pretty",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  minLevel: LOG_LEVEL as any, // tslog expects specific log level type
  prettyLogTimeZone: "local",
  prettyLogTemplate:
    "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}} {{logLevelName}} ",
});

/**
 * Structured log helpers for common events
 */

export const logWebhookReceived = (eventId: string, type: string) => {
  logger.info("Webhook received", { eventId, type, component: "webhook" });
};

export const logDetectionCreated = (
  detectionId: string,
  decision: string,
  score: number
) => {
  logger.info("Detection created", {
    detectionId,
    decision,
    score,
    component: "detector",
  });
};

export const logError = (error: Error, context: Record<string, unknown>) => {
  logger.error("Error occurred", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logChargeback = (
  customerId: string,
  organizationId: string,
  totalChargebacks: number
) => {
  logger.warn("Chargeback processed", {
    customerId,
    organizationId,
    totalChargebacks,
    component: "chargeback",
  });
};
