import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "./db";
import { createUserOrganization } from "./onboarding";

/**
 * Better Auth Configuration - Orylo V3
 *
 * Documentation: https://www.better-auth.com/docs
 *
 * Onboarding: Automatically creates an organization for new users
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    organization({
      organizationHooks: {
        // Hook called after organization is created via Better Auth API
        afterCreateOrganization: async ({ organization, user }) => {
          console.log(
            `[Onboarding] Organization created: ${organization.name} for user ${user.email}`
          );
        },
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create organization automatically for new users
          try {
            const org = await createUserOrganization(user.id, user.name);
            console.log(
              `[Onboarding] Created organization ${org.name} (${org.slug}) for user ${user.email}`
            );
          } catch (error) {
            console.error("[Onboarding] Failed to create organization:", error);
            // Don't throw - allow user creation to succeed even if org creation fails
            // The organization can be created later via the UI
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Set active organization on first session if user has an organization
          if (!session.activeOrganizationId) {
            const userOrgs = await db.query.member.findFirst({
              where: (member, { eq }) => eq(member.userId, session.userId),
              orderBy: (member, { asc }) => [asc(member.createdAt)],
            });

            if (userOrgs) {
              return {
                data: {
                  ...session,
                  activeOrganizationId: userOrgs.organizationId,
                },
              };
            }
          }
          return { data: session };
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "orylo",
  },
});

export type Session = typeof auth.$Infer.Session;
