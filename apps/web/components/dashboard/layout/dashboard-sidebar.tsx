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
            <SidebarMenuButton isActive={menu.active} tooltip={menu.label}>
              {menu.icon && <menu.icon className="h-4 w-4" />}
              <span>{menu.label}</span>
              <ChevronRight className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-48">
            <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menu.submenus?.map((submenu: Submenu, index: number) => (
              <DropdownMenuItem key={index}>
                <a
                  href={submenu.href}
                  className={cn(
                    "flex items-center gap-2",
                    submenu.active && "bg-accent text-accent-foreground",
                  )}
                >
                  {submenu.icon && <submenu.icon className="h-4 w-4" />}
                  <span>{submenu.label}</span>
                </a>
              </DropdownMenuItem>
            ))}
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
                  <SidebarMenuSubButton isActive={submenu.active}>
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
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
                      <span className="truncate font-semibold">
                        {activeOrganization?.name}
                      </span>
                      <span className="truncate text-xs">
                        {activeOrganization?.name}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                align="end"
                side={isMobile ? "bottom" : "right"}
                className="w-64 p-2 rounded-lg border border-border/40 shadow-lg animate-in fade-in-50 zoom-in-95 slide-in-from-top-5 duration-200"
              >
                {organizations && organizations.length > 0 && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-medium px-2 py-1.5 text-muted-foreground">
                        Accounts
                      </DropdownMenuLabel>
                      <div className="max-h-[200px] overflow-y-auto my-1 rounded-md space-y-0.5 pr-1">
                        {organizations.map((org) => (
                          <DropdownMenuItem
                            key={org.id}
                            className={cn(
                              "group flex items-center gap-3 p-2 rounded-md transition-all cursor-pointer duration-200",
                              activeOrganization?.id === org.id
                                ? "bg-primary/10 text-primary font-medium shadow-sm"
                                : "hover:bg-accent hover:translate-x-1 hover:shadow-sm",
                              switchingOrg === org.id &&
                              "animate-pulse opacity-70",
                            )}
                            onSelect={() => handleOrganizationSwitch(org.id)}
                            disabled={switchingOrg !== null}
                          >
                            {org.logo ? (
                              <div
                                className={cn(
                                  "h-8 w-8 overflow-hidden rounded-md shadow-sm shrink-0 transition-all duration-300",
                                  activeOrganization?.id === org.id
                                    ? "ring-2 ring-primary/30"
                                    : "ring-1 ring-border/50 hover:ring-primary/20",
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
                                    "hover:scale-110",
                                  )}
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-300",
                                  activeOrganization?.id === org.id
                                    ? "bg-primary/20"
                                    : "bg-primary/10 hover:bg-primary/15",
                                )}
                              >
                                <Building className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium leading-none">
                                {org.name}
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {org.trialEndsAt
                                  ? "Trial account"
                                  : "Paid account"}
                              </span>
                            </div>
                            {activeOrganization?.id === org.id && (
                              <Check className="h-4 w-4 ml-auto text-primary animate-in zoom-in-50 duration-300" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuLabel className="text-xs font-medium px-2 py-1.5 text-muted-foreground">
                        New company
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setShowCredenza(true)}
                        className="group flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:translate-x-1 transition-all cursor-pointer duration-200 hover:shadow-sm"
                      >
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 hover:bg-primary/20">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">
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
                        className="cursor-pointer"
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
                <SidebarGroupLabel className="flex items-center gap-2">
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
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name ?? ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {session.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="size-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 group text-red-500"
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
                  <LogOut className="size-4 text-red-500 group-hover:text-white" />
                  Se déconnecter
                </DropdownMenuItem>
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