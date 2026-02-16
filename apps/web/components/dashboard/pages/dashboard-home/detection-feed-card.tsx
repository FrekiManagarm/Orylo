"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Eye, Ban, ShieldCheck } from "lucide-react";
import { BlockCustomerButton } from "@/components/dashboard/components/block-customer-button";
import { WhitelistCustomerButton } from "@/components/dashboard/components/whitelist-customer-button";

/**
 * DetectionFeedCard - PRD Story 2.1, 2.7, 2.8, 2.9
 * Detection card in dashboard-home style (dark, zinc, indigo accents)
 */
export type DetectionFeedItem = {
  id: string;
  paymentIntentId: string;
  customerEmail: string | null;
  amount: number;
  currency: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK";
  score: number;
  createdAt: string;
};

export function DetectionFeedCard({
  detection,
  onClick,
  variant = "card",
}: {
  detection: DetectionFeedItem;
  onClick?: () => void;
  variant?: "card" | "list";
}) {
  const { customerEmail, amount, currency, decision, score, createdAt, paymentIntentId } = detection;
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [whitelistDialogOpen, setWhitelistDialogOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  const getBadgeClass = () => {
    switch (decision) {
      case "BLOCK":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "REVIEW":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "ALLOW":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const timeAgo =
    createdAt && !isNaN(new Date(createdAt).getTime())
      ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
      : "N/A";

  if (variant === "list") {
    return (
      <div
        className="w-full border-b border-white/5 p-4 hover:bg-white/5 transition-colors cursor-pointer group last:border-0"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        aria-label={`Detection item for transaction ${paymentIntentId}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white truncate">
                {customerEmail || "Unknown Customer"}
              </h3>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getBadgeClass()}`}>
                {decision}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 font-mono truncate">{paymentIntentId}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
             <span className="text-sm font-bold font-mono text-white">{formattedAmount}</span>
             <span className="text-[10px] text-zinc-500 font-mono">{timeAgo}</span>
          </div>
        </div>
        
        {/* Actions row for list view - simplified */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Risk Score:</span>
              <span className="text-xs font-bold text-white">{score}/100</span>
           </div>
           <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
              >
                Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={(e) => { e.stopPropagation(); setBlockDialogOpen(true); }}
              >
                Block
              </Button>
           </div>
        </div>

        <BlockCustomerButton
          customerEmail={customerEmail || paymentIntentId}
          open={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
          className="hidden" // Hidden trigger, controlled by state
        />
        <WhitelistCustomerButton
          customerEmail={customerEmail || paymentIntentId}
          open={whitelistDialogOpen}
          onOpenChange={setWhitelistDialogOpen}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <Card
      className="w-full border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
      aria-label={`Detection card for transaction ${paymentIntentId}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="font-semibold text-base text-white truncate">
              {customerEmail || "Unknown Customer"}
            </h3>
            <p className="text-sm text-zinc-500 font-mono truncate">{paymentIntentId}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={getBadgeClass()}>
              {decision}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Quick actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900/95 border border-white/10">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="text-zinc-300">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); setBlockDialogOpen(true); }}
                  className="text-rose-400 focus:text-rose-400"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Block Customer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); setWhitelistDialogOpen(true); }}
                  className="text-zinc-300"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Whitelist Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold font-mono text-white">{formattedAmount}</span>
            <span className="text-xs text-zinc-500 font-mono">{timeAgo}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-zinc-500 font-mono uppercase tracking-wider">Risk</span>
            <span className="text-xl font-semibold font-mono text-white">{score}/100</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t border-white/5">
        <BlockCustomerButton
          customerEmail={customerEmail || paymentIntentId}
          className="flex-1 md:flex-initial min-h-[44px] bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 font-mono text-xs uppercase tracking-wider"
          open={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
        />
        <WhitelistCustomerButton
          customerEmail={customerEmail || paymentIntentId}
          className="flex-1 md:flex-initial min-h-[44px] bg-zinc-900/50 border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white font-mono text-xs uppercase tracking-wider"
          open={whitelistDialogOpen}
          onOpenChange={setWhitelistDialogOpen}
        />
      </CardFooter>
    </Card>
  );
}
