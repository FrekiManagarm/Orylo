"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { BlockCustomerButton } from "@/components/block-customer-button";
import { WhitelistCustomerButton } from "@/components/whitelist-customer-button";
import { QuickActionsMenu } from "@/components/quick-actions-menu";
import { toast } from "sonner";

/**
 * Detection type matching API response
 */
export type Detection = {
  id: string;
  paymentIntentId: string;
  customerEmail: string | null;
  amount: number; // cents
  currency: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  score: number;
  createdAt: string;
};

/**
 * DetectionCard Component
 * 
 * Story 2.1:
 * - AC2: Uses Shadcn Card component
 * - AC3: Displays customer email, amount, decision badge, risk score, timestamp, Block button
 * - AC4: Badge variants - BLOCK (destructive), REVIEW (warning), ALLOW (success)
 * - AC9: Mobile responsive (full-width, touch-friendly)
 * - AC10: Accessibility (keyboard navigation, ARIA labels)
 * 
 * Story 2.4:
 * - AC1: Trigger details dialog on click (except CTA button)
 * 
 * Story 2.7:
 * - AC1: Block button integration
 * 
 * Story 2.9:
 * - AC1-AC6: Quick actions menu (3-dot)
 * 
 * Story 2.11:
 * - AC3: Full-width cards on mobile
 * - AC6: Tap targets ≥44px on mobile
 */
export function DetectionCard({
  detection,
  onClick,
}: {
  detection: Detection;
  onClick?: () => void;
}) {
  const { customerEmail, amount, currency, decision, score, createdAt, paymentIntentId } = detection;

  // Handle card click (Story 2.4 - AC1)
  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if click is on card, not on button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onClick?.();
  };

  // Handle keyboard navigation (Story 2.4 - AC1)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  // Format amount to currency (AC3)
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  // Badge variant mapping (AC4)
  const getBadgeVariant = (decision: Detection["decision"]): "destructive" | "warning" | "success" => {
    switch (decision) {
      case "BLOCK":
        return "destructive";
      case "REVIEW":
        return "warning";
      case "ALLOW":
        return "success";
      default:
        return "destructive";
    }
  };

  // Format timestamp (AC3)
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow cursor-pointer"
      aria-label={`Detection card for transaction ${paymentIntentId}`}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Customer Email (AC3) */}
            <h3 className="font-semibold text-base truncate">
              {customerEmail || "Unknown Customer"}
            </h3>
            {/* Payment Intent ID */}
            <p className="text-sm text-muted-foreground truncate">
              {paymentIntentId}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Decision Badge (AC4) */}
            <Badge variant={getBadgeVariant(decision)}>
              {decision}
            </Badge>
            {/* Story 2.9: Quick Actions Menu */}
            <QuickActionsMenu
              onViewDetails={() => onClick?.()}
              onBlock={() => toast.info("Use the Block button below")}
              onWhitelist={() => toast.info("Use the Whitelist button below")}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-between gap-4">
          {/* Amount (AC3) */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold">{formattedAmount}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          {/* Risk Score (AC3) */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className="text-xl font-semibold">{score}/100</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {/* Story 2.7: Block Customer Button - Story 2.11: Full-width on mobile, 44px tap target */}
        <BlockCustomerButton
          customerEmail={customerEmail || paymentIntentId}
          className="flex-1 md:flex-initial min-h-[44px]"
        />
        {/* Story 2.8: Whitelist Customer Button - Story 2.11: Full-width on mobile, 44px tap target */}
        <WhitelistCustomerButton
          customerEmail={customerEmail || paymentIntentId}
          className="flex-1 md:flex-initial min-h-[44px]"
        />
      </CardFooter>
    </Card>
  );
}
