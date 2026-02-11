import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { customRules } from "@orylo/database";
import { eq, asc, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const ConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum([">", "<", "=", "!=", "IN"]),
  value: z.union([z.number(), z.string(), z.array(z.string())]),
});

const CreateRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  condition: ConditionSchema,
  action: z.enum(["BLOCK", "REVIEW", "ALLOW"]),
  scoreModifier: z.number().int().min(-100).max(100).optional().default(0),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().min(0).optional().default(100),
});

/**
 * GET /api/rules — List custom rules for current organization (max 10 per PRD)
 */
export async function GET() {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await db
      .select()
      .from(customRules)
      .where(eq(customRules.organizationId, org.id))
      .orderBy(asc(customRules.priority), desc(customRules.createdAt));

    return Response.json({ data: rules });
  } catch (error) {
    console.error("GET /api/rules:", error);
    return Response.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rules — Create a custom rule
 */
export async function POST(request: NextRequest) {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
    });
    if (!org?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingCount = await db
      .select()
      .from(customRules)
      .where(eq(customRules.organizationId, org.id));
    if (existingCount.length >= 10) {
      return Response.json(
        { error: "Maximum 10 rules per organization" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = CreateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [rule] = await db
      .insert(customRules)
      .values({
        organizationId: org.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        condition: parsed.data.condition as object,
        action: parsed.data.action,
        scoreModifier: parsed.data.scoreModifier ?? 0,
        isActive: parsed.data.isActive ?? true,
        priority: parsed.data.priority ?? 100,
      })
      .returning();

    return Response.json({ data: rule });
  } catch (error) {
    console.error("POST /api/rules:", error);
    return Response.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}
