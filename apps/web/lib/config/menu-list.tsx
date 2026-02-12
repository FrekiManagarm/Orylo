import {
  LayoutGrid,
  Settings,
  FileText,
  Link as LinkIcon,
  Shield,
} from "lucide-react";
// Type pour les icônes Hugeicons (objets SVG, pas composants React)
type HugeIconType = typeof LayoutGrid;

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  comingSoon?: boolean;
  icon: HugeIconType;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: HugeIconType;
  submenus?: Submenu[];
  comingSoon?: boolean;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function proMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: `/dashboard`,
          label: "Overview",
          active: pathname === `/dashboard`,
          icon: LayoutGrid,
        },
      ],
    },
    {
      groupLabel: "Fraud Detection",
      menus: [
        {
          href: `/dashboard/transactions`,
          label: "Transactions",
          active: pathname === `/dashboard/transactions`,
          icon: FileText,
        },
        {
          href: `/dashboard/rules`,
          label: "Rules",
          active: pathname === `/dashboard/rules`,
          icon: Shield,
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: `/dashboard/connections`,
          label: "Connections",
          active: pathname === `/dashboard/connections`,
          icon: LinkIcon,
        },
        {
          href: `/dashboard/settings`,
          label: "Settings",
          active: pathname.startsWith(`/dashboard/settings`),
          icon: Settings,
        },
      ],
    },
  ];
}