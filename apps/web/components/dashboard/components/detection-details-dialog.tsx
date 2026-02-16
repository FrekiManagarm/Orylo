"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Shield, ShieldAlert, ShieldCheck, Copy, CheckCircle } from "lucide-react";
import { BlockCustomerButton } from "@/components/dashboard/components/block-customer-button";
import { WhitelistCustomerButton } from "@/components/dashboard/components/whitelist-customer-button";
import { AISuggestionCard, type AISuggestion } from "@/components/dashboard/components/ai-suggestion-card";
import { AIExplanation } from "@/components/dashboard/components/ai-explanation";

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
  /** Optional className for DialogContent (e.g. dashboard-home dark theme) */
  contentClassName?: string;
};

export function DetectionDetailsDialog({
  detectionId,
  open,
  onOpenChange,
  contentClassName,
}: DetectionDetailsDialogProps) {
  const [detection, setDetection] = useState<DetectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // Fetch detection details when dialog opens
  useEffect(() => {
    if (!open || !detectionId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching is valid use case
    setIsLoading(true);

    fetch(`/api/detections/${detectionId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setDetection(data && !data.error ? data : null);
      })
      .catch((error) => {
        console.error("Error fetching detection:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open, detectionId]);

  // Fetch AI suggestion when detection is loaded
  useEffect(() => {
    if (!open || !detectionId || !detection) {
      return;
    }

    setIsLoadingSuggestion(true);

    fetch(`/api/detections/${detectionId}/suggestions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestion) {
          setSuggestion(data.suggestion);
        } else {
          setSuggestion(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching suggestion:", error);
        setSuggestion(null);
      })
      .finally(() => {
        setIsLoadingSuggestion(false);
      });
  }, [open, detectionId, detection]);

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

  // Trust score color (barre de progression)
  const getTrustScoreColor = (score: number): string => {
    if (score < 30) return "bg-destructive";
    if (score < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Detector name formatting
  const formatDetectorName = (detectorId: string): string => {
    return detectorId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-[700px] flex flex-col p-0",
          contentClassName
        )}
        aria-describedby="detection-sheet-description"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Detection Details
          </SheetTitle>
          <SheetDescription id="detection-sheet-description">
            Full breakdown of fraud analysis, detector results, and recommended actions.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 overflow-y-auto px-6 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : detection ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-8">
              {/* Header / Summary Section */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={getBadgeVariant(detection.decision)} className="px-3 py-1 text-sm font-medium uppercase tracking-wider">
                      {detection.decision}
                    </Badge>
                    <span className="text-sm text-zinc-500 font-mono">
                      {detection.createdAt && !isNaN(new Date(detection.createdAt).getTime())
                        ? formatDistanceToNow(new Date(detection.createdAt), { addSuffix: true })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-white">
                      {detection.trustScore}
                      <span className="text-sm text-zinc-500 ml-1">/100</span>
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Trust Score</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress
                    value={detection.trustScore}
                    className="h-2 bg-zinc-800"
                    indicatorClassName={getTrustScoreColor(detection.trustScore)}
                  />
                  <div className="flex justify-between text-xs text-zinc-500 font-mono">
                    <span>Risk: {detection.riskScore}</span>
                    <span>Confidence: {Math.round(detection.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* AI Suggestion */}
              {isLoadingSuggestion ? (
                <Skeleton className="h-24 w-full bg-zinc-800/50" />
              ) : suggestion ? (
                <AISuggestionCard
                  suggestion={suggestion}
                  detectionId={detection.id}
                  onAccept={() => {
                    fetch(`/api/detections/${detectionId}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setDetection(data);
                        setSuggestion(null);
                      })
                      .catch(console.error);
                  }}
                  onReject={() => setSuggestion(null)}
                />
              ) : null}

              {/* Details Grid - Clean Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Customer
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Email</span>
                      <div className="flex items-center gap-2 group">
                        <span className="text-sm text-white font-medium truncate max-w-[200px]">
                          {detection.customerEmail || "N/A"}
                        </span>
                        {detection.customerEmail && (
                          <button
                            onClick={() => copyToClipboard(detection.customerEmail, "email")}
                            className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {copiedField === "email" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {detection.customerIp && (
                      <div>
                        <span className="text-xs text-zinc-500 block mb-1">IP Address</span>
                        <span className="text-sm text-zinc-300 font-mono">
                          {detection.customerIp}
                          {detection.customerCountry && <span className="text-zinc-500 ml-1">({detection.customerCountry})</span>}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Transaction
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Amount</span>
                      <span className="text-lg font-bold text-white font-mono">
                        {formatAmount(detection.amount, detection.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block mb-1">Payment ID</span>
                      <div className="flex items-center gap-2 group">
                        <span className="text-xs text-zinc-400 font-mono truncate max-w-[180px]">
                          {detection.paymentIntentId}
                        </span>
                        <button
                          onClick={() => copyToClipboard(detection.paymentIntentId, "payment")}
                          className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {copiedField === "payment" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detector Analysis - Simplified List */}
              {detection.detectorResults && detection.detectorResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Analysis Results</h3>
                  <div className="space-y-2">
                    {detection.detectorResults.map((result) => (
                      <div key={result.detectorId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${result.decision === "BLOCK" ? "bg-rose-500" :
                            result.decision === "REVIEW" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                          <span className="text-sm font-medium text-zinc-200">
                            {formatDetectorName(result.detectorId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-zinc-500 font-mono">
                            Score: <span className="text-zinc-300">{result.score}</span>
                          </span>
                          <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${result.decision === "BLOCK" ? "border-rose-500/20 text-rose-400 bg-rose-500/10" :
                            result.decision === "REVIEW" ? "border-amber-500/20 text-amber-400 bg-amber-500/10" :
                              "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                            }`}>
                            {result.decision}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Explanation */}
              <div className="pt-2">
                <AIExplanation detectionId={detection.id} />
              </div>
            </div>

            <SheetFooter className="grid grid-cols-2 gap-3 border-t border-white/10 px-6 py-4 bg-zinc-900/50">
              <BlockCustomerButton
                customerEmail={detection.customerEmail}
                variant="destructive"
                size="lg"
                className="w-full bg-destructive"
              />
              <WhitelistCustomerButton
                customerEmail={detection.customerEmail}
                variant="outline"
                size="lg"
                className="w-full border-white/10 hover:bg-white/5 text-zinc-300"
              />
            </SheetFooter>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load detection details
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
