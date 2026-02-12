"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StripeConnectButton } from "@/components/dashboard/components/stripe-connect-button";
import { CheckCircle2, CreditCard } from "lucide-react";

type Props = {
  stripeConnected: boolean;
  stripeAccountId: string | null;
};

export function ConnectStripeClient({ stripeConnected, stripeAccountId }: Props) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success) {
      toast.success("Stripe connected successfully", {
        description: "Your account is now linked. New payments will be analyzed in real time.",
      });
      window.history.replaceState({}, "", "/dashboard/connections");
    }
    if (error) {
      toast.error("Connection failed", {
        description: decodeURIComponent(error),
      });
      window.history.replaceState({}, "", "/dashboard/connections");
    }
  }, [searchParams]);

  return (
    <Card className="border border-white/10 bg-zinc-900/50 backdrop-blur-xl max-w-xl">
      <CardHeader>
        <CardTitle className="text-white font-mono flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-400" />
          Connections
        </CardTitle>
        <CardDescription className="text-zinc-500">
          OAuth connection — read-only access to your payments. No API keys to manage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stripeConnected ? (
          <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Account connected</p>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">
                {stripeAccountId ? `acct_…${stripeAccountId.slice(-8)}` : "Stripe account linked"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              Connect your Stripe account to start receiving fraud analyses on every payment.
            </p>
            <StripeConnectButton />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
