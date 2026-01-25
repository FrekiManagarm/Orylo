import { pgTable, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { Organization, organization } from "./organizations";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * Table WebhookEvents
 * 
 * Idempotency tracking for Stripe webhook events
 * Prevents duplicate processing of the same event
 */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    stripeEventId: text("stripe_event_id").unique().notNull(),
    type: text("type").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    processed: boolean("processed").default(false).notNull(),
    retryCount: integer("retry_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => ({
    stripeEventIdIdx: index("webhook_events_stripe_event_id_idx").on(table.stripeEventId),
    organizationIdIdx: index("webhook_events_organization_id_idx").on(table.organizationId),
  })
);

export const webhookEventRelations = relations(webhookEvents, ({ one }) => ({
  organization: one(organization, {
    fields: [webhookEvents.organizationId],
    references: [organization.id],
  }),
}));

export const webhookEventSchema = createSelectSchema(webhookEvents);
export const createWebhookEventSchema = createInsertSchema(webhookEvents);

export type WebhookEvent = InferSelectModel<typeof webhookEvents> & {
  organization: Organization;
};

export type NewWebhookEvent = InferInsertModel<typeof webhookEvents>;