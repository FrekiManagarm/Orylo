"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  organization,
  signOut,
  useActiveOrganization,
} from "@/lib/auth/auth-client";
import { proMenuList, Menu, Submenu } from "@/lib/config/menu-list";
import {
  Building,
  AlertCircle,
  Check,
  Plus,
  ChevronsUpDown,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountSwitchDialog } from "../dialog/account-switch-dialog";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// import Stepper from "@/components/onboarding/components/stepper";
import { AuthSession } from "@/lib/auth/auth";
import { Organization, User as UserType } from "@orylo/database";
// Separator intégré au composant Sidebar via SidebarSeparator
import Link from "next/link";
import { useCustomer } from "autumn-js/react";
import { logger } from "@/lib/logger";
import { UserProfileDialog } from "../dialog/user-profile-dialog";

interface DashboardSidebarProps {
  session: AuthSession;
  organizations: Organization[];
}

export function DashboardSidebar({
  session,
  organizations,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: activeOrganization } = useActiveOrganization();
  const { state, isMobile } = useSidebar();
  const [switchingOrg, setSwitchingOrg] = useState<string | null>(null);
  const [showProfessionalDialog, setShowProfessionalDialog] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredenza, setShowCredenza] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { refetch } = useCustomer();

  // Récupérer les menus
  const menuGroups = proMenuList(pathname || "");

  const handleOrganizationSwitch = async (orgId: string) => {
    setSwitchingOrg(orgId);
    setActiveOrgId(orgId);
    setIsLoading(true);
    setShowProfessionalDialog(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const result = await organization.setActive({
        organizationId: orgId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await refetch();

      router.push(`/dashboard`);
      setIsLoading(false);
    } catch (error) {
      logger.error("Error changing organization:", error);
      toast.error("Erreur lors du changement de compte", {
        description: "Veuillez réessayer",
        icon: <AlertCircle className="h-5 w-5 text-white" />,
      });
      setShowProfessionalDialog(false);
    } finally {
      setSwitchingOrg(null);
    }
  };

  // Composant pour le menu replié avec dropdown
  const CollapsedSubMenu = ({ menu }: { menu: Menu }) => {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <SidebarMenuButton isActive={menu.active} tooltip={menu.label} className="rounded-lg">
              {menu.icon && <menu.icon className="h-4 w-4" />}
              <span>{menu.label}</span>
              <ChevronRight className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-48 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-mono uppercase tracking-widest text-zinc-500">{menu.label}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              {menu.submenus?.map((submenu: Submenu, index: number) => (
                <DropdownMenuItem
                  key={index}
                  className={cn(
                    "rounded-lg",
                    submenu.active && "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
                  )}
                >
                  <a
                    href={submenu.href}
                    className="flex items-center gap-2 w-full"
                  >
                    {submenu.icon && <submenu.icon className="h-4 w-4" />}
                    <span>{submenu.label}</span>
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  };

  // Composant pour le menu déployé avec sous-menus
  const ExpandedSubMenu = ({ menu }: { menu: Menu }) => {
    return (
      <Collapsible defaultOpen={menu.active}>
        <SidebarMenuItem>
          <CollapsibleTrigger>
            <SidebarMenuButton className="group" isActive={menu.active}>
              {menu.icon && <menu.icon className="h-4 w-4" />}
              <span>{menu.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {menu.submenus?.map((submenu: Submenu, index: number) => (
                <SidebarMenuSubItem key={index}>
                  <SidebarMenuSubButton isActive={submenu.active} asChild>
                    <Link
                      href={submenu.href}
                      className="flex items-center gap-2"
                    >
                      {submenu.icon && <submenu.icon className="h-4 w-4" />}
                      <span>{submenu.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="rounded-xl border border-white/10 hover:bg-white/5 hover:border-indigo-500/50">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                    {activeOrganization?.logo ? (
                      <Image
                        src={activeOrganization?.logo ?? ""}
                        alt={activeOrganization?.name ?? ""}
                        width={32}
                        height={32}
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <Building className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      {activeOrganization?.name}
                    </span>
                    <span className="truncate text-xs text-zinc-500 font-mono uppercase tracking-wider">
                      {activeOrganization?.name}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto text-zinc-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side={isMobile ? "bottom" : "right"}
                className="w-64 p-2 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 slide-in-from-top-5 duration-200"
              >
                {organizations && organizations.length > 0 && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-mono uppercase tracking-widest px-2 py-1.5 text-zinc-500">
                        Accounts
                      </DropdownMenuLabel>
                      <div className="max-h-[200px] overflow-y-auto my-1 rounded-md space-y-0.5 pr-1">
                        {organizations.map((org) => (
                          <DropdownMenuItem
                            key={org.id}
                            className={cn(
                              "group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer duration-200",
                              activeOrganization?.id === org.id
                                ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium"
                                : "hover:bg-white/5 hover:border-white/10 border border-transparent",
                              switchingOrg === org.id &&
                              "animate-pulse opacity-70",
                            )}
                            onSelect={() => handleOrganizationSwitch(org.id)}
                            disabled={switchingOrg !== null}
                          >
                            {org.logo ? (
                              <div
                                className={cn(
                                  "h-8 w-8 overflow-hidden rounded-lg border border-white/10 shrink-0 transition-all duration-300",
                                  activeOrganization?.id === org.id &&
                                  "ring-2 ring-indigo-500/30",
                                )}
                              >
                                <Image
                                  src={org.logo}
                                  alt={org.name}
                                  width={32}
                                  height={32}
                                  className={cn(
                                    "h-full w-full object-cover transition-transform duration-300",
                                    activeOrganization?.id !== org.id &&
                                    "group-hover:scale-105",
                                  )}
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 border border-white/10",
                                  activeOrganization?.id === org.id
                                    ? "bg-indigo-500/20 text-indigo-300"
                                    : "bg-zinc-800/50 text-zinc-400 group-hover:bg-white/5",
                                )}
                              >
                                <Building className="h-4 w-4" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium leading-none text-white">
                                {org.name}
                              </span>
                              <span className="text-xs text-zinc-500 mt-1 font-mono">
                                {org.trialEndsAt
                                  ? "Trial account"
                                  : "Paid account"}
                              </span>
                            </div>
                            {activeOrganization?.id === org.id && (
                              <Check className="h-4 w-4 ml-auto text-indigo-400 animate-in zoom-in-50 duration-300" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                      <DropdownMenuSeparator className="my-2 bg-white/5" />
                      <DropdownMenuLabel className="text-xs font-mono uppercase tracking-widest px-2 py-1.5 text-zinc-500">
                        New company
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setShowCredenza(true)}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer duration-200"
                      >
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-indigo-500/20">
                          <Plus className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none text-white">
                            Add a company
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Menus principaux sans groupe */}
        {menuGroups
          .filter((group) => !group.groupLabel)
          .map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <SidebarMenu>
                {group.menus.map((menu, menuIndex) => {
                  if (menu.submenus) {
                    return state === "collapsed" ? (
                      <CollapsedSubMenu key={menuIndex} menu={menu} />
                    ) : (
                      <ExpandedSubMenu key={menuIndex} menu={menu} />
                    );
                  }
                  return (
                    <SidebarMenuItem key={menuIndex}>
                      <SidebarMenuButton
                        isActive={menu.active}
                        tooltip={state === "collapsed" ? menu.label : undefined}
                      >
                        <a
                          href={menu.href}
                          className={cn(
                            "flex items-center gap-3",
                            menu.active && "font-medium",
                          )}
                        >
                          {menu.icon && <menu.icon className="h-4 w-4 cursor-pointer" />}
                          <span>{menu.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}

        {/* Groupes de menus */}
        {menuGroups
          .filter((group) => group.groupLabel)
          .map((group, groupIndex) => {
            return (
              <SidebarGroup key={groupIndex}>
                <SidebarGroupLabel className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
                  <span>{group.groupLabel}</span>
                </SidebarGroupLabel>

                <SidebarMenu>
                  {group.menus.map((menu, menuIndex) => {
                    if (menu.submenus) {
                      return state === "collapsed" ? (
                        <CollapsedSubMenu key={menuIndex} menu={menu} />
                      ) : (
                        <ExpandedSubMenu key={menuIndex} menu={menu} />
                      );
                    }
                    return (
                      <SidebarMenuItem key={menuIndex}>
                        <SidebarMenuButton
                          isActive={menu.active && !menu.comingSoon}
                          disabled={menu.comingSoon}
                          tooltip={
                            state === "collapsed" ? menu.label : undefined
                          }
                          asChild
                        >
                          <a
                            href={menu.href}
                            className={cn(
                              "flex items-center gap-3",
                              menu.active && "font-medium",
                            )}
                          >
                            {menu.icon && <menu.icon className="h-4 w-4" />}
                            <span>{menu.label}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-xl border border-white/10 hover:bg-white/5 hover:border-indigo-500/50 data-[state=open]:bg-white/5 data-[state=open]:border-indigo-500/50"
                >
                  <Avatar className="h-8 w-8 rounded-lg border border-white/10">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? ""}
                    />
                    <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-300">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-white">
                      {session.user.name}
                    </span>
                    <span className="truncate text-xs text-zinc-500 font-mono">
                      {session.user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-zinc-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg border border-white/10">
                        <AvatarImage
                          src={session.user.image ?? ""}
                          alt={session.user.name}
                        />
                        <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-300">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium text-white">
                          {session.user.name}
                        </span>
                        <span className="truncate text-xs text-zinc-500">
                          {session.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setShowProfile(true)}
                    className="rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
                  >
                    <User className="size-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    className="gap-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 focus:bg-rose-500/10 focus:text-rose-300"
                    onClick={async () => {
                      await signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/");
                          },
                        },
                      });
                    }}
                  >
                    <LogOut className="size-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <AccountSwitchDialog
        open={showProfessionalDialog}
        onOpenChange={setShowProfessionalDialog}
        type="professional"
        organizationName={
          organizations?.find((org) => org.id === activeOrgId)?.name
        }
        isLoading={isLoading}
      />

      {/* <Credenza open={showCredenza} onOpenChange={setShowCredenza}>
        <Stepper />
      </Credenza> */}

      <UserProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        user={session.user as UserType}
      />
    </Sidebar>
  );
}