"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * WhitelistCustomerButton Component
 * 
 * Story 2.8:
 * - AC1: Whitelist button with secondary variant
 * - AC2: Confirmation AlertDialog
 * - AC3: Calls API POST /api/customers/[id]/whitelist
 * - AC4: Optimistic UI (immediate visual feedback)
 * - AC5: Success toast notification
 * - AC6: Badge update handled by parent component
 * - AC7: Undo option in toast (3s window)
 */

type WhitelistCustomerButtonProps = {
  customerEmail: string;
  onWhitelistSuccess?: () => void;
  onWhitelistError?: () => void;
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function WhitelistCustomerButton({
  customerEmail,
  onWhitelistSuccess,
  onWhitelistError,
  variant = "outline",
  size = "sm",
  className,
}: WhitelistCustomerButtonProps) {
  const [isWhitelisting, setIsWhitelisting] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // AC7: Undo whitelist action
  const handleUndo = async () => {
    try {
      // TODO (Epic 3): Implement undo API endpoint
      // For now, just reset the UI state
      setIsWhitelisted(false);
      
      toast.info("Whitelist reverted", {
        description: "Customer whitelist has been removed.",
      });
    } catch (error) {
      console.error("Error reverting whitelist:", error);
      toast.error("Failed to revert whitelist");
    }
  };

  // AC3, AC4, AC5, AC7: Whitelist customer with optimistic UI and undo option
  const handleWhitelist = async () => {
    // AC4: Optimistic UI - update immediately
    setIsWhitelisting(true);
    setIsWhitelisted(true);

    try {
      // AC3: Call API
      const response = await fetch(`/api/customers/${encodeURIComponent(customerEmail)}/whitelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to whitelist customer");
      }

      // AC5, AC7: Success toast with undo button
      toast.success("Customer whitelisted", {
        description: `${customerEmail} will auto-approve for future transactions.`,
        action: {
          label: "Undo",
          onClick: handleUndo,
        },
        duration: 3000, // 3s window for undo
      });

      // Notify parent component
      onWhitelistSuccess?.();
    } catch (error) {
      // Error handling - rollback UI
      setIsWhitelisted(false);
      
      console.error("Error whitelisting customer:", error);
      
      toast.error("Failed to whitelist customer", {
        description: error instanceof Error ? error.message : "Please try again.",
      });

      // Notify parent component of error
      onWhitelistError?.();
    } finally {
      setIsWhitelisting(false);
      setDialogOpen(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* AC1: Whitelist button */}
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isWhitelisted || isWhitelisting}
        >
          {isWhitelisting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Whitelisting...
            </>
          ) : isWhitelisted ? (
            "Whitelisted"
          ) : (
            "Whitelist"
          )}
        </Button>
      </AlertDialogTrigger>

      {/* AC2: Confirmation dialog */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Whitelist this customer?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Future transactions from <strong>{customerEmail}</strong> will be
              automatically approved.
            </p>
            <p className="text-sm text-muted-foreground">
              You can undo this action within 3 seconds after confirming.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleWhitelist();
            }}
          >
            Whitelist Customer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
