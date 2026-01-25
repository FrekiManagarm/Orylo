"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Ban, ShieldCheck } from "lucide-react";

/**
 * QuickActionsMenu Component
 * 
 * Story 2.9:
 * - AC1: 3-dot icon trigger (MoreVertical)
 * - AC2: Popover/DropdownMenu with action list
 * - AC3: Actions - View Details, Block, Whitelist
 * - AC4: Align right, avoid overflow
 * - AC5: Close on click outside or action select
 * - AC6: Keyboard navigation (built into DropdownMenu)
 */

type QuickActionsMenuProps = {
  onViewDetails: () => void;
  onBlock: () => void;
  onWhitelist: () => void;
};

export function QuickActionsMenu({
  onViewDetails,
  onBlock,
  onWhitelist,
}: QuickActionsMenuProps) {
  return (
    <DropdownMenu>
      {/* AC1: 3-dot icon trigger */}
      <DropdownMenuTrigger
        render={(props) => (
          <Button
            {...props}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Open quick actions menu"
            onClick={(e) => {
              // Prevent card click event from bubbling
              e.stopPropagation();
              props.onClick?.(e);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      />

      {/* AC2, AC4: Dropdown content aligned right */}
      <DropdownMenuContent align="end" className="w-48">
        {/* AC3: View Details action */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* AC3: Block action */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onBlock();
          }}
          className="text-destructive focus:text-destructive"
        >
          <Ban className="mr-2 h-4 w-4" />
          Block Customer
        </DropdownMenuItem>

        {/* AC3: Whitelist action */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onWhitelist();
          }}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Whitelist Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
