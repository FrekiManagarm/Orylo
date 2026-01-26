import { pgTable, text, timestamp, boolean, real, jsonb, index } from "drizzle-orm/pg-core";
import { organization } from "./organizations";
import { customRules } from "./custom-rules";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table AIRuleRecommendations
 * 
 * Stores AI-generated rule recommendations for merchants
 * Story 4.3: Recommandations de Règles Custom Personnalisées
 */
export const aiRuleRecommendations = pgTable(
  "ai_rule_recommendations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    ruleSuggestion: jsonb("rule_suggestion").notNull(), // RuleRecommendation (condition, action, scoreModifier, etc.)
    confidence: real("confidence").notNull(), // 0-1
    applied: boolean("applied").default(false).notNull(),
    customRuleId: text("custom_rule_id").references(() => customRules.id, {
      onDelete: "set null",
    }), // If applied, link to custom_rules
    effectiveness: real("effectiveness"), // Success rate after application (0-1)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("ai_rule_recommendations_organization_id_idx").on(
      table.organizationId
    ),
    appliedIdx: index("ai_rule_recommendations_applied_idx").on(table.applied),
  })
);

export const aiRuleRecommendationsRelations = relations(
  aiRuleRecommendations,
  ({ one }) => ({
    organization: one(organization, {
      fields: [aiRuleRecommendations.organizationId],
      references: [organization.id],
    }),
    customRule: one(customRules, {
      fields: [aiRuleRecommendations.customRuleId],
      references: [customRules.id],
    }),
  })
);

export const aiRuleRecommendationsSchema = createSelectSchema(aiRuleRecommendations);
export const createAIRuleRecommendationSchema = createInsertSchema(aiRuleRecommendations);

export type AIRuleRecommendation = InferSelectModel<typeof aiRuleRecommendations>;
export type NewAIRuleRecommendation = InferInsertModel<typeof aiRuleRecommendations>;
