const status = (choices) => ["status", "Status", choices];
export const recordFilters = {
  clients: [
    status(["active", "suspended", "archived"]),
    ["industry", "Industry", "industries"],
  ],
  subscriptions: [
    status(["trial", "active", "suspended", "cancelled"]),
    ["cycle", "Billing cycle", ["monthly", "annual", "lifetime"]],
    ["clientId", "Company", "clients"],
    ["planId", "Plan", "plans"],
  ],
  billing: [
    status(["draft", "issued", "paid", "void"]),
    ["clientId", "Company", "clients"],
    ["cycle", "Billing cycle", ["monthly", "annual", "lifetime"]],
  ],
  users: [
    ["active", "Account status", ["true", "false"]],
    ["organizationId", "Company", "organizations"],
  ],
  admins: [["active", "Account status", ["true", "false"]]],
  industries: [["active", "Availability", ["true", "false"]]],
  support: [
    status(["open", "in_progress", "resolved"]),
    ["priority", "Priority", ["normal", "high", "urgent"]],
    ["clientId", "Company", "clients"],
  ],
  integrations: [
    status(["disabled", "configured"]),
    ["provider", "Provider", ["manual", "smtp", "meta"]],
  ],
  audit: [
    [
      "resource",
      "Record type",
      [
        "clients",
        "subscriptions",
        "billing",
        "users",
        "admins",
        "plans",
        "renewals",
        "trial-applications",
        "billing-settings",
      ],
    ],
  ],
};
