import { recordColumns } from "../domain/record.js";
import { createRecordDefaults } from "../data/initialState.js";
import { prepareRecordValues } from "../validations/recordValidation.js";
import { useDispatch, useSelector } from "react-redux";
import { setSession } from "../redux/slices/authSlice.js";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../configs/api.js";
import { sections } from "../configs/sections.js";
import createRecordDisplay from "../components/admin/records/RecordValue.jsx";
export default function usePageData(section) {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const baseConfig = sections[section] || sections.clients;
  const config = {
    ...baseConfig,
    ...(baseConfig.fields
      ? {
          fields: baseConfig.fields.map((field) => {
            if (section === "admins" && field[0] === "role" && user?.role === "Manager")
              return [...field.slice(0, 3), ["Sales Agent"]];
            if (
              section === "clients" &&
              field[0] === "status" &&
              user?.role === "Sales Agent"
            )
              return [...field.slice(0, 3), ["active"]];
            return field;
          }),
        }
      : {}),
  };

  const requestId = useRef(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ clients: [], packages: [], plans: [] });
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(null);
  const [action, setAction] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [range, setRange] = useState({ from: "", to: "" });
  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setRows([]);
    setError("");
    try {
      const account = await api("me");
      if (current !== requestId.current) return;
      dispatch(setSession(account));
      if (account.role === "Sales Agent" && !["clients", "users"].includes(section)) {
        navigate("/clients", { replace: true });
        return;
      }
      if (["dashboard", "reports"].includes(section)) {
        const [report, choices] = await Promise.all([
          api(
            "reports?" +
              new URLSearchParams(
                Object.fromEntries(
                  Object.entries(range).filter(([, value]) => value !== ""),
                ),
              ),
          ),
          section === "reports" ? api("options") : Promise.resolve(null),
        ]);
        if (current === requestId.current && choices) setOptions(choices);
        if (current === requestId.current) setSummary(report);
      } else if (
        ![
          "settings",
          "renewals",
          "payment-settings",
          "trial-applications",
          "contact-settings",
        ].includes(section)
      ) {
        const [data, choices] = await Promise.all([
          api(
            section +
              "?" +
              new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                search: query,
                ...Object.fromEntries(
                  Object.entries(filters).filter(([, value]) => value !== ""),
                ),
              }),
          ),
          api("options"),
        ]);
        if (current !== requestId.current) return;
        setRows(data.docs);
        setPages(data.pages);
        setCount(data.count);
        setOptions(choices);
      }
    } catch (e) {
      if (current !== requestId.current) return;
      if (e.status === 401) {
        dispatch(setSession(null));
        navigate("/login", { replace: true });
      } else setError(e.message);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [section, page, pageSize, query, range, filters, navigate, dispatch]);
  useEffect(() => {
    load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);
  useEffect(() => {
    setEditing(null);
    setFilters({});
    setAction(null);
    setPage(1);
    setSearch("");
    setQuery("");
    setOpen(false);
  }, [section]);
  const display = createRecordDisplay(options);
  const columns = recordColumns(section, config);
  const openEditor = (row) => {
    setError("");
    const values = createRecordDefaults(config);
    for (const [key, , type] of config.fields) {
      if (row?.[key] !== undefined)
        values[key] =
          type === "money"
            ? row[key] / 100
            : type === "date"
              ? String(row[key]).slice(0, 10)
              : Array.isArray(row[key])
                ? row[key].join(", ")
                : row[key];
    }
    setEditing({ id: row?.id || "", values });
  };
  const save = async (values) => {
    setBusy(true);
    setError("");
    try {
      const body = prepareRecordValues(config, section, values);
      await api(section + (editing.id ? "/" + editing.id : ""), {
        method: editing.id ? "PUT" : "POST",
        body,
      });
      setEditing(null);
      setNotice("Changes saved");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const doAction = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`${section}/${action.row.id}/actions`, {
        method: "POST",
        body: {
          action: action.name,
          version: action.row.version || 0,
          days: Number(action.days),
          reason: action.reason,
          reference: action.reference,
        },
      });
      setAction(null);
      setNotice("Action completed");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const exportReport = () => {
    const items = summary?.currencies || [];
    const csv = [
      "Currency,Collected,Outstanding,Monthly recurring",
      ...items.map((r) =>
        [
          r.currency,
          r.collected / 100,
          r.outstanding / 100,
          r.monthlyRecurring / 100,
        ].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "crm-revenue.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    config,
    filters,
    setFilters,
    user,
    error,
    setError,
    notice,
    setNotice,
    loading,
    busy,
    open,
    setOpen,
    rows,
    options,
    summary,
    editing,
    setEditing,
    action,
    setAction,
    page,
    setPage,
    pageSize,
    setPageSize,
    pages,
    count,
    search,
    setSearch,
    query,
    setQuery,
    range,
    setRange,
    load,
    display,
    columns,
    openEditor,
    save,
    doAction,
    exportReport,
    setBusy,
  };
}
