import { useId, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Card from "./Card.jsx";
import Button from "./Button.jsx";
export default function FilterPanel({
  children,
  active = 0,
  onClear,
  search,
  onSearchChange,
  onSearch,
  placeholder = "Search records…",
}) {
  const [open, setOpen] = useState(active > 0);
  const id = useId();
  return (
    <Card>
      <div className="p-5">
        <form
          className="flex flex-wrap gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch?.();
          }}
        >
          {onSearchChange && (
            <input
              className="min-w-0 flex-1"
              aria-label={placeholder}
              placeholder={placeholder}
              value={search || ""}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          )}
          {onSearch && (
            <Button type="submit" variant="secondary">
              Search
            </Button>
          )}
          <Button
            type="button"
            variant={open ? "primary" : "secondary"}
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen(!open)}
          >
            <SlidersHorizontal size={16} />
            Filters{active ? ` (${active})` : ""}
          </Button>
          <Button type="button" variant="secondary" disabled={!active} onClick={onClear}>
            Clear filters
          </Button>
        </form>
        <div
          id={id}
          hidden={!open}
          className={
            open
              ? "mt-5 grid gap-x-4 border-t border-gray-100 pt-5 sm:grid-cols-2 xl:grid-cols-4"
              : "hidden"
          }
        >
          {children}
        </div>
      </div>
    </Card>
  );
}
