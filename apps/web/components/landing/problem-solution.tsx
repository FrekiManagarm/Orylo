import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";

/**
 * Problem-Solution Section Component
 *
 * Story 2.14:
 * - AC4: Problem-Solution section highlighting Stripe Radar limitations vs Orylo
 */
export function ProblemSolutionSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Le problème avec Stripe Radar
          </h2>
          <p className="mx-auto max-w-175 text-lg text-muted-foreground">
            Stripe Radar laisse passer des fraudes. Résultat : votre compte est suspendu et vous devez mettre la clé sous la porte.
          </p>

          <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl mt-8">
            {/* Problem Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>Stripe Radar</CardTitle>
                </div>
                <CardDescription>
                  Détection limitée, trop de faux positifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>• 60-70% de détection card testing seulement</li>
                  <li>• 77% de faux positifs = temps perdu</li>
                  <li>• Règles statiques qui manquent les nouvelles fraudes</li>
                  <li>• Risque de suspension de compte Stripe</li>
                </ul>
              </CardContent>
            </Card>

            {/* Solution Card */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Orylo</CardTitle>
                </div>
                <CardDescription>
                  IA collective qui bloque les fraudes AVANT qu&apos;elles n&apos;impactent votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>• 95%+ de détection card testing</li>
                  <li>• &lt;10% de faux positifs</li>
                  <li>• IA qui apprend de 100+ marchands</li>
                  <li>• Protection proactive de votre compte</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
