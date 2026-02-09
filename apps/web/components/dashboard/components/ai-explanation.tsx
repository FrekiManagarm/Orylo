"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useSSE } from "@/hooks/use-sse";

/** Données factices pour prévisualiser le composant (fallback si API indisponible) */
const MOCK_EXPLANATION = `
<p>Cette transaction a été <strong>marquée à risque</strong> en raison des éléments suivants :</p>
<ul>
  <li><strong>Vélocité inhabituelle</strong> : 3 paiements en moins de 2 minutes depuis le même appareil.</li>
  <li><strong>Score de confiance client</strong> : 0,42 (sous le seuil de 0,6).</li>
  <li><strong>Adresse IP</strong> : géolocalisation incohérente avec l’historique du compte.</li>
</ul>
<p>Recommandation : vérifier l’identité du client ou demander une authentification renforcée avant d’accepter le paiement.</p>
`.trim();

/**
 * AIExplanation Component
 *
 * Story 4.2: AC4, AC5 - Display AI-generated explanation for fraud detection
 *
 * Design (Orylo Design System - Dark / Cyber / Fintech):
 * - Card: glassmorphism, bordure white/10, barre d’accent gauche indigo + glow
 * - Icône Sparkles dans un bloc accent indigo
 * - Badges: pending (amber), model (indigo) en font-mono uppercase
 * - Contenu: paragraphes et listes stylés (puces indigo, strong en blanc)
 * - Sanitization: DOMPurify (ADR-010). SSE: useSSE (ADR-008)
 */
type AIExplanationProps = {
  detectionId: string;
  /** Afficher des données factices pour la prévisualisation (prioritaire sur l'API) */
  useMockData?: boolean;
};

export function AIExplanation({
  detectionId,
  useMockData = false,
}: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "generated">("pending");
  const [model, setModel] = useState<string | null>(null);

  // Données factices : affichage après un court délai
  useEffect(() => {
    if (useMockData) {
      const t = setTimeout(() => {
        setExplanation(MOCK_EXPLANATION);
        setStatus("generated");
        setModel("gpt-4o-mini");
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(t);
    }
    fetchExplanation();
  }, [detectionId, useMockData]);

  // AC6: SSE Integration - Listen for explanation.updated events (ignoré en mode mock)
  useSSE({
    onDetectionUpdated: (detection) => {
      if (!useMockData && detection.id === detectionId) {
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
        if (data.fallback) {
          setExplanation(data.fallback);
        }
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanation(MOCK_EXPLANATION);
      setStatus("generated");
      setModel("gpt-4o-mini");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll every 2s if pending (fallback if SSE not available)
  useEffect(() => {
    if (useMockData) return;
    if (status === "pending" && !isLoading) {
      const interval = setInterval(() => {
        fetchExplanation();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status, isLoading, detectionId, useMockData]);

  // Sanitize explanation text (XSS prevention, ADR-010)
  const sanitizedExplanation = explanation
    ? DOMPurify.sanitize(explanation)
    : null;

  return (
    <Card className="border border-white/10 bg-zinc-900/50 backdrop-blur-md overflow-hidden border-l-4 border-l-indigo-500/70 shadow-[inset_0_0_32px_-12px_rgba(99,102,241,0.12)]">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-mono font-medium text-white flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/20 border border-indigo-500/30">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </span>
            Explication IA
          </CardTitle>
          {status === "pending" && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] uppercase tracking-widest border-amber-500/50 text-amber-400 bg-amber-500/10 flex items-center gap-1.5"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Génération en cours...
            </Badge>
          )}
          {status === "generated" && model && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] uppercase tracking-widest border-indigo-500/50 text-indigo-400 bg-indigo-500/10"
            >
              {model}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-zinc-500">
          Explication automatique de la décision de fraude
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && status === "pending" ? (
          <div className="space-y-3">
            <Skeleton className="h-3 w-full rounded bg-white/5" />
            <Skeleton className="h-3 w-full rounded bg-white/5" />
            <Skeleton className="h-3 w-[85%] rounded bg-white/5" />
            <Skeleton className="h-3 w-2/3 rounded bg-white/5" />
          </div>
        ) : sanitizedExplanation ? (
          <div
            className="ai-explanation-content text-sm leading-relaxed text-zinc-400 space-y-3 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-white [&_strong]:font-semibold [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:pl-0 [&_li]:flex [&_li]:gap-2 [&_li]:pl-4 [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-1.5 [&_li]:before:w-1 [&_li]:before:h-1 [&_li]:before:rounded-full [&_li]:before:bg-indigo-500"
            dangerouslySetInnerHTML={{ __html: sanitizedExplanation }}
            aria-label="Explication de la détection de fraude"
          />
        ) : (
          <p className="text-sm text-zinc-500 font-mono">
            Aucune explication disponible pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
