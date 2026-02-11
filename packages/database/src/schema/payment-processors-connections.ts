import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Organization, organization } from "./organizations";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const paymentProcessorsConnections = pgTable(
  "payment_processors_connections",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    paymentProcessor: text("payment_processor").notNull(),
    accessToken: text("access_token").notNull(),
    accountId: text("account_id").notNull(),
    refreshToken: text("refresh_token").notNull(),
    scope: text("scope").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    livemode: boolean("livemode").default(false).notNull(),
    webhookSecret: text("webhook_secret"),
    webhookEndpointId: text("webhook_endpoint_id"),
    connectedAt: timestamp("connected_at").defaultNow().notNull(),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("payment_processors_connections_account_id_idx").on(table.accountId)]
);

export const paymentProcessorsConnectionsRelations = relations(paymentProcessorsConnections, ({ one }) => ({
  organization: one(organization, {
    fields: [paymentProcessorsConnections.organizationId],
    references: [organization.id],
  }),
}));

export type PaymentProcessorsConnections = InferSelectModel<typeof paymentProcessorsConnections> & {
  organization: Organization;
};
export type NewPaymentProcessorsConnections = InferInsertModel<typeof paymentProcessorsConnections>;

export const createPaymentProcessorsConnectionsSchema = createInsertSchema(paymentProcessorsConnections);
export const selectPaymentProcessorsConnectionsSchema = createSelectSchema(paymentProcessorsConnections);