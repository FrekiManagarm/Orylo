import { Organization, organization } from "./organizations";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { User, user } from "./users";
import { InferSelectModel, InferInsertModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const invitationSchema = createSelectSchema(invitation);
export const createInvitationSchema = createInsertSchema(invitation);

export type Invitation = InferSelectModel<typeof invitation> & {
  organization: Organization;
  user: User;
};

export type NewInvitation = InferInsertModel<typeof invitation>;