import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { Organization, organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table CustomerTrustScores
 * 
 * Stocke le trust score de chaque client
 */
export const customerTrustScores = pgTable(
  "customer_trust_scores",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    customerId: text("customer_id").notNull(), // Stripe customer ID
    customerEmail: text("customer_email"),

    trustScore: integer("trust_score").notNull().default(50), // 0-100

    // Statistiques
    totalTransactions: integer("total_transactions").notNull().default(0),
    fraudulentTransactions: integer("fraudulent_transactions").notNull().default(0),
    totalAmountSpent: integer("total_amount_spent").notNull().default(0), // en centimes

    // Liste status
    status: text("status").notNull().default("normal"), // normal, whitelisted, blacklisted, vip

    // Story 3.2: Chargeback tracking
    totalChargebacks: integer("total_chargebacks").default(0).notNull(),
    lastChargebackDate: timestamp("last_chargeback_date"),

    // Timestamps
    firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const customerTrustScoresRelations = relations(customerTrustScores, ({ one }) => ({
  organization: one(organization, {
    fields: [customerTrustScores.organizationId],
    references: [organization.id],
  }),
}));

export const customerTrustScoresSchema = createSelectSchema(customerTrustScores);
export const createCustomerTrustScoreSchema = createInsertSchema(customerTrustScores);

export type CustomerTrustScore = InferSelectModel<typeof customerTrustScores> & {
  organization: Organization;
};
export type NewCustomerTrustScore = InferInsertModel<typeof customerTrustScores>;