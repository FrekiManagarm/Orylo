"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { User, Settings, LogOut } from "lucide-react";

/**
 * User Menu Component
 * 
 * Profile dropdown menu in the header
 * - Shows user avatar with initials
 * - Menu items: Profile, Settings, Logout
 */
export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const userName = user.name || user.email || "User";
  const userEmail = user.email || "";

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(userName);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <button
            {...props}
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Open user menu"
          >
            <Avatar size="default">
              {user.image && <AvatarImage src={user.image} alt={userName} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        )}
      />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={(props) => (
            <button
              {...props}
              className="w-full"
              onClick={() => {
                // TODO: Navigate to profile page when created
                router.push("/dashboard");
              }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </button>
          )}
        />
        <DropdownMenuItem
          render={(props) => (
            <button
              {...props}
              className="w-full"
              onClick={() => {
                router.push("/settings/stripe");
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </button>
          )}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          render={(props) => (
            <button
              {...props}
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          )}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
