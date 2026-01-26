import { pgTable, text, timestamp, boolean, real, jsonb, index } from "drizzle-orm/pg-core";
import { fraudDetections } from "./fraud-detections";
import { organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table AISuggestions
 * 
 * Stores AI-powered suggestions for whitelisting/blacklisting customers
 * Story 4.1: Suggestions IA pour Whitelist/Blacklist
 */
export const aiSuggestions = pgTable(
  "ai_suggestions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    detectionId: text("detection_id")
      .notNull()
      .references(() => fraudDetections.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["whitelist", "blacklist"] }).notNull(),
    confidence: real("confidence").notNull(), // 0-1
    suggestion: jsonb("suggestion").notNull(), // {reasoning: string, factors: string[]}
    accepted: boolean("accepted").default(false).notNull(),
    merchantAction: text("merchant_action"), // 'accepted', 'rejected', 'modified'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    detectionIdIdx: index("ai_suggestions_detection_id_idx").on(table.detectionId),
    organizationIdIdx: index("ai_suggestions_organization_id_idx").on(table.organizationId),
    typeIdx: index("ai_suggestions_type_idx").on(table.type),
  })
);

export const aiSuggestionsRelations = relations(aiSuggestions, ({ one }) => ({
  detection: one(fraudDetections, {
    fields: [aiSuggestions.detectionId],
    references: [fraudDetections.id],
  }),
  organization: one(organization, {
    fields: [aiSuggestions.organizationId],
    references: [organization.id],
  }),
}));

export const aiSuggestionsSchema = createSelectSchema(aiSuggestions);
export const createAISuggestionSchema = createInsertSchema(aiSuggestions);

export type AISuggestion = InferSelectModel<typeof aiSuggestions>;
export type NewAISuggestion = InferInsertModel<typeof aiSuggestions>;
