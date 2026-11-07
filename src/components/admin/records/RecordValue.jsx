import { date, money } from "../../../utils/format.js";
export default function createRecordDisplay(options) {
  const labelFor = (id, kind) => options[kind]?.find((row) => row.id === id)?.name || id;
  const display = (key, value, row) => {
    if (
      [
        "price",
        "discountAmount",
        "monthlyPrice",
        "annualPrice",
        "amount",
        "actualPrice",
        "subscriptionPrice",
        "totalDiscount",
      ].includes(key)
    )
      return money(value, row.currency);
    if (key === "endsAt" && row.cycle === "lifetime" && row.status === "active")
      return "Lifetime";
    if (key.endsWith("At")) return date(value);
    if (key === "clientId") return labelFor(value, "clients");
    if (key === "planId") return labelFor(value, "plans");
    if (key === "packageId") return labelFor(value, "packages");
    if (key === "status")
      return (
        <span
          className={`inline-flex rounded-full bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-900 ${["suspended", "cancelled", "void", "archived"].includes(value) ? "opacity-60" : ""}`}
        >
          {value}
          {!(row.cycle === "lifetime" && value === "active") &&
          ["active", "trial"].includes(value) &&
          new Date(row.status === "trial" ? row.trialEndsAt : row.endsAt) < new Date()
            ? " · expired"
            : ""}
        </span>
      );
    if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
    if (Array.isArray(value)) return value.join(", ");
    return value ?? "—";
  };
  return display;
}
