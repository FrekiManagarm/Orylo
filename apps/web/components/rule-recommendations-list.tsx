"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AIRuleRecommendationCard, type RuleRecommendation } from "@/components/ai-rule-recommendation-card";
import { toast } from "sonner";

/**
 * RuleRecommendationsList Component
 * 
 * Story 4.3: AC4 - Display list of AI rule recommendations
 */
type RuleRecommendationsListProps = {
  organizationId: string;
};

export function RuleRecommendationsList({
  organizationId,
}: RuleRecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<RuleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [organizationId]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/rule-recommendations`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations");
      }

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Erreur lors du chargement des recommandations", {
        description: error instanceof Error ? error.message : "Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune recommandation disponible</CardTitle>
          <CardDescription>
            Nous analysons vos transactions pour générer des recommandations personnalisées.
            Revenez plus tard pour voir les suggestions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <AIRuleRecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          onApply={() => {
            // Refresh list after applying
            fetchRecommendations();
          }}
        />
      ))}
    </div>
  );
}
