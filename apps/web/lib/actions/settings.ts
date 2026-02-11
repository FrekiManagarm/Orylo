"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";
import type { OrganizationSettings } from "@orylo/database";

export async function getOrganizationSettings(): Promise<OrganizationSettings | null> {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });
  if (!org?.id) return null;
  const row = await db
    .select({ settings: organization.settings })
    .from(organization)
    .where(eq(organization.id, org.id))
    .limit(1);
  const settings = row[0]?.settings;
  return (settings as OrganizationSettings) ?? null;
}

export async function updateOrganizationSettings(
  input: Partial<OrganizationSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const current = await db
      .select({ settings: organization.settings })
      .from(organization)
      .where(eq(organization.id, org.id))
      .limit(1);

    const existing = (current[0]?.settings ?? {}) as OrganizationSettings;
    const next: OrganizationSettings = {
      ...existing,
      ...input,
    };

    await db
      .update(organization)
      .set({
        settings: next,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, org.id));

    return { success: true };
  } catch (e) {
    console.error("updateOrganizationSettings:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update settings",
    };
  }
}
