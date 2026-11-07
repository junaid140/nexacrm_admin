import FilterPanel from "../../global/FilterPanel.jsx";
import SelectField from "../../global/SelectField.jsx";
import Field from "../../global/FormInput.jsx";
const title = (value) =>
  value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
export default function ReportFilters({ range, setRange, options = {} }) {
  const change = (key, value) => setRange((current) => ({ ...current, [key]: value }));
  const fields = [
    [
      "clientId",
      "Company",
      (options.clients || []).map((row) => ({ value: row.id, label: row.name })),
    ],
    [
      "industry",
      "Industry",
      (options.industries || []).map((row) => ({ value: row.name, label: row.name })),
    ],
    ["clientStatus", "Company status", ["active", "suspended", "archived"]],
    [
      "planId",
      "Plan",
      (options.plans || []).map((row) => ({ value: row.id, label: row.name })),
    ],
    [
      "cycle",
      "Billing cycle",
      [
        { value: "monthly", label: "Monthly" },
        { value: "annual", label: "Yearly" },
        { value: "lifetime", label: "Lifetime" },
      ],
    ],
    [
      "subscriptionStatus",
      "Subscription status",
      ["trial", "active", "suspended", "cancelled", "expired"],
    ],
    ["access", "CRM access", ["enabled", "disabled"]],
    ["invoiceStatus", "Invoice status", ["draft", "issued", "paid", "void"]],
    ["currency", "Currency", ["PKR", "USD", "AED", "GBP", "EUR"]],
    [
      "dateBasis",
      "Invoice date type",
      [
        { value: "createdAt", label: "Created" },
        { value: "dueAt", label: "Due" },
        { value: "paidAt", label: "Paid" },
      ],
    ],
  ];
  return (
    <FilterPanel
      active={Object.values(range).filter(Boolean).length}
      onClear={() => setRange({})}
    >
      {fields.map(([key, label, choices]) => (
        <SelectField
          key={key}
          label={label}
          placeholder={key === "dateBasis" ? "Created" : "All"}
          value={range[key] || ""}
          onChange={(value) => change(key, value)}
          options={choices.map((value) =>
            typeof value === "string"
              ? { value, label: key === "currency" ? value : title(value) }
              : value,
          )}
        />
      ))}
      {[
        ["from", "Invoice date from"],
        ["to", "Invoice date to"],
      ].map(([key, label]) => (
        <Field key={key} label={label}>
          <input
            type="date"
            value={range[key] || ""}
            min={key === "to" ? range.from : undefined}
            onChange={(event) => change(key, event.target.value)}
          />
        </Field>
      ))}
      <p className="col-span-full text-xs text-gray-500">
        Company and subscription filters apply to current totals and usage. Invoice date
        and status filters apply to revenue records. Recurring revenue remains a current
        subscription snapshot.
      </p>
    </FilterPanel>
  );
}
