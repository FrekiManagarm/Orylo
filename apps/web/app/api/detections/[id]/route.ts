import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { fraudDetections } from "@orylo/database";
import { eq, and } from "drizzle-orm";

/** Seuils alignés avec AdditiveScoringStrategy (allow=30, block=70) */
function scoreToDecision(score: number): "ALLOW" | "REVIEW" | "BLOCK" {
  if (score < 30) return "ALLOW";
  if (score >= 70) return "BLOCK";
  return "REVIEW";
}

type DetectorResultRow = {
  detectorId?: string;
  score?: number;
  confidence?: number;
  reason?: string;
  decision?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Transforme la ligne fraud_detections (DB) en format attendu par le dialog
 * (riskScore, trustScore, confidence, customerIp, customerCountry, detectorResults avec decision).
 */
function toDetectionDetails(row: {
  id: string;
  paymentIntentId: string;
  customerEmail: string | null;
  amount: number;
  currency: string;
  decision: string;
  score: number;
  detectorResults: unknown;
  createdAt: Date;
}) {
  const detectorList = (Array.isArray(row.detectorResults)
    ? row.detectorResults
    : []) as DetectorResultRow[];

  const geo = detectorList.find(
    (d) =>
      String(d.detectorId ?? "").toLowerCase().includes("geolocation") ||
      String(d.detectorId ?? "").toLowerCase().includes("geo")
  );
  const metadata = geo?.metadata as Record<string, unknown> | undefined;
  const customerIp = (metadata?.customerIp as string) ?? undefined;
  const customerCountry = (metadata?.ipCountry as string) ?? undefined;

  const confidence =
    detectorList.length > 0
      ? Math.round(
          detectorList.reduce((sum, d) => sum + (d.confidence ?? 50), 0) /
            detectorList.length
        )
      : 100;

  const detectorResults = detectorList.map((d) => ({
    detectorId: d.detectorId ?? "unknown",
    score: typeof d.score === "number" ? d.score : 0,
    decision:
      (d.decision as "ALLOW" | "REVIEW" | "BLOCK") ??
      scoreToDecision(typeof d.score === "number" ? d.score : 0),
    metadata: d.metadata,
  }));

  return {
    id: row.id,
    paymentIntentId: row.paymentIntentId,
    customerEmail: row.customerEmail ?? "",
    customerIp: customerIp || undefined,
    customerCountry: customerCountry || undefined,
    amount: row.amount,
    currency: row.currency,
    decision: row.decision as "ALLOW" | "REVIEW" | "BLOCK",
    riskScore: row.score,
    confidence,
    detectorResults,
    trustScore: 100 - row.score,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

/**
 * GET /api/detections/[id]
 *
 * Story 2.4 - AC2: Fetch single detection with full details
 *
 * Security (from Dev Notes):
 * - Requires Better Auth session
 * - Filters by organizationId (RLS)
 * - Returns 401 if unauthorized, 403 if wrong org, 404 if not found
 *
 * Response format (DetectionDetails):
 * id, paymentIntentId, customerEmail, customerIp?, customerCountry?,
 * amount, currency, decision, riskScore, confidence,
 * detectorResults, trustScore, createdAt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await auth.api.getFullOrganization({
      headers: request.headers,
    });

    if (!organization?.id) {
      return Response.json(
        { error: "Organization not found" },
        { status: 400 }
      );
    }

    const organizationId = organization.id;
    const { id } = await params;
    const detectionId = id;

    const detectionResult = await db
      .select()
      .from(fraudDetections)
      .where(
        and(
          eq(fraudDetections.id, detectionId),
          eq(fraudDetections.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!detectionResult[0]) {
      return Response.json(
        { error: "Detection not found" },
        { status: 404 }
      );
    }

    const row = detectionResult[0];
    const payload = toDetectionDetails({
      id: row.id,
      paymentIntentId: row.paymentIntentId,
      customerEmail: row.customerEmail,
      amount: row.amount,
      currency: row.currency,
      decision: row.decision,
      score: row.score,
      detectorResults: row.detectorResults,
      createdAt: row.createdAt,
    });

    return Response.json(payload);
  } catch (error) {
    console.error("Error fetching detection:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
