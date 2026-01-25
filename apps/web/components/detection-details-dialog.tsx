"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Shield, ShieldAlert, ShieldCheck, Copy, CheckCircle } from "lucide-react";
import { BlockCustomerButton } from "@/components/block-customer-button";
import { WhitelistCustomerButton } from "@/components/whitelist-customer-button";

/**
 * DetectionDetailsDialog Component
 * 
 * Story 2.4:
 * - AC1: Triggered by clicking detection card
 * - AC2: Shadcn Dialog (centered desktop, full-screen mobile)
 * - AC3: Customer Info, Transaction Details, Detector Results, Trust Score, Actions
 * - AC4: Detector Results table with decision, risk, metadata
 * - AC5: Trust Score with Progress bar
 * - AC6: Close via Escape, X button, click outside
 * - AC7: Focus trap, ARIA role="dialog"
 * 
 * Story 2.7:
 * - AC1: Block button integration in dialog actions
 * 
 * Story 2.8:
 * - AC1: Whitelist button integration in dialog actions
 * 
 * Story 2.11:
 * - AC5: Full-screen modal on mobile (<768px)
 */

export type DetectorResult = {
  detectorId: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  score: number;
  metadata?: Record<string, unknown>;
};

export type DetectionDetails = {
  id: string;
  paymentIntentId: string;
  customerEmail: string;
  customerIp?: string;
  customerCountry?: string;
  amount: number;
  currency: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  riskScore: number;
  confidence: number;
  detectorResults?: DetectorResult[];
  trustScore: number;
  createdAt: string;
};

type DetectionDetailsDialogProps = {
  detectionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DetectionDetailsDialog({
  detectionId,
  open,
  onOpenChange,
}: DetectionDetailsDialogProps) {
  const [detection, setDetection] = useState<DetectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch detection details when dialog opens
  useEffect(() => {
    if (!open || !detectionId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching is valid use case
    setIsLoading(true);
    
    fetch(`/api/detections/${detectionId}`)
      .then((res) => res.json())
      .then((data) => {
        setDetection(data);
      })
      .catch((error) => {
        console.error("Error fetching detection:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open, detectionId]);

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Format currency
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Badge variant helper
  const getBadgeVariant = (
    decision: "ALLOW" | "REVIEW" | "BLOCK"
  ): "success" | "warning" | "destructive" => {
    switch (decision) {
      case "BLOCK":
        return "destructive";
      case "REVIEW":
        return "warning";
      case "ALLOW":
        return "success";
    }
  };

  // Trust score color
  const getTrustScoreColor = (score: number): string => {
    if (score < 30) return "bg-destructive";
    if (score < 70) return "bg-warning";
    return "bg-success";
  };

  // Detector name formatting
  const formatDetectorName = (detectorId: string): string => {
    return detectorId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full h-full max-w-full md:max-w-[700px] md:h-auto md:max-h-[90vh] overflow-y-auto md:rounded-xl"
        aria-labelledby="detection-dialog-title"
      >
        <DialogHeader>
          <DialogTitle id="detection-dialog-title" className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Detection Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : detection ? (
          <div className="space-y-6">
            {/* Decision Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={getBadgeVariant(detection.decision)} className="text-sm">
                {detection.decision}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(detection.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* AC5: Trust Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Trust Score</h3>
                <span className="text-sm font-bold">
                  {detection.trustScore} / 100
                </span>
              </div>
              <Progress value={detection.trustScore}>
                <ProgressTrack className="h-3">
                  <ProgressIndicator
                    className={getTrustScoreColor(detection.trustScore)}
                  />
                </ProgressTrack>
              </Progress>
              <p className="text-xs text-muted-foreground">
                Risk Score: {detection.riskScore} | Confidence:{" "}
                {Math.round(detection.confidence * 100)}%
              </p>
            </div>

            {/* AC3: Customer Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {detection.customerEmail || "N/A"}
                    </span>
                    {detection.customerEmail && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          copyToClipboard(detection.customerEmail, "email")
                        }
                      >
                        {copiedField === "email" ? (
                          <CheckCircle className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {detection.customerIp && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IP Address:</span>
                    <span className="text-sm font-medium">
                      {detection.customerIp}
                      {detection.customerCountry &&
                        ` (${detection.customerCountry})`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AC3: Transaction Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Transaction Details
              </h3>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-bold">
                    {formatAmount(detection.amount, detection.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Intent:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-xs">
                      {detection.paymentIntentId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        copyToClipboard(detection.paymentIntentId, "payment")
                      }
                    >
                      {copiedField === "payment" ? (
                        <CheckCircle className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* AC4: Detector Results */}
            {detection.detectorResults && detection.detectorResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Detector Analysis</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Detector</TableHead>
                        <TableHead>Decision</TableHead>
                        <TableHead className="text-right">Risk</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Details
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detection.detectorResults.map((result) => (
                        <TableRow key={result.detectorId}>
                          <TableCell className="font-medium">
                            {formatDetectorName(result.detectorId)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getBadgeVariant(result.decision)}
                              className="text-xs"
                            >
                              {result.decision}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {result.score}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                            {result.metadata
                              ? Object.entries(result.metadata)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* AC3: Action Buttons - Story 2.11: 44px tap targets */}
            <div className="flex gap-3 pt-4 border-t">
              {/* Story 2.7: Block Customer Button */}
              <BlockCustomerButton
                customerEmail={detection.customerEmail}
                variant="destructive"
                size="default"
                className="flex-1 min-h-[44px]"
              />
              {/* Story 2.8: Whitelist Customer Button */}
              <WhitelistCustomerButton
                customerEmail={detection.customerEmail}
                variant="outline"
                size="default"
                className="flex-1 min-h-[44px]"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load detection details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
