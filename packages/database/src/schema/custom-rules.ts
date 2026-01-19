import { pgTable, text, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./organizations";

/**
 * Table CustomRules
 * 
 * Règles personnalisées par organisation
 */
export const customRules = pgTable("custom_rules", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  description: text("description"),
  
  // Condition (en JSON pour flexibilité)
  condition: json("condition").notNull(),
  
  // Action à prendre si condition match
  action: text("action").notNull(), // BLOCK, REVIEW, ALLOW
  scoreModifier: integer("score_modifier").notNull().default(0), // +/- score
  
  isActive: boolean("is_active").default(true).notNull(),
  priority: integer("priority").notNull().default(100),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
