import { recordFilters } from "../../../configs/recordFilters.js";
import FilterPanel from "../../global/FilterPanel.jsx";
import SelectField from "../../global/SelectField.jsx";
const label = (value) =>
  value === "true"
    ? "Enabled"
    : value === "false"
      ? "Disabled"
      : value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
export default function RecordFilters({
  section,
  filters = {},
  setFilters,
  options = {},
  setPage,
  search,
  setSearch,
  setQuery,
}) {
  if (!setFilters || section === "industries") return null;
  const change = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  return (
    <FilterPanel
      active={Object.values(filters).filter(Boolean).length + (search ? 1 : 0)}
      search={search}
      onSearchChange={setSearch}
      onSearch={() => {
        setPage(1);
        setQuery(search);
      }}
      onClear={() => {
        setPage(1);
        setFilters({});
        setSearch?.("");
        setQuery?.("");
      }}
    >
      {(recordFilters[section] || []).map(([key, title, choices]) => {
        const rows = Array.isArray(choices)
          ? choices.map((value) => ({ value, name: label(value) }))
          : (choices === "organizations" ? options.clients : options[choices])?.map(
              (row) => ({
                value:
                  choices === "organizations"
                    ? row.organizationId
                    : key === "industry"
                      ? row.name
                      : row.id,
                name: row.name,
              }),
            ) || [];
        return (
          <SelectField
            key={key}
            label={title}
            placeholder="All"
            value={filters[key] || ""}
            onChange={(value) => change(key, value)}
            options={rows.map((row) => ({ value: row.value, label: row.name }))}
          />
        );
      })}
      {[
        ["from", "Created from"],
        ["to", "Created to"],
      ].map(([key, title]) => (
        <label
          key={key}
          className="flex min-w-36 flex-1 flex-col gap-1.5 text-xs text-gray-500"
        >
          {title}
          <input
            type="date"
            value={filters[key] || ""}
            min={key === "to" ? filters.from : undefined}
            onChange={(e) => change(key, e.target.value)}
          />
        </label>
      ))}
    </FilterPanel>
  );
}
