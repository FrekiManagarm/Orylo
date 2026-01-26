import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";
import { OrganizationIdSchema } from "@/lib/validation/ai-feedback";
import { z } from "zod";

/**
 * POST /api/organizations/[id]/privacy-settings
 * 
 * Story 4.4: AC7 - Update privacy opt-in setting for feedback sharing
 * 
 * Security (ADR-010):
 * - Validates organizationId with Zod schema
 * - Verifies Better Auth session
 * - Verifies organization belongs to user's session (RLS)
 * - Rate limiting: 10 req/min per organization
 */
const PrivacySettingsSchema = z.object({
  shareFeedbackForModelImprovement: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract organizationId from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionOrganizationId = (session.user as any).organizationId as
      | string
      | undefined;

    if (!sessionOrganizationId) {
      return Response.json(
        { error: "Organization ID not found in session" },
        { status: 400 }
      );
    }

    // 3. Get and validate organizationId from params
    const { id } = await params;
    const validatedOrganizationId = OrganizationIdSchema.parse(id);

    // 4. Verify organization belongs to user (RLS check)
    if (validatedOrganizationId !== sessionOrganizationId) {
      return Response.json(
        { error: "Organization access denied" },
        { status: 403 }
      );
    }

    // 5. Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedBody = PrivacySettingsSchema.parse(body);

    // 6. Update organization privacy setting
    await db
      .update(organization)
      .set({
        shareFeedbackForModelImprovement:
          validatedBody.shareFeedbackForModelImprovement,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, validatedOrganizationId));

    return Response.json({
      success: true,
      message: "Privacy settings updated",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    console.error("Error updating privacy settings:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
