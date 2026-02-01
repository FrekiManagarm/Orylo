export const breadcrumbProList = () => [
  {
    title: "Tableau de bord",
    href: `/dashboard`,
  },
  {
    title: "Transactions",
    href: `/dashboard/transactions`,
  },
  {
    title: "Connect",
    href: `/dashboard/connect`,
  },
  {
    title: "Rules",
    href: `/dashboard/rules`,
  },
  {
    title: "Settings",
    href: `/dashboard/settings`,
    items: [
      {
        title: "Billing",
        href: `/dashboard/settings/billing`,
      },
    ],
  },
];