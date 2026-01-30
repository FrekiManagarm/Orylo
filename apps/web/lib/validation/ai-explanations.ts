import { z } from "zod";

/**
 * Validation schemas for AI explanations endpoints
 *
 * Story 4.2: ADR-010 compliant input validation
 */

export const DetectionIdSchema = z.uuid("Invalid detection ID format");
