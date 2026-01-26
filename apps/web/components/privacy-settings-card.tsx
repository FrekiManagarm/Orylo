"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield } from "lucide-react";

/**
 * PrivacySettingsCard Component
 * 
 * Story 4.4: AC7 - Privacy opt-in for feedback sharing
 * 
 * Design:
 * - Card layout with border (Shadcn Card component)
 * - Background: bg-muted/50, border: border-border, padding: p-4
 * - Shadcn Switch component for opt-in toggle
 * - Responsive: Mobile-friendly layout
 * - Accessibility: ARIA labels, keyboard navigation support
 */
type PrivacySettingsCardProps = {
  organizationId: string;
};

export function PrivacySettingsCard({
  organizationId,
}: PrivacySettingsCardProps) {
  const [shareFeedback, setShareFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPrivacySettings();
  }, [organizationId]);

  const fetchPrivacySettings = async () => {
    setIsLoading(true);
    try {
      // For now, we'll fetch from a future endpoint or use default
      // In production, would fetch from /api/organizations/[id]
      setShareFeedback(false); // Default
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/privacy-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shareFeedbackForModelImprovement: checked,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update privacy settings");
      }

      setShareFeedback(checked);
      toast.success("Paramètres de confidentialité mis à jour");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Erreur lors de la mise à jour", {
        description: error instanceof Error ? error.message : "Veuillez réessayer.",
      });
      // Revert toggle
      setShareFeedback(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-muted/50 dark:bg-muted/20 border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50 dark:bg-muted/20 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Confidentialité & Partage de Données
        </CardTitle>
        <CardDescription className="text-xs">
          Contrôlez le partage de vos données pour l'amélioration du modèle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <Label htmlFor="share-feedback" className="text-sm font-medium">
              Partager les retours pour l'amélioration du modèle
            </Label>
            <p className="text-xs text-muted-foreground">
              Aidez à améliorer les suggestions IA en partageant des retours anonymisés
              (conforme RGPD)
            </p>
          </div>
          <Switch
            id="share-feedback"
            checked={shareFeedback}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            aria-label="Partager les retours pour l'amélioration du modèle"
          />
        </div>
      </CardContent>
    </Card>
  );
}
