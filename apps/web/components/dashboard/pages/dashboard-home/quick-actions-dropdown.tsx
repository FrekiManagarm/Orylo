"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, CreditCard, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { SimulatePaymentButton } from "./simulate-payment-button";

export function QuickActionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-900/50 border border-white/10 text-zinc-300 hover:bg-white/5 hover:border-indigo-500/50 hover:text-white font-mono text-xs uppercase tracking-wider"
        >
          <Zap className="h-4 w-4 mr-2 text-indigo-400" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />

          <DropdownMenuItem asChild>
            <Link href="/dashboard/card-testing" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-rose-400" />
              <span>View Card Testing</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/dashboard/alerts" className="flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2 text-amber-400" />
              <span>View Threats</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/dashboard/rules" className="flex items-center">
              <Plus className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Create New Rule</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/5" />

          <div className="p-1">
            <SimulatePaymentButton />
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

