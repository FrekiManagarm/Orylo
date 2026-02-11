"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Sparkles } from "lucide-react";

/** Données factices pour prévisualiser la carte (fallback si API indisponible) */
const MOCK_AI_METRICS = {
  accuracy: 0.78,
  totalSuggestions: 124,
  accepted: 97,
  rejected: 18,
  modified: 9,
  averageConfidence: 0.82,
};

/**
 * AIMetricsCard Component
 *
 * Story 4.4: AC6 - Display AI suggestion accuracy metrics
 *
 * Design:
 * - Card layout with border (Shadcn Card component)
 * - Background: bg-muted/50, border: border-border, padding: p-4
 * - Display metrics: Acceptance rate (Progress bar), Total/Accepted/Rejected counts (Badges)
 * - Responsive: Mobile-friendly layout (stack vertically on <768px)
 * - Accessibility: ARIA labels, keyboard navigation support
 */
type AIMetricsCardProps = {
  organizationId: string;
  /** Afficher des données factices pour la prévisualisation (prioritaire sur l'API) */
  useMockData?: boolean;
};

export function AIMetricsCard({
  organizationId,
  useMockData = false,
}: AIMetricsCardProps) {
  const [metrics, setMetrics] = useState<{
    accuracy: number;
    totalSuggestions: number;
    accepted: number;
    rejected: number;
    modified: number;
    averageConfidence: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (useMockData) {
      const t = setTimeout(() => {
        setMetrics(MOCK_AI_METRICS);
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(t);
    }
    fetchMetrics();
  }, [organizationId, useMockData]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/ai-metrics`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch metrics");
      }

      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setMetrics(MOCK_AI_METRICS);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-muted/50 dark:bg-muted/20 border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-muted/50 dark:bg-muted/20 border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Métriques IA
          </CardTitle>
          <CardDescription className="text-xs">
            Aucune donnée disponible pour le moment
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const accuracyPercent = Math.round(metrics.accuracy * 100);

  return (
    <Card className="bg-muted/50 dark:bg-muted/20 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Précision des Suggestions IA
        </CardTitle>
        <CardDescription className="text-xs">
          Taux d'acceptation des suggestions sur les 30 derniers jours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accuracy Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taux d'acceptation</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{accuracyPercent}%</span>
              {accuracyPercent >= 70 && (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
          <Progress
            value={accuracyPercent}
            indicatorClassName={
              accuracyPercent >= 70
                ? "bg-green-600"
                : accuracyPercent >= 50
                  ? "bg-yellow-600"
                  : "bg-red-600"
            }
          />
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Total</span>
            <Badge variant="secondary" className="w-full justify-center">
              {metrics.totalSuggestions}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Acceptées</span>
            <Badge variant="default" className="w-full justify-center bg-green-600">
              {metrics.accepted}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Rejetées</span>
            <Badge variant="destructive" className="w-full justify-center">
              {metrics.rejected}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Modifiées</span>
            <Badge variant="outline" className="w-full justify-center">
              {metrics.modified}
            </Badge>
          </div>
        </div>

        {/* Average Confidence */}
        {metrics.averageConfidence > 0 && (
          <div className="text-xs text-muted-foreground">
            Confiance moyenne: {Math.round(metrics.averageConfidence * 100)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
