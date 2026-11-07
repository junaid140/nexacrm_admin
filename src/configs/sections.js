export const sections = {
  "contact-settings": { title: "Contact details" },
  "trial-applications": { title: "Free trial applications" },
  renewals: { title: "Payment verification" },
  "payment-settings": { title: "Bank details" },
  dashboard: {
    title: "Overview",
  },
  admins: {
    title: "Users & roles",
    createLabel: "Add SaaS user",
    fields: [
      ["name", "Full name"],
      ["email", "Email", "email"],
      ["password", "Password (12+ characters; blank retains existing)", "password"],
      ["role", "Role", "select", ["Sales Agent", "Manager", "Admin"]],
      ["active", "Account enabled", "checkbox"],
    ],
  },
  clients: {
    createLabel: "Add client",
    title: "Clients",
    description: "Manage CRM organizations and access status.",
    fields: [
      ["name", "Company name"],
      ["organizationId", "Company ID"],
      ["email", "Owner email", "email"],
      ["phone", "Phone"],
      ["industry", "Industry"],
      ["status", "Status", "select", ["active", "suspended", "archived"]],
      ["notes", "Notes", "textarea"],
    ],
  },
  plans: { title: "Plans & pricing" },
  subscriptions: {
    createLabel: "Add subscription",
    title: "Subscriptions",
    description: "Assign plans, manage trials, renewals and client limits.",
    fields: [
      ["clientId", "Client", "clients"],
      ["planId", "Plan", "plans"],

      ["subscriptionPrice", "Subscription Price (PKR)", "money"],
      ["status", "Status", "select", ["trial", "active", "suspended", "cancelled"]],
      ["reason", "Assignment reason", "textarea"],
    ],
  },
  users: {
    createLabel: "Create CRM Owner",
    title: "CRM Owners",
    description:
      "Provision client users and manage their access. Platform Owner accounts are protected.",
    fields: [
      ["organizationId", "Client organization", "organizations"],
      ["name", "Full name"],
      ["email", "Email", "email"],
      ["password", "Password (12+ characters; blank retains existing)", "password"],
      ["role", "Role", "select", ["Admin"]],
      ["active", "Account enabled", "checkbox"],
    ],
  },
  billing: {
    createLabel: "Create invoice",
    title: "Invoices & payments",
    description: "Issue invoices and record verified manual payments with a reference.",
    fields: [
      ["clientId", "Client", "clients"],
      ["subscriptionId", "Subscription", "subscriptions"],

      ["dueAt", "Due date", "date"],
      ["notes", "Notes", "textarea"],
    ],
  },
  industries: {
    createLabel: "Add industry",
    title: "Industries",
    description: "Maintain client industry categories.",
    fields: [
      ["name", "Industry name"],
      ["description", "Description", "textarea"],
      ["active", "Available", "checkbox"],
    ],
  },
  support: {
    createLabel: "Create ticket",
    title: "Support",
    description: "Track client issues, priorities and resolutions.",
    fields: [
      ["clientId", "Client", "clients"],
      ["subject", "Subject"],
      ["message", "Message", "textarea"],
      ["status", "Status", "select", ["open", "in_progress", "resolved"]],
      ["priority", "Priority", "select", ["normal", "high", "urgent"]],
      ["response", "Response", "textarea"],
    ],
  },
  system: {
    createLabel: "Add configuration",
    title: "System configuration",
    description:
      "Administrative configuration registry. Secrets belong in private server configuration.",
    fields: [
      ["key", "Setting key"],
      ["name", "Display name"],
      ["value", "Value", "textarea"],
      ["description", "Description", "textarea"],
    ],
  },
  integrations: {
    createLabel: "Add integration",
    title: "Integrations",
    description:
      "Track provider setup. Credentials and actual SMTP/Meta connections remain in the CRM service.",
    fields: [
      ["name", "Integration name"],
      ["provider", "Provider", "select", ["manual", "smtp", "meta"]],
      ["status", "Setup status", "select", ["disabled", "configured"]],
      ["notes", "Setup notes (no secrets)", "textarea"],
    ],
  },
  audit: {
    title: "Audit trail",
    description: "Immutable platform activity history.",
  },
  reports: {
    title: "Reports",
    description:
      "Revenue by currency, subscription health and customer growth. Invoice dates filter revenue records; company and subscription filters scope current totals and usage.",
  },
  settings: {
    title: "Platform settings",
    description: "Environment and account setup for this administration panel.",
  },
};
