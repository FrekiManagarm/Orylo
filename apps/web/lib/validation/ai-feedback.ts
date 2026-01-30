import { z } from "zod";

/**
 * Validation schemas for AI feedback endpoints
 *
 * Story 4.4: ADR-010 compliant input validation
 */

export const SuggestionIdSchema = z.uuid("Invalid suggestion ID format");

export const OrganizationIdSchema = z.uuid("Invalid organization ID format");

export const MerchantReasonSchema = z
  .string()
  .max(500, "Reason too long")
  .optional();
