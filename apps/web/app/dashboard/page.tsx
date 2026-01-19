"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StripeConnectButton } from "@/components/stripe-connect-button";

/**
 * Dashboard Page
 * 
 * Displays Stripe connection status and handles OAuth callback messages
 * - AC4: Success toast message "Stripe connected successfully"
 * - AC5: Error toast messages for various failure scenarios
 */
export default function DashboardPage() {
  const searchParams = useSearchParams();

  // Handle OAuth callback success/error messages
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      // AC4: Success message
      toast.success("Success!", {
        description: decodeURIComponent(success),
      });
      
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard");
    }

    if (error) {
      // AC5: Error messages
      toast.error("Connection Failed", {
        description: decodeURIComponent(error),
      });
      
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Connect Your Stripe Account</h2>
          <p className="text-muted-foreground">
            Connect your Stripe account to start monitoring fraud detections in real-time.
          </p>
          
          <div className="pt-4">
            <StripeConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
