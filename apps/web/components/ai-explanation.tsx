"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useSSE } from "@/hooks/use-sse";

/**
 * AIExplanation Component
 * 
 * Story 4.2: AC4, AC5 - Display AI-generated explanation for fraud detection
 * 
 * Design:
 * - Card layout with border (Shadcn Card component)
 * - Background: bg-muted/50 (light mode), bg-muted/20 (dark mode)
 * - Border: border-border
 * - Padding: p-4
 * - Typography: Explanation text uses text-sm with leading-relaxed
 * - Loading state: Skeleton component matching explanation text height
 * - Sanitization: DOMPurify for XSS prevention (ADR-010)
 * - SSE Integration: Uses useSSE hook to listen for explanation.updated events (ADR-008)
 * - Responsive: Mobile-friendly layout (stack vertically on <768px)
 * - Accessibility: ARIA labels, keyboard navigation support
 */
type AIExplanationProps = {
  detectionId: string;
};

export function AIExplanation({ detectionId }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "generated">("pending");
  const [model, setModel] = useState<string | null>(null);

  // Fetch explanation on mount
  useEffect(() => {
    fetchExplanation();
  }, [detectionId]);

  // AC6: SSE Integration - Listen for explanation.updated events
  useSSE({
    onDetectionUpdated: (detection) => {
      // If this detection was updated, refetch explanation
      if (detection.id === detectionId) {
        fetchExplanation();
      }
    },
  });

  const fetchExplanation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/detections/${detectionId}/explanation`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch explanation");
      }

      if (data.status === "generated" && data.explanation) {
        setExplanation(data.explanation);
        setStatus("generated");
        setModel(data.model);
      } else if (data.status === "pending") {
        setStatus("pending");
        // Show fallback template if available
        if (data.fallback) {
          setExplanation(data.fallback);
        }
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setStatus("pending");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll every 2s if pending (fallback if SSE not available)
  useEffect(() => {
    if (status === "pending" && !isLoading) {
      const interval = setInterval(() => {
        fetchExplanation();
      }, 2000); // AC6: Poll every 2s

      return () => clearInterval(interval);
    }
  }, [status, isLoading, detectionId]);

  // Sanitize explanation text (XSS prevention, ADR-010)
  const sanitizedExplanation = explanation
    ? DOMPurify.sanitize(explanation)
    : null;

  return (
    <Card className="bg-muted/50 dark:bg-muted/20 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Explication IA
          </CardTitle>
          {status === "pending" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Génération en cours...
            </Badge>
          )}
          {status === "generated" && model && (
            <Badge variant="secondary">FR</Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Explication automatique de la décision de fraude
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && status === "pending" ? (
          // AC4: Loading skeleton while generating
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : sanitizedExplanation ? (
          // AC5: Display explanation in French
          <div
            className="text-sm leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizedExplanation }}
            aria-label="Explication de la détection de fraude"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune explication disponible pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
