import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { fraudDetections } from "./fraud-detections";
import { organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table AIExplanations
 * 
 * Stores AI-generated explanations for fraud detections
 * Story 4.2: Explications IA des Décisions de Fraude
 */
export const aiExplanations = pgTable(
  "ai_explanations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    detectionId: text("detection_id")
      .notNull()
      .references(() => fraudDetections.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    explanation: text("explanation").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    model: text("model").notNull(), // 'gpt-4o-mini' or 'claude-3-haiku'
    tokensUsed: integer("tokens_used"),
    latency: integer("latency"), // ms
    triggerJobId: text("trigger_job_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    detectionIdIdx: index("ai_explanations_detection_id_idx").on(table.detectionId),
    organizationIdIdx: index("ai_explanations_organization_id_idx").on(table.organizationId),
  })
);

export const aiExplanationsRelations = relations(aiExplanations, ({ one }) => ({
  detection: one(fraudDetections, {
    fields: [aiExplanations.detectionId],
    references: [fraudDetections.id],
  }),
  organization: one(organization, {
    fields: [aiExplanations.organizationId],
    references: [organization.id],
  }),
}));

export const aiExplanationsSchema = createSelectSchema(aiExplanations);
export const createAIExplanationSchema = createInsertSchema(aiExplanations);

export type AIExplanation = InferSelectModel<typeof aiExplanations>;
export type NewAIExplanation = InferInsertModel<typeof aiExplanations>;
