"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StripeConnectButton } from "@/components/dashboard/components/stripe-connect-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { disconnectConnection } from "@/lib/actions/stripe-connect";
import {
  paymentProcessorConfigs,
  type PaymentProcessorId,
} from "@/lib/config/payment-processors";

type Connection = {
  id: string;
  accountId: string;
  paymentProcessor: string;
  isActive: boolean;
  livemode: boolean;
  connectedAt: Date | null;
};

type Props = {
  connectionsByProcessor: Record<PaymentProcessorId, Connection[]>;
};

export function ConnectionsClient({ connectionsByProcessor }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (connectionId: string) => {
    setDeletingId(connectionId);
    try {
      await disconnectConnection(connectionId);
      toast.success("Connexion supprimée", {
        description: "Le compte a été déconnecté.",
      });
      setConfirmDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error("Échec de la suppression", {
        description: error instanceof Error ? error.message : "Une erreur s'est produite.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success) {
      toast.success("Connexion réussie", {
        description: "Votre compte est maintenant lié. Les paiements seront analysés en temps réel.",
      });
      window.history.replaceState({}, "", "/dashboard/connections");
    }
    if (error) {
      toast.error("Échec de la connexion", {
        description: decodeURIComponent(error),
      });
      window.history.replaceState({}, "", "/dashboard/connections");
    }
  }, [searchParams]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.values(paymentProcessorConfigs).map((config) => {
        const connections = connectionsByProcessor[config.id] ?? [];
        const hasActiveConnection = connections.some((c) => c.isActive);
        const isComingSoon = config.status === "coming_soon";
        const Icon = config.icon;

        return (
          <Card
            key={config.id}
            className={`border border-white/10 bg-zinc-900/50 backdrop-blur-xl transition-colors ${
              isComingSoon ? "opacity-75" : "hover:border-indigo-500/30"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white font-mono text-base">
                      {config.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-500 text-xs">
                      {config.description}
                    </CardDescription>
                  </div>
                </div>
                {isComingSoon && (
                  <Badge
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-400 border-white/10 text-[10px] uppercase tracking-widest"
                  >
                    Bientôt
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {connections.length > 0 ? (
                <div className="space-y-2">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/40 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            conn.isActive ? "bg-emerald-500/20" : "bg-zinc-500/20"
                          }`}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              conn.isActive ? "text-emerald-500" : "text-zinc-500"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {conn.isActive ? "Compte connecté" : "Déconnecté"}
                          </p>
                          <p className="text-xs font-mono text-zinc-500 truncate">
                            …{conn.accountId.slice(-8)}
                            {conn.livemode && (
                              <span className="ml-2 text-amber-500">Live</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {!isComingSoon && (
                        <AlertDialog
                          open={confirmDeleteId === conn.id}
                          onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setConfirmDeleteId(conn.id)}
                            disabled={deletingId !== null}
                            aria-label="Supprimer la connexion"
                          >
                            {deletingId === conn.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Supprimer cette connexion ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Le compte {config.name} …{conn.accountId.slice(-8)}{" "}
                                sera déconnecté. Vous pourrez le reconnecter à tout moment.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(conn.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {config.id === "stripe" && (
                <div className="pt-2">
                  <p className="text-xs text-zinc-500 mb-2">
                    {hasActiveConnection
                      ? "Connectez un autre compte si besoin."
                      : "Connectez votre compte pour activer la détection de fraude."}
                  </p>
                  <StripeConnectButton />
                </div>
              )}

              {isComingSoon && connections.length === 0 && (
                <p className="text-xs text-zinc-500 italic">
                  Cette intégration sera disponible prochainement.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
