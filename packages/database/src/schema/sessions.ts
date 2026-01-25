import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { User, user } from "./users";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
},
  (table) => [index("session_userId_idx").on(table.userId)],);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const sessionSchema = createSelectSchema(session);
export const createSessionSchema = createInsertSchema(session);

export type Session = InferSelectModel<typeof session> & {
  user: User;
};

export type NewSession = InferInsertModel<typeof session>;