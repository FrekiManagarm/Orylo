import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { customRules } from "@orylo/database";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const ConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum([">", "<", "=", "!=", "IN"]),
  value: z.union([z.number(), z.string(), z.array(z.string())]),
});

const UpdateRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional().nullable(),
  condition: ConditionSchema.optional(),
  action: z.enum(["BLOCK", "REVIEW", "ALLOW"]).optional(),
  scoreModifier: z.number().int().min(-100).max(100).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
});

/**
 * GET /api/rules/[id] — Get one rule (org-scoped)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [rule] = await db
      .select()
      .from(customRules)
      .where(
        and(
          eq(customRules.id, id),
          eq(customRules.organizationId, org.id)
        )
      )
      .limit(1);

    if (!rule) {
      return Response.json({ error: "Rule not found" }, { status: 404 });
    }

    return Response.json({ data: rule });
  } catch (error) {
    console.error("GET /api/rules/[id]:", error);
    return Response.json(
      { error: "Failed to fetch rule" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rules/[id] — Update a rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = UpdateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updatePayload: {
      name?: string;
      description?: string | null;
      condition?: object;
      action?: "BLOCK" | "REVIEW" | "ALLOW";
      scoreModifier?: number;
      isActive?: boolean;
      priority?: number;
      updatedAt: Date;
    } = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
    if (parsed.data.description !== undefined)
      updatePayload.description = parsed.data.description;
    if (parsed.data.condition !== undefined)
      updatePayload.condition = parsed.data.condition as object;
    if (parsed.data.action !== undefined) updatePayload.action = parsed.data.action;
    if (parsed.data.scoreModifier !== undefined)
      updatePayload.scoreModifier = parsed.data.scoreModifier;
    if (parsed.data.isActive !== undefined)
      updatePayload.isActive = parsed.data.isActive;
    if (parsed.data.priority !== undefined)
      updatePayload.priority = parsed.data.priority;

    const [rule] = await db
      .update(customRules)
      .set(updatePayload)
      .where(
        and(
          eq(customRules.id, id),
          eq(customRules.organizationId, org.id)
        )
      )
      .returning();

    if (!rule) {
      return Response.json({ error: "Rule not found" }, { status: 404 });
    }

    return Response.json({ data: rule });
  } catch (error) {
    console.error("PATCH /api/rules/[id]:", error);
    return Response.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rules/[id] — Delete a rule
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [deleted] = await db
      .delete(customRules)
      .where(
        and(
          eq(customRules.id, id),
          eq(customRules.organizationId, org.id)
        )
      )
      .returning({ id: customRules.id });

    if (!deleted) {
      return Response.json({ error: "Rule not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/rules/[id]:", error);
    return Response.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    );
  }
}
