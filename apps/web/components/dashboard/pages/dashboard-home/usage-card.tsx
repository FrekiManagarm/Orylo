import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { checkTransactionsLimit } from "@/lib/autumn";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function UsageCard() {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  const usageData = org?.id
    ? await checkTransactionsLimit(org.id)
    : { allowed: true, used: 0, limit: 0 };

  const limit = usageData.limit ?? 0;
  const balance = usageData.used ?? 0; // balance = transactions restantes
  const used = limit - balance; // Calculer les transactions utilisées
  const allowed = usageData.allowed ?? true;
  const usagePercentage = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isNearLimit = usagePercentage >= 80;
  const isOverLimit = usagePercentage >= 100;

  // Calculer les jours restants jusqu'à la fin du mois
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilReset = Math.ceil(
    (lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-white/5 backdrop-blur-xl relative overflow-hidden bg-linear-to-br from-indigo-500/10 via-zinc-900/50 to-zinc-900/50">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity className="w-24 h-24 text-indigo-500" />
      </div>

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Utilisation</CardTitle>
          <Badge
            variant="secondary"
            className={`${isOverLimit
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : isNearLimit
                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              } border`}
          >
            {isOverLimit ? "Limite atteinte" : "Pro Plan"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">
              {usagePercentage}%
            </span>
            <span className="text-sm text-zinc-400 mb-1">
              {used.toLocaleString()} / {limit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={Math.min(usagePercentage, 100)}
            className={`h-2 bg-zinc-800 ${isOverLimit
              ? "[&>div]:bg-rose-500"
              : isNearLimit
                ? "[&>div]:bg-orange-500"
                : "[&>div]:bg-indigo-500"
              }`}
          />
        </div>

        <div className="text-sm text-zinc-400">
          <p>
            Réinitialisation dans{" "}
            <span className="text-white font-medium">
              {daysUntilReset} jour{daysUntilReset > 1 ? "s" : ""}
            </span>
          </p>
          {isOverLimit ? (
            <p className="mt-1 text-xs text-rose-400">
              ⚠️ Vous avez atteint votre limite. Passez à un plan supérieur pour
              continuer.
            </p>
          ) : isNearLimit ? (
            <p className="mt-1 text-xs text-orange-400">
              Vous approchez de votre limite. Envisagez une mise à niveau pour
              un service ininterrompu.
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">
              {limit - used} transaction{limit - used > 1 ? "s" : ""} restante
              {limit - used > 1 ? "s" : ""} ce mois-ci.
            </p>
          )}
        </div>

        {isNearLimit && (
          <Button className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium">
            Mettre à niveau
          </Button>
        )}

        {!allowed && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <p className="text-xs text-rose-400 font-medium">
              🚫 Les nouvelles transactions sont actuellement bloquées car vous
              avez dépassé votre limite.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
