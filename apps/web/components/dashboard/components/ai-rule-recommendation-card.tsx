"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2, Eye } from "lucide-react";
import type { SimpleCondition } from "@/lib/fraud/custom-rules";

/**
 * AIRuleRecommendationCard Component
 * 
 * Story 4.3: AC4, AC5 - Display AI rule recommendation with apply/preview buttons
 * 
 * Design:
 * - Card layout with border (Shadcn Card component)
 * - Background: bg-muted/50 (light mode), bg-muted/20 (dark mode)
 * - Border: border-border
 * - Padding: p-4
 * - Typography: Rule name uses font-semibold, condition uses text-sm text-muted-foreground
 * - Confidence badge: variant based on confidence (high ≥0.8: 'default', medium 0.5-0.8: 'secondary', low <0.5: 'outline')
 * - Responsive: Mobile-friendly layout (stack vertically on <768px)
 * - Accessibility: ARIA labels, keyboard navigation support
 */
export interface RuleRecommendation {
  id: string;
  type: "amount_threshold" | "velocity_limit" | "geo_restriction";
  name: string;
  condition: SimpleCondition;
  action: "BLOCK" | "REVIEW" | "ALLOW";
  scoreModifier: number;
  confidence: number; // 0-1
  reasoning: string;
  applied?: boolean;
  effectiveness?: number | null;
}

type AIRuleRecommendationCardProps = {
  recommendation: RuleRecommendation;
  onApply?: () => void;
};

export function AIRuleRecommendationCard({
  recommendation,
  onApply,
}: AIRuleRecommendationCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewImpact, setPreviewImpact] = useState<{
    blocks: number;
    falsePositives: number;
    truePositives: number;
    blockRate: number;
  } | null>(null);
  const [isApplied, setIsApplied] = useState(recommendation.applied || false);

  // Confidence badge variant
  const confidenceVariant =
    recommendation.confidence >= 0.8
      ? "default"
      : recommendation.confidence >= 0.5
        ? "secondary"
        : "outline";

  // Format condition for display
  const formatCondition = (condition: SimpleCondition): string => {
    const fieldNames: Record<string, string> = {
      amount: "Montant",
      velocity: "Vélocité",
      ip_country: "Pays IP",
      card_country: "Pays carte",
    };

    const fieldName = fieldNames[condition.field] || condition.field;
    const operatorSymbols: Record<string, string> = {
      ">": ">",
      "<": "<",
      "=": "=",
      "!=": "≠",
      IN: "dans",
    };

    const operator = operatorSymbols[condition.operator] || condition.operator;
    const value =
      typeof condition.value === "object"
        ? condition.value.join(", ")
        : condition.value;

    return `${fieldName} ${operator} ${value}`;
  };

  // Handle preview
  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const response = await fetch(
        `/api/rule-recommendations/${recommendation.id}/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to preview impact");
      }

      setPreviewImpact(data.impact);
      toast.success("Aperçu généré", {
        description: data.message,
      });
    } catch (error) {
      console.error("Error previewing impact:", error);
      toast.error("Erreur lors de l'aperçu", {
        description: error instanceof Error ? error.message : "Veuillez réessayer.",
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  // Handle apply
  const handleApply = async () => {
    setIsApplying(true);
    try {
      const response = await fetch(
        `/api/rule-recommendations/${recommendation.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply rule");
      }

      setIsApplied(true);
      toast.success("Règle appliquée", {
        description: "La règle a été créée avec succès.",
      });
      onApply?.();
    } catch (error) {
      console.error("Error applying rule:", error);
      toast.error("Erreur lors de l'application", {
        description: error instanceof Error ? error.message : "Veuillez réessayer.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isApplied) {
    return (
      <Card className="bg-muted/50 dark:bg-muted/20 border-border border-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Règle appliquée - Active</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50 dark:bg-muted/20 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">{recommendation.name}</span>
          </CardTitle>
          <Badge variant={confidenceVariant}>
            {Math.round(recommendation.confidence * 100)}% confiance
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {formatCondition(recommendation.condition)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confiance</span>
            <span className="font-medium">
              {Math.round(recommendation.confidence * 100)}%
            </span>
          </div>
          <Progress
            value={recommendation.confidence * 100}
            indicatorClassName={
              recommendation.confidence >= 0.8
                ? "bg-green-600"
                : recommendation.confidence >= 0.5
                  ? "bg-yellow-600"
                  : "bg-red-600"
            }
          />
        </div>

        {/* Reasoning */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Raison</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Preview Impact */}
        {previewImpact && (
          <div className="rounded-lg border p-3 space-y-2 bg-background/50">
            <p className="text-sm font-medium">Impact estimé (30 derniers jours)</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Blocages</span>
                <p className="font-semibold">{previewImpact.blocks}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Vrais positifs</span>
                <p className="font-semibold text-green-600">
                  {previewImpact.truePositives}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Faux positifs</span>
                <p className="font-semibold text-red-600">
                  {previewImpact.falsePositives}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de blocage: {previewImpact.blockRate.toFixed(1)}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={isPreviewing || isApplying}
            className="flex-1 min-h-[44px]"
            aria-label="Aperçu de l'impact de la règle"
          >
            {isPreviewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calcul...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Aperçu Impact
              </>
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleApply}
            disabled={isPreviewing || isApplying}
            className="flex-1 min-h-[44px]"
            aria-label="Appliquer la règle"
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Application...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Appliquer la Règle
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
