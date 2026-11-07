export const matchesPath = (pathname, path) =>
  pathname === path || pathname.startsWith(path + "/");
export const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { name: "Free trial applications", path: "/trial-applications", icon: "CalendarClock" },
  { name: "Clients", path: "/clients", icon: "Users" },
  {
    name: "Subscriptions",
    icon: "CalendarClock",
    children: [
      { name: "All subscriptions", path: "/subscriptions" },
      { name: "Payment verification", path: "/renewals" },
      { name: "Bank details", path: "/payment-settings" },
    ],
  },
  { name: "CRM Owners", path: "/users", icon: "ContactRound" },
  {
    name: "Catalog",
    icon: "Megaphone",
    children: [
      { name: "Plans & pricing", path: "/plans" },
      { name: "Industries", path: "/industries" },
    ],
  },
  {
    name: "Finance & service",
    icon: "ListTodo",
    children: [
      { name: "Invoices & payments", path: "/billing" },
      { name: "Reports", path: "/reports" },
      { name: "Support", path: "/support" },
    ],
  },
  {
    name: "Administration",
    icon: "Settings2",
    children: [
      { name: "Users & roles", path: "/admins" },
      { name: "System configuration", path: "/system" },
      { name: "Integrations", path: "/integrations" },
      { name: "Audit trail", path: "/audit" },
      { name: "Contact details", path: "/contact-settings" },
      { name: "Settings", path: "/settings" },
    ],
  },
];
