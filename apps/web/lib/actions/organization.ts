"use server";

import { auth, AuthOrganization } from "../auth/auth";
import { headers } from "next/headers";
import { db } from "../db";
import { organization, OrganizationOnboardingConfig } from "@orylo/database";
import { eq } from "drizzle-orm";

export async function createOrganization(name: string, slug: string, logo: string) {
  const newOrg = await auth.api.createOrganization({
    headers: await headers(),
    body: {
      keepCurrentActiveOrganization: false,
      name,
      slug,
      logo,
    },
  });

  if (!newOrg) {
    throw new Error("Failed to create organization");
  }

  return newOrg as AuthOrganization;
}

export async function updateOrganizationOnboarding(
  organizationId: string,
  onboardingConfig: OrganizationOnboardingConfig,
  completed: boolean = false
) {
  const result = await db
    .update(organization)
    .set({
      onboardingConfig,
      onboardingCompleted: completed,
      updatedAt: new Date(),
    })
    .where(eq(organization.id, organizationId))
    .returning();

  if (!result || result.length === 0) {
    throw new Error("Failed to update organization onboarding");
  }

  return result[0];
}

export async function completeOrganizationOnboarding(organizationId: string) {
  const result = await db
    .update(organization)
    .set({
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(organization.id, organizationId))
    .returning();

  if (!result || result.length === 0) {
    throw new Error("Failed to complete organization onboarding");
  }

  return result[0];
}