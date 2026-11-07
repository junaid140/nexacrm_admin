import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
function textContent(value) {
  return Children.toArray(value)
    .map((child) =>
      isValidElement(child) ? textContent(child.props.children) : String(child),
    )
    .join("");
}
function readOptions(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === Fragment || child.type === "optgroup")
      return readOptions(child.props.children);
    if (child.type !== "option") return [];
    const label = textContent(child.props.children);
    return [
      {
        value: String(child.props.value ?? label),
        label,
        disabled: !!child.props.disabled,
      },
    ];
  });
}
export default function SearchSelect({
  children,
  value,
  defaultValue,
  onChange,
  multiple = false,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  const options = readOptions(children);
  const [localValue, setLocalValue] = useState(
    defaultValue ?? (multiple ? [] : (options[0]?.value ?? "")),
  );
  const current = value ?? localValue;
  const selected = (multiple ? current : [current]).map(String);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(null);
  const [label, setLabel] = useState(props["aria-label"] || "Select an option");
  const root = useRef(null),
    trigger = useRef(null),
    search = useRef(null),
    popup = useRef(null),
    native = useRef(null);
  const listId = useId();
  const filtered = options.filter(
    (option) =>
      !option.disabled &&
      option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const selectedLabels = options
    .filter((option) => selected.includes(option.value) && option.value !== "")
    .map((option) => option.label);
  const placeholder =
    options.find((option) => option.value === "")?.label || "Select an option";
  useLayoutEffect(() => {
    if (props["aria-label"]) return;
    const parent = root.current.closest("label");
    const title =
      parent?.querySelector(":scope > span")?.textContent ||
      [...(parent?.childNodes || [])]
        .filter((node) => node.nodeType === 3)
        .map((node) => node.textContent)
        .join("")
        .trim();
    if (title) setLabel(title);
  }, [props["aria-label"]]);
  useLayoutEffect(() => {
    if (!open) return;
    const rect = trigger.current.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const below = viewportHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const height = Math.min(310, Math.max(below, above));
    const width = Math.min(Math.max(rect.width, 240), window.innerWidth - 24);
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      width,
      top:
        below >= Math.min(310, above)
          ? rect.bottom + 6
          : Math.max(12, rect.top - height - 6),
      maxHeight: Math.max(120, height),
    });
    search.current?.focus({
      preventScroll: true,
    });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!root.current?.contains(event.target) && !popup.current?.contains(event.target))
        setOpen(false);
    };
    const reposition = (event) => {
      if (!popup.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", reposition);
    document.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("scroll", reposition, true);
    };
  }, [open]);
  useEffect(() => {
    popup.current?.querySelector('[data-active="true"]')?.scrollIntoView({
      block: "nearest",
    });
  }, [active, query]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus({
      preventScroll: true,
    });
  };
  const show = () => {
    if (!disabled) {
      setQuery("");
      setActive(0);
      setOpen(true);
    }
  };
  const choose = (option) => {
    const next = multiple
      ? selected.includes(option.value)
        ? selected.filter((item) => item !== option.value)
        : [...selected, option.value]
      : option.value;
    setLocalValue(next);
    const values = multiple ? next : [next];
    const target = {
      value: multiple ? next[0] || "" : next,
      name: props.name,
      selectedOptions: options
        .filter((item) => values.includes(item.value))
        .map((item) => ({
          value: item.value,
          label: item.label,
        })),
    };
    onChange?.({
      target,
      currentTarget: target,
    });
    if (!multiple) close();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) =>
        Math.max(
          0,
          Math.min(filtered.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)),
        ),
      );
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    }
    if (event.key === "Tab") {
      event.preventDefault();
      close();
    }
  };
  const portalTarget =
    root.current?.closest('[role="dialog"]') ||
    (typeof document !== "undefined" ? document.body : null);
  return (
    <span
      ref={root}
      className={`search-select relative inline-block w-full min-w-0 align-middle ${className}`}
    >
      <select
        {...props}
        ref={native}
        value={current}
        multiple={multiple}
        required={required}
        disabled={disabled}
        className="select-validation"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onChange}
        onInvalid={(event) => {
          event.preventDefault();
          trigger.current?.focus();
          show();
        }}
      >
        {children}
      </select>
      <button
        ref={trigger}
        type="button"
        className="select-trigger flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-normal text-gray-900 focus:border-brand-600 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>svg]:text-gray-400"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-required={required}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            show();
          }
        }}
      >
        <span className={selectedLabels.length ? "" : "select-placeholder text-gray-400"}>
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>
        <ChevronDown size={16} />
      </button>
      {open &&
        createPortal(
          <div
            ref={popup}
            className="select-popup fixed z-[160] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
            style={
              position || {
                visibility: "hidden",
              }
            }
            onKeyDown={onKeyDown}
          >
            <div className="select-search flex shrink-0 items-center gap-2 border-b border-gray-100 px-3 py-1 text-gray-400 [&>input]:min-h-10 [&>input]:w-full [&>input]:border-0 [&>input]:bg-white [&>input]:px-0 [&>input]:py-2 [&>input]:text-sm [&>input]:outline-none [&>button]:p-1">
              <Search size={16} />
              <input
                ref={search}
                role="combobox"
                aria-label={`Search ${label}`}
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={
                  filtered[active] ? `${listId}-${active}` : undefined
                }
                autoComplete="off"
                placeholder="Search options…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
              />
              <button type="button" aria-label="Close options" onClick={close}>
                <X size={15} />
              </button>
            </div>
            <div
              className="select-options max-h-60 min-h-0 flex-1 overflow-y-auto overscroll-contain p-1"
              id={listId}
              role="listbox"
              aria-label={label}
              aria-multiselectable={multiple || undefined}
            >
              {filtered.map((option, index) => (
                <div
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={selected.includes(option.value)}
                  data-active={active === index}
                  className="select-option flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm leading-relaxed text-gray-700 hover:bg-gray-50 data-[active=true]:bg-brand-100 aria-selected:font-medium aria-selected:text-brand-900"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {selected.includes(option.value) && <Check size={16} />}
                </div>
              ))}
              {!filtered.length && (
                <div
                  className="select-empty px-3 py-6 text-center text-sm text-gray-400"
                  role="status"
                >
                  No matching options
                </div>
              )}
            </div>
            {multiple && (
              <div className="select-done flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-400 [&>button]:rounded-lg [&>button]:bg-brand-900 [&>button]:px-3 [&>button]:py-2 [&>button]:text-white">
                <span>{selected.length} selected</span>
                <button type="button" onClick={close}>
                  Done
                </button>
              </div>
            )}
          </div>,
          portalTarget,
        )}
    </span>
  );
}
