"use client";

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [organizationClient({
    schema: {
      organization: {
        additionalFields: {
          smsNotifications: {
            type: "boolean",
            required: false,
          },
          phoneNumber: {
            type: "string",
            required: false,
          },
          emailNotifications: {
            type: "boolean",
            required: false,
          },
          trialEndsAt: {
            type: "date",
            required: false,
          },
          trialStartedAt: {
            type: "date",
            required: false,
          },
        },
      },
    },
  })],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
  resetPassword,
  requestPasswordReset,
  useActiveOrganization
} = authClient;
