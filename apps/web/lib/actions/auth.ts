"use server";

import { headers } from "next/headers";
import { auth, AuthOrganization, AuthSession } from "@/lib/auth/auth";

export async function getCurrentOrganization() {
  try {
    return await auth.api.getFullOrganization({ headers: await headers() }) as AuthOrganization;
  } catch (error) {
    console.error("❌ Error getting current organization:", error);
    throw new Error("Failed to get current organization");
  }
}

export async function getCurrentSession() {
  try {
    return await auth.api.getSession({ headers: await headers() }) as AuthSession;
  } catch (error) {
    console.error("❌ Error getting current session:", error);
    throw new Error("Failed to get current session");
  }
}

export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return !!session;
}

export async function requireOrganization() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error("Unauthorized");
  }
  return !!organization;
}

export async function requireAuthAndOrganization() {
  const session = await requireAuth();
  const organization = await requireOrganization();
  if (!session || !organization) {
    return false;
  }
  return true;
}