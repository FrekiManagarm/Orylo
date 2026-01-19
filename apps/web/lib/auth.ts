import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth Configuration - Orylo V3
 * 
 * Documentation: https://www.better-auth.com/docs
 */
export const auth = betterAuth({
  /**
   * PostgreSQL Database (Neon Serverless)
   * @see https://www.better-auth.com/docs/adapters/postgresql
   */
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),

  /**
   * Plugins
   * @see https://www.better-auth.com/docs/plugins/organization
   */
  plugins: [
    // Organization plugin pour multi-tenancy
    organization(),
  ],

  /**
   * Authentication Methods
   */
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign-in après inscription
  },

  /**
   * Session Management
   * @see https://www.better-auth.com/docs/concepts/session-management
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Update session tous les 1 jour
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session 5 minutes
    },
  },

  /**
   * Advanced Options
   */
  advanced: {
    cookiePrefix: "orylo", // Préfixe pour les cookies
  },
});

export type Session = typeof auth.$Infer.Session;
