"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Copy,
  CheckCircle,
  CreditCard,
  Mail,
  MapPin,
  Activity,
  Server,
  Clock,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { BlockCustomerButton } from "@/components/dashboard/components/block-customer-button";
import { WhitelistCustomerButton } from "@/components/dashboard/components/whitelist-customer-button";
import { AISuggestionCard, type AISuggestion } from "@/components/dashboard/components/ai-suggestion-card";
import { AIExplanation } from "@/components/dashboard/components/ai-explanation";

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

  // Reset data when dialog opens/closes or detectionId changes
  useEffect(() => {
    if (!open || !detectionId) {
      setDetection(null);
      setSuggestion(null);
      return;
    }
    setDetection(null);
    setSuggestion(null);
  }, [open, detectionId]);

  // Fetch detection details
  useEffect(() => {
    if (!open || !detectionId) return;

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

  // Fetch AI suggestion
  useEffect(() => {
    if (!open || !detectionId || !detection) return;

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "BLOCK": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "REVIEW": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "ALLOW": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "BLOCK": return <ShieldAlert className="h-5 w-5" />;
      case "REVIEW": return <AlertTriangle className="h-5 w-5" />;
      case "ALLOW": return <ShieldCheck className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

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
          "w-full sm:max-w-[600px] flex flex-col p-0 bg-black/95 backdrop-blur-xl border-l border-white/10",
          contentClassName
        )}
      >
        <SheetHeader className="px-6 py-4 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-base font-mono font-medium text-zinc-400 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            Détails de la détection
          </SheetTitle>
          {/* Close button is handled by SheetContent default */}
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 p-6 space-y-6">
            <Skeleton className="h-32 w-full bg-zinc-900" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full bg-zinc-900" />
              <Skeleton className="h-20 w-full bg-zinc-900" />
            </div>
            <Skeleton className="h-64 w-full bg-zinc-900" />
          </div>
        ) : detection ? (
          <div className="flex-1 overflow-y-auto">
            {/* Status Banner */}
            <div className={cn(
              "px-6 py-8 flex flex-col items-center justify-center text-center border-b border-white/5",
              detection.decision === "BLOCK" ? "bg-rose-950/10" :
                detection.decision === "REVIEW" ? "bg-amber-950/10" :
                  "bg-emerald-950/10"
            )}>
              <div className={cn(
                "p-3 rounded-full mb-4 ring-1 ring-inset",
                getDecisionColor(detection.decision)
              )}>
                {getDecisionIcon(detection.decision)}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                {detection.decision}
              </h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500 font-mono">
                <span>Score de risque: <span className="text-white">{detection.riskScore}</span></span>
                <span>•</span>
                <span>Confiance: <span className="text-white">{Math.round(detection.confidence * 100)}%</span></span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                <Clock className="h-3 w-3" />
                {detection.createdAt && !isNaN(new Date(detection.createdAt).getTime())
                  ? formatDistanceToNow(new Date(detection.createdAt), { addSuffix: true, locale: fr })
                  : "Date inconnue"}
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <CreditCard className="h-3 w-3" /> Montant
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatAmount(detection.amount, detection.currency)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5 space-y-1 group relative">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="text-sm font-medium text-white truncate pr-6" title={detection.customerEmail}>
                    {detection.customerEmail}
                  </div>
                  <button
                    onClick={() => copyToClipboard(detection.customerEmail, "email")}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
                  >
                    {copiedField === "email" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <MapPin className="h-3 w-3" /> Localisation
                  </div>
                  <div className="text-sm font-medium text-white">
                    {detection.customerCountry || "Inconnue"}
                    {detection.customerIp && <span className="text-zinc-500 ml-2 text-xs font-mono">({detection.customerIp})</span>}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5 space-y-1 group relative">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <Server className="h-3 w-3" /> Payment ID
                  </div>
                  <div className="text-xs font-mono text-zinc-400 truncate pr-6">
                    {detection.paymentIntentId}
                  </div>
                  <button
                    onClick={() => copyToClipboard(detection.paymentIntentId, "payment")}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
                  >
                    {copiedField === "payment" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* AI Suggestion */}
              {isLoadingSuggestion ? (
                <Skeleton className="h-24 w-full bg-zinc-900" />
              ) : suggestion ? (
                <AISuggestionCard
                  suggestion={suggestion}
                  detectionId={detection.id}
                  onAccept={() => {
                    // Refresh detection
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

              {/* AI Explanation */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Analyse IA</h3>
                <AIExplanation key={detectionId} detectionId={detectionId} />
              </div>

              {/* Detector Results */}
              {detection.detectorResults && detection.detectorResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Détail des détecteurs</h3>
                  <div className="space-y-2">
                    {detection.detectorResults.map((result) => (
                      <div
                        key={result.detectorId}
                        className="flex items-center justify-between p-3 rounded-md bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            result.decision === "BLOCK" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                              result.decision === "REVIEW" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          )} />
                          <span className="text-sm font-medium text-zinc-300">
                            {formatDetectorName(result.detectorId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600 font-mono">
                            Score: <span className={cn(
                              result.score > 70 ? "text-rose-400" : result.score > 30 ? "text-amber-400" : "text-emerald-400"
                            )}>{result.score}</span>
                          </span>
                          <Badge variant="outline" className={cn(
                            "text-[10px] h-5 px-1.5 font-mono uppercase tracking-wider border-0",
                            result.decision === "BLOCK" ? "text-rose-400 bg-rose-500/10" :
                              result.decision === "REVIEW" ? "text-amber-400 bg-amber-500/10" :
                                "text-emerald-400 bg-emerald-500/10"
                          )}>
                            {result.decision}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-2">
            <AlertTriangle className="h-8 w-8 opacity-50" />
            <p>Impossible de charger les détails</p>
          </div>
        )}

        {detection && (
          <SheetFooter className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur-sm grid grid-cols-2 gap-3">
            <BlockCustomerButton
              customerEmail={detection.customerEmail}
              variant="destructive"
              size="lg"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white border-0"
            />
            <WhitelistCustomerButton
              customerEmail={detection.customerEmail}
              variant="outline"
              size="lg"
              className="w-full border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white"
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
