import { db } from "./db";
import { member } from "@orylo/database";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "./auth/auth";

/**
 * Onboarding Utility
 *
 * Creates an organization automatically for new users
 */

/**
 * Generate a unique slug from organization name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .slice(0, 50); // Limit length
}

/**
 * Check if a slug is available
 */
async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await db.query.organization.findFirst({
    where: (org, { eq }) => eq(org.slug, slug),
  });
  return !existing;
}

/**
 * Generate a unique slug
 */
async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let slug = baseSlug;
  let counter = 1;

  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Create an organization and add user as owner member
 *
 * @param userId - The user ID
 * @param userName - The user's name (used to generate organization name)
 * @returns The created organization
 */
export async function createUserOrganization(userId: string, userName: string) {
  // Generate organization name from user name
  const orgName = `${userName}'s Organization`;
  const slug = await generateUniqueSlug(orgName);

  // Create organization
  const newOrg = await auth.api.createOrganization({
    body: {
      name: orgName,
      slug,
      keepCurrentActiveOrganization: false,
    },
  });

  // Add user as owner member
  await db.insert(member).values({
    id: createId(),
    organizationId: newOrg?.id || "",
    userId: userId,
    role: "owner", // Better Auth default role for organization creator
    createdAt: new Date(),
  });

  return newOrg;
}
