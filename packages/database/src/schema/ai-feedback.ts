import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { aiSuggestions } from "./ai-suggestions";
import { organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table AIFeedback
 * 
 * Stores merchant feedback on AI suggestions for learning and improvement
 * Story 4.4: Feedback Loop & Apprentissage des Overrides
 */
export const aiFeedback = pgTable(
  "ai_feedback",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    suggestionId: text("suggestion_id")
      .notNull()
      .references(() => aiSuggestions.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    merchantAction: text("merchant_action", {
      enum: ["accepted", "rejected", "modified"],
    }).notNull(),
    merchantReason: text("merchant_reason"), // Optional
    context: jsonb("context").notNull(), // AIFeedback context (detectionId, suggestionType, originalConfidence, detectionContext)
    anonymized: boolean("anonymized").default(false).notNull(), // If shared for model improvement
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    suggestionIdIdx: index("ai_feedback_suggestion_id_idx").on(table.suggestionId),
    merchantActionIdx: index("ai_feedback_merchant_action_idx").on(table.merchantAction),
    createdAtIdx: index("ai_feedback_created_at_idx").on(table.createdAt),
    organizationIdIdx: index("ai_feedback_organization_id_idx").on(table.organizationId),
  })
);

export const aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  suggestion: one(aiSuggestions, {
    fields: [aiFeedback.suggestionId],
    references: [aiSuggestions.id],
  }),
  organization: one(organization, {
    fields: [aiFeedback.organizationId],
    references: [organization.id],
  }),
}));

export const aiFeedbackSchema = createSelectSchema(aiFeedback);
export const createAIFeedbackSchema = createInsertSchema(aiFeedback);

export type AIFeedback = InferSelectModel<typeof aiFeedback>;
export type NewAIFeedback = InferInsertModel<typeof aiFeedback>;
