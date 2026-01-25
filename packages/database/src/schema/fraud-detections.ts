import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { Organization, organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table FraudDetections
 * 
 * Stocke tous les résultats de détection
 */
export const fraudDetections = pgTable(
  "fraud_detections",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

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
  }
);

export const fraudDetectionsRelations = relations(fraudDetections, ({ one }) => ({
  organization: one(organization, {
    fields: [fraudDetections.organizationId],
    references: [organization.id],
  }),
}));

export const fraudDetectionsSchema = createSelectSchema(fraudDetections);
export const createFraudDetectionSchema = createInsertSchema(fraudDetections);

export type FraudDetection = InferSelectModel<typeof fraudDetections> & {
  organization: Organization;
};
export type NewFraudDetection = InferInsertModel<typeof fraudDetections>;