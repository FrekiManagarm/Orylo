"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
      <DropdownMenuTrigger render={<Button
        variant="outline"
        className="bg-zinc-900/50 border-white/10 hover:bg-white/5 hover:border-indigo-500/30"
      >
        <Zap className="h-4 w-4 mr-2" />
        Quick Actions
      </Button>}
      />
      <DropdownMenuContent
        align="end"
        className="w-56 bg-zinc-900 border-white/10"
      >
        <DropdownMenuLabel className="text-zinc-400">Actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem render={<Link href="/dashboard/card-testing" className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-rose-400" />
          <span>View Card Testing</span>
        </Link>}
        />

        <DropdownMenuItem render={<Link href="/dashboard/alerts" className="flex items-center">
          <ShieldAlert className="h-4 w-4 mr-2 text-amber-400" />
          <span>View Threats</span>
        </Link>}
        />

        <DropdownMenuItem render={<Link href="/dashboard/rules" className="flex items-center">
          <Plus className="h-4 w-4 mr-2 text-indigo-400" />
          <span>Create New Rule</span>
        </Link>}
        />

        <DropdownMenuSeparator className="bg-white/10" />

        <div className="p-1">
          <SimulatePaymentButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

