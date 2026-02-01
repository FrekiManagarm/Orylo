"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Building2,
  LoaderCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { Organization } from "@orylo/database";
import {
  signOut,
  organization,
} from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

interface SelectOrganizationCardProps {
  organizations: Organization[];
  currentOrganizationId?: string | null;
}

export function SelectOrganizationCard({
  organizations,
  currentOrganizationId,
}: SelectOrganizationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handleSelectOrganization = (organizationId: string) => {
    setSelectedOrgId(organizationId);
    startTransition(async () => {
      try {
        await organization.setActive({
          organizationId,
        });

        toast.success("Organization selected", {
          description: "Redirecting to dashboard...",
        });

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to select this organization.";
        toast.error("Error", { description: message });
        setSelectedOrgId(null);
      }
    });
  };

  const { mutateAsync: handleSignOut, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      toast.success("Signed out successfully", {
        description: "Redirecting to sign in...",
      });
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error("Sign out failed", { description: error.message });
    },
  });

  return (
    <Card className="w-full border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 p-2 border border-indigo-500/30 text-indigo-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Your organizations
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Click on an organization to select it
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5"
            onClick={async () => await handleSignOut()}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <div className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Signing out…</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </div>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {organizations.map((org) => {
            const isActive = org.id === currentOrganizationId;
            const isSelecting = isPending && selectedOrgId === org.id;

            return (
              <button
                key={org.id}
                onClick={() => handleSelectOrganization(org.id)}
                disabled={isPending}
                className={cn(
                  "group relative w-full rounded-xl border p-4 text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed",
                  isActive
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-white/10 bg-zinc-900/30",
                )}
              >
                <div className="flex items-center gap-4">
                  {org.logo ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10">
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/50">
                      <Building2 className="h-6 w-6 text-zinc-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {org.name}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-zinc-400">@{org.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelecting ? (
                      <LoaderCircle className="h-5 w-5 animate-spin text-indigo-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full border-white/10 bg-zinc-900/30 text-white hover:bg-white/5 hover:text-white"
            onClick={() => router.push("/create-organization")}
            disabled={isPending}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Create a new organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}