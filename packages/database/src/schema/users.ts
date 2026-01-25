import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { Session, session } from "./sessions";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
}));

export const userSchema = createSelectSchema(user);
export const createUserSchema = createInsertSchema(user);

export type User = InferSelectModel<typeof user> & {
  sessions: Session[];
};

export type NewUser = InferInsertModel<typeof user>;