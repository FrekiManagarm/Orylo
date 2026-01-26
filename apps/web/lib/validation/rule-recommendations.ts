import { z } from "zod";

/**
 * Validation schemas for rule recommendations endpoints
 * 
 * Story 4.3: ADR-010 compliant input validation
 */

export const OrganizationIdSchema = z.string().uuid("Invalid organization ID format");

export const RecommendationIdSchema = z.string().uuid("Invalid recommendation ID format");
