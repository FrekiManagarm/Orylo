import { pgTable, text, timestamp, integer, json, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./organizations";

/**
 * Table FraudDetections
 * 
 * Stocke tous les résultats de détection
 */
export const fraudDetections = pgTable(
  "fraud_detections",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    
    // Stripe payment intent ID
    paymentIntentId: text("payment_intent_id").notNull(),
    
    // Customer info
    customerId: text("customer_id"),
    customerEmail: text("customer_email"),
    
    // Transaction details
    amount: integer("amount").notNull(), // en centimes
    currency: text("currency").notNull(),
    
    // Fraud detection results
    decision: text("decision").notNull(), // ALLOW, REVIEW, BLOCK
    score: integer("score").notNull(), // 0-100
    detectorResults: json("detector_results").notNull(), // Array de DetectorResult
    
    // Metadata
    executionTimeMs: integer("execution_time_ms").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orgIdIdx: index("fraud_detections_org_id_idx").on(table.organizationId),
    paymentIntentIdx: index("fraud_detections_payment_intent_idx").on(table.paymentIntentId),
    decisionIdx: index("fraud_detections_decision_idx").on(table.decision),
    createdAtIdx: index("fraud_detections_created_at_idx").on(table.createdAt),
  })
);
