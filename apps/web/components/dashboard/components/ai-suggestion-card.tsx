"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2, X } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

/**
 * AISuggestionCard Component
 * 
 * Story 4.1: AC4, AC5 - Display AI suggestion with accept/reject buttons
 * 
 * Design:
 * - Whitelist: border-green-500, bg-green-50/50 (light), bg-green-950/20 (dark)
 * - Blacklist: border-red-500, bg-red-50/50 (light), bg-red-950/20 (dark)
 * - Confidence badge: variant based on confidence (high ≥0.8: 'default', medium 0.5-0.8: 'secondary', low <0.5: 'outline')
 * - Responsive: Mobile-friendly (stack vertically on <768px)
 * - Accessibility: ARIA labels, keyboard navigation (Enter to accept, Escape to reject)
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

  // Confidence badge variant
  const confidenceVariant =
    suggestion.confidence >= 0.8
      ? "default"
      : suggestion.confidence >= 0.5
        ? "secondary"
        : "outline";

  // Card styling based on type
  const cardStyles =
    suggestion.type === "whitelist"
      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
      : "border-red-500 bg-red-50/50 dark:bg-red-950/20";

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
      <Card className={`${cardStyles} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>
              Suggestion {suggestion.type === "whitelist" ? "acceptée" : "acceptée"} - Action appliquée
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardStyles} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggestion IA: {suggestion.type === "whitelist" ? "Whitelist" : "Blacklist"}
          </CardTitle>
          <Badge variant={confidenceVariant}>
            {Math.round(suggestion.confidence * 100)}% confiance
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Basée sur l'analyse des patterns historiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confiance</span>
            <span className="font-medium">{Math.round(suggestion.confidence * 100)}%</span>
          </div>
          <Progress value={suggestion.confidence * 100}>
            <ProgressTrack className="h-2">
              <ProgressIndicator
                className={
                  suggestion.confidence >= 0.8
                    ? "bg-green-600"
                    : suggestion.confidence >= 0.5
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }
              />
            </ProgressTrack>
          </Progress>
        </div>

        {/* Reasoning */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Raison</p>
          <p
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedReasoning }}
          />
        </div>

        {/* Factors */}
        {suggestion.factors.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Facteurs détectés</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {suggestion.factors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant={suggestion.type === "whitelist" ? "default" : "destructive"}
            size="sm"
            onClick={handleAccept}
            onKeyDown={(e) => handleKeyDown(e, "accept")}
            disabled={isAccepting || isRejecting}
            className="flex-1 min-h-[44px]"
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
            className="flex-1 min-h-[44px]"
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
