import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./organizations";

/**
 * Table CustomerTrustScores
 * 
 * Stocke le trust score de chaque client
 */
export const customerTrustScores = pgTable(
  "customer_trust_scores",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    
    customerId: text("customer_id").notNull(), // Stripe customer ID
    customerEmail: text("customer_email"),
    
    trustScore: integer("trust_score").notNull().default(50), // 0-100
    
    // Statistiques
    totalTransactions: integer("total_transactions").notNull().default(0),
    fraudulentTransactions: integer("fraudulent_transactions").notNull().default(0),
    totalAmountSpent: integer("total_amount_spent").notNull().default(0), // en centimes
    
    // Liste status
    status: text("status").notNull().default("normal"), // normal, whitelisted, blacklisted, vip
    
    // Timestamps
    firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orgCustomerIdx: index("customer_trust_scores_org_customer_idx").on(
      table.organizationId,
      table.customerId
    ),
    statusIdx: index("customer_trust_scores_status_idx").on(table.status),
  })
);
