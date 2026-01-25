import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Invitation, invitation } from "./invitations";
import { Member, member } from "./members";

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),
    stripeAccountId: text("stripe_account_id"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

// Alias for backward compatibility with existing code
export const organizations = organization;

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

export const organizationSchema = createSelectSchema(organization);
export const createOrganizationSchema = createInsertSchema(organization);

export type Organization = InferSelectModel<typeof organization> & {
  members: Member[];
  invitations: Invitation[];
};

export type NewOrganization = InferInsertModel<typeof organization>;