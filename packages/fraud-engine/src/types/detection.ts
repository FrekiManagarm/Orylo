import { z } from "zod";
import type {
  OrganizationId,
  PaymentIntentId,
  CustomerId,
  DetectorId,
} from "./branded";

/**
 * Context fourni à chaque detector
 */
export interface DetectionContext {
  organizationId: OrganizationId;
  paymentIntentId: PaymentIntentId;
  customerId: CustomerId | null;
  amount: number;
  currency: string;
  customerEmail: string | null;
  customerIp: string | null;
  cardCountry: string | null;
  cardLast4: string | null;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Résultat retourné par un detector
 */
export interface DetectorResult {
  detectorId: DetectorId;
  score: number; // 0-100
  confidence: number; // 0-100
  reason: string;
  metadata?: Record<string, unknown>;
}

/**
 * Décision finale du fraud engine
 */
export enum FraudDecision {
  ALLOW = "ALLOW",
  REVIEW = "REVIEW",
  BLOCK = "BLOCK",
}

/**
 * Résultat complet du fraud detection
 */
export interface FraudDetectionResult {
  decision: FraudDecision;
  score: number; // Score agrégé 0-100
  detectorResults: DetectorResult[];
  executionTimeMs: number;
  timestamp: Date;
}

/**
 * Schéma Zod pour validation du context
 */
export const DetectionContextSchema = z.object({
  organizationId: z.string(),
  paymentIntentId: z.string(),
  customerId: z.string().nullable(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  customerEmail: z.string().email().nullable(),
  customerIp: z.string().nullable(),
  cardCountry: z.string().min(2).max(2).nullable(),
  cardLast4: z.string().min(4).max(4).nullable(),
  metadata: z.record(z.string(), z.unknown()),
  timestamp: z.date(),
});
