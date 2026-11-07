export const recordColumns = (section, config) =>
  section === "plans"
    ? ["name", "price", "currency", "code"]
    : section === "audit"
      ? ["actorEmail", "action", "resource", "reason", "createdAt"]
      : section === "subscriptions"
        ? [
            "clientId",
            "planId",
            "status",
            "cycle",
            "actualPrice",
            "subscriptionPrice",
            "totalDiscount",
            "endsAt",
          ]
        : section === "billing"
          ? [
              "number",
              "clientId",
              "actualPrice",
              "subscriptionPrice",
              "totalDiscount",
              "status",
              "dueAt",
              "paymentReference",
            ]
          : (config.fields || [])
              .filter(([, , type]) => !["password", "textarea"].includes(type))
              .map(([key]) => key)
              .slice(0, 5);
