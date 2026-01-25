import { pgTable, text, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { Organization, organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table CustomRules
 * 
 * Règles personnalisées par organisation
 */
export const customRules = pgTable("custom_rules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

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

export const customRulesRelations = relations(customRules, ({ one }) => ({
  organization: one(organization, {
    fields: [customRules.organizationId],
    references: [organization.id],
  }),
}));

export const customRulesSchema = createSelectSchema(customRules);
export const createCustomRulesSchema = createInsertSchema(customRules);

export type CustomRule = InferSelectModel<typeof customRules> & {
  organization: Organization;
};
export type NewCustomRule = InferInsertModel<typeof customRules>;