"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2, X } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

/**
 * AISuggestionCard Component
 *
 * Story 4.1: AC4, AC5 - Display AI suggestion with accept/reject buttons
 *
 * Design (Orylo Design System - Dark / Cyber / Fintech):
 * - Fond glassmorphism, bordure white/10, accent gauche sémantique (vert/rouge)
 * - Whitelist: barre gauche green-500/60 + glow discret
 * - Blacklist: barre gauche red-500/60 + glow discret
 * - Labels: font-mono uppercase tracking-widest text-zinc-500
 * - Accessible: ARIA, clavier (Enter / Escape)
 */
export interface AISuggestion {
  id: string;
  type: "whitelist" | "blacklist";
  confidence: number; // 0-1
  reasoning: string;
  factors: string[];
  accepted?: boolean;
}

type AISuggestionCardProps = {
  suggestion: AISuggestion;
  detectionId: string;
  onAccept?: () => void;
  onReject?: () => void;
};

export function AISuggestionCard({
  suggestion,
  detectionId,
  onAccept,
  onReject,
}: AISuggestionCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(suggestion.accepted || false);

  // Sanitize reasoning text (XSS prevention, ADR-010)
  const sanitizedReasoning = DOMPurify.sanitize(suggestion.reasoning);

  // Confidence badge: couleur sémantique (design system)
  const confidenceClass =
    suggestion.confidence >= 0.8
      ? "border-green-500/50 text-green-400 bg-green-500/10"
      : suggestion.confidence >= 0.5
        ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
        : "border-red-500/50 text-red-400 bg-red-500/10";

  // Carte: glassmorphism + barre d’accent gauche (whitelist / blacklist)
  const cardBase =
    "border border-white/10 bg-zinc-900/50 backdrop-blur-md overflow-hidden";
  const accentBar =
    suggestion.type === "whitelist"
      ? "border-l-4 border-l-green-500/80 shadow-[inset_0_0_24px_-12px_rgba(34,197,94,0.25)]"
      : "border-l-4 border-l-red-500/80 shadow-[inset_0_0_24px_-12px_rgba(239,68,68,0.25)]";

  // Handle accept
  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await fetch(`/api/suggestions/${suggestion.id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept suggestion");
      }

      setIsAccepted(true);
      toast.success(
        `Customer ${suggestion.type === "whitelist" ? "whitelisted" : "blacklisted"} successfully`,
        {
          description: sanitizedReasoning,
        }
      );
      onAccept?.();
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      toast.error("Failed to accept suggestion", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const response = await fetch(`/api/suggestions/${suggestion.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject suggestion");
      }

      toast.success("Suggestion rejected");
      onReject?.();
    } catch (error) {
      console.error("Error rejecting suggestion:", error);
      toast.error("Failed to reject suggestion", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, action: "accept" | "reject") => {
    if (e.key === "Enter" && action === "accept") {
      handleAccept();
    } else if (e.key === "Escape" && action === "reject") {
      handleReject();
    }
  };

  if (isAccepted) {
    return (
      <Card className={cn(cardBase, accentBar)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            <span>
              Suggestion acceptée — Action appliquée
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(cardBase, accentBar)}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-mono font-medium text-white flex items-center gap-2">
            <Sparkles
              className={cn(
                "h-4 w-4 shrink-0",
                suggestion.type === "whitelist" ? "text-green-500" : "text-red-500"
              )}
            />
            Suggestion IA: {suggestion.type === "whitelist" ? "Whitelist" : "Blacklist"}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("font-mono text-[10px] uppercase tracking-widest", confidenceClass)}
          >
            {Math.round(suggestion.confidence * 100)}% confiance
          </Badge>
        </div>
        <CardDescription className="text-xs text-zinc-500">
          Basée sur l'analyse des patterns historiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Confiance
            </span>
            <span className="font-mono text-sm text-white">
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
          <Progress
            value={suggestion.confidence * 100}
            className="h-1.5 bg-white/5"
            indicatorClassName={
              suggestion.confidence >= 0.8
                ? "bg-green-500"
                : suggestion.confidence >= 0.5
                  ? "bg-amber-500"
                  : "bg-red-500"
            }
          />
        </div>

        {/* Reasoning */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Raison
          </p>
          <p
            className="text-sm text-zinc-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedReasoning }}
          />
        </div>

        {/* Factors */}
        {suggestion.factors.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Facteurs détectés
            </p>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              {suggestion.factors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5">
          <Button
            variant={suggestion.type === "whitelist" ? "default" : "destructive"}
            size="sm"
            onClick={handleAccept}
            onKeyDown={(e) => handleKeyDown(e, "accept")}
            disabled={isAccepting || isRejecting}
            className={cn(
              "flex-1 min-h-[44px] font-mono text-xs uppercase tracking-wider",
              suggestion.type === "whitelist" &&
              "bg-white text-black hover:bg-zinc-200"
            )}
            aria-label={`Accepter la suggestion ${suggestion.type}`}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Application...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Accepter
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            onKeyDown={(e) => handleKeyDown(e, "reject")}
            disabled={isAccepting || isRejecting}
            className="flex-1 min-h-[44px] font-mono text-xs uppercase tracking-wider border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label={`Rejeter la suggestion ${suggestion.type}`}
          >
            {isRejecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejet...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Rejeter
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
