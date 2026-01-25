import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { Organization, organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table DeadLetterQueue
 * 
 * Stores failed webhook events after max retries
 * Allows manual review and reprocessing
 */
export const deadLetterQueue = pgTable("dead_letter_queue", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stripeEventId: text("stripe_event_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: json("payload").notNull(), // Full Stripe event
  errorMessage: text("error_message").notNull(),
  errorStack: text("error_stack"),
  retryCount: integer("retry_count").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deadLetterQueueRelations = relations(deadLetterQueue, ({ one }) => ({
  organization: one(organization, {
    fields: [deadLetterQueue.organizationId],
    references: [organization.id],
  }),
}));

export const deadLetterQueueSchema = createSelectSchema(deadLetterQueue);
export const createDeadLetterQueueSchema = createInsertSchema(deadLetterQueue);

export type DeadLetterQueue = InferSelectModel<typeof deadLetterQueue> & {
  organization: Organization;
};
export type NewDeadLetterQueue = InferInsertModel<typeof deadLetterQueue>;