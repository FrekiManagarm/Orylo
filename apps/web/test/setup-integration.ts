import { beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  fraudDetections,
  customerTrustScores,
  webhookEvents,
  organizations,
} from "@orylo/database";

/**
 * Integration Test Setup
 * 
 * Story 3.6 AC1: Test database setup
 * 
 * Uses TEST_DATABASE_URL or falls back to DATABASE_URL
 * Cleans up test data after each test for isolation
 */

// AC1: Use test database (Neon branch or main DB with cleanup)
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

beforeAll(async () => {
  // Set test database URL if provided
  if (TEST_DATABASE_URL && TEST_DATABASE_URL !== process.env.DATABASE_URL) {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
  }

  console.log("[Test Setup] Initializing integration test database");

  // Verify database connection
  try {
    await db.execute(sql`SELECT 1`);
    console.log("[Test Setup] Database connection verified");
  } catch (error) {
    console.error("[Test Setup] Database connection failed:", error);
    throw error;
  }
});

afterEach(async () => {
  // Clean up after each test to ensure isolation
  try {
    await db.delete(fraudDetections);
    await db.delete(customerTrustScores);
    await db.delete(webhookEvents);
    // Keep organizations (seed data)
    console.log("[Test Setup] Cleaned up test data");
  } catch (error) {
    console.warn("[Test Setup] Cleanup failed (non-critical):", error);
  }
});

afterAll(async () => {
  console.log("[Test Setup] Integration tests completed");
  // Optionally drop test database or leave for inspection
});
