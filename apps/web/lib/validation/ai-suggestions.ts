import { z } from "zod";

/**
 * Validation schemas for AI suggestions endpoints
 * 
 * Story 4.1: ADR-010 compliant input validation
 */

export const DetectionIdSchema = z.string().uuid("Invalid detection ID format");

export const SuggestionIdSchema = z.string().uuid("Invalid suggestion ID format");
