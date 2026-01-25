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
 * BlockCustomerButton Component
 * 
 * Story 2.7:
 * - AC1: Block button with destructive variant
 * - AC2: Confirmation AlertDialog
 * - AC3: Calls API POST /api/customers/[id]/block
 * - AC4: Optimistic UI (immediate visual feedback)
 * - AC5: Success toast notification
 * - AC6: Error handling with UI rollback
 * - AC7: Badge update handled by parent component
 */

type BlockCustomerButtonProps = {
  customerEmail: string;
  onBlockSuccess?: () => void;
  onBlockError?: () => void;
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function BlockCustomerButton({
  customerEmail,
  onBlockSuccess,
  onBlockError,
  variant = "destructive",
  size = "sm",
  className,
}: BlockCustomerButtonProps) {
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // AC3, AC4, AC5, AC6: Block customer with optimistic UI
  const handleBlock = async () => {
    // AC4: Optimistic UI - update immediately
    setIsBlocking(true);
    setIsBlocked(true);

    try {
      // AC3: Call API
      const response = await fetch(`/api/customers/${encodeURIComponent(customerEmail)}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to block customer");
      }

      // AC5: Success toast
      toast.success("Customer blocked successfully", {
        description: `${customerEmail} will be auto-declined for future transactions.`,
      });

      // Notify parent component
      onBlockSuccess?.();
    } catch (error) {
      // AC6: Error handling - rollback UI
      setIsBlocked(false);

      console.error("Error blocking customer:", error);

      toast.error("Failed to block customer", {
        description: error instanceof Error ? error.message : "Please try again.",
      });

      // Notify parent component of error
      onBlockError?.();
    } finally {
      setIsBlocking(false);
      setDialogOpen(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* AC1: Block button */}
      <AlertDialogTrigger>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isBlocked || isBlocking}
        >
          {isBlocking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Blocking...
            </>
          ) : isBlocked ? (
            "Blocked"
          ) : (
            "Block"
          )}
        </Button>
      </AlertDialogTrigger>

      {/* AC2: Confirmation dialog */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block this customer?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Future transactions from <strong>{customerEmail}</strong> will be
              automatically declined.
            </p>
            <p className="text-sm text-muted-foreground">
              This action can be reversed later from the customer management page.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleBlock();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Block Customer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
