import WebsiteSettings from "./WebsiteSettings.jsx";
import { useState } from "react";
import { api } from "../../../configs/api.js";
import { downloadInvoice } from "../../../configs/api.js";
import Card from "../../global/Card.jsx";
import { Layers } from "lucide-react";
import Button from "../../global/Button.jsx";
import DataLoader from "../../global/DataLoader.jsx";
export default function RecordsTable({
  user,
  load,
  setNotice,
  section,
  config,
  setPage,
  query,
  count,
  loading,
  rows,
  columns,
  display,
  openEditor,
  options,
  setAction,
  pageSize,
  setPageSize,
  page,
  pages,
  setError,
}) {
  const [websiteCompany, setWebsiteCompany] = useState(null);
  const [trialBusy, setTrialBusy] = useState("");
  const sales = user?.role === "Sales Agent";
  const hasActions = config.fields && (!sales || section === "clients");
  return (
    <>
      <Card>
        <div className="border-b border-gray-100 px-5 py-4 text-sm text-gray-400">
          {count} records
        </div>
        {loading ? (
          <DataLoader />
        ) : rows.length ? (
          <div className="max-w-full overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {columns.map((key) => (
                    <th key={key}>
                      {key === "subscriptionPrice"
                        ? "Price"
                        : key.replace(/([A-Z])/g, " $1")}
                    </th>
                  ))}
                  {hasActions && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((key) => (
                      <td key={key}>
                        {display(key, row[key], row)}
                        {key === "subscriptionPrice" && (
                          <p className="mt-1 text-xs text-gray-400">
                            {row.cycle === "lifetime"
                              ? "Selling Price"
                              : "Subscription Price"}
                          </p>
                        )}
                      </td>
                    ))}
                    {hasActions && (
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          {section === "billing" && (
                            <Button
                              variant="secondary"
                              onClick={async () => {
                                try {
                                  await downloadInvoice(row.id, row.number);
                                } catch (error) {
                                  setError(error.message);
                                }
                              }}
                            >
                              Download PDF
                            </Button>
                          )}
                          {!sales && section === "clients" && (
                            <Button
                              variant="secondary"
                              onClick={() => setWebsiteCompany(row)}
                            >
                              Website Forms
                            </Button>
                          )}
                          {!sales && (
                            <Button variant="secondary" onClick={() => openEditor(row)}>
                              Edit
                            </Button>
                          )}
                          {section === "clients" && (
                            <Button
                              variant="secondary"
                              disabled={
                                !!trialBusy ||
                                options.subscriptions?.some(
                                  (sub) => sub.clientId === row.id,
                                )
                              }
                              onClick={async () => {
                                setTrialBusy(row.id);
                                setError("");
                                try {
                                  await api(`clients/${row.id}/trial`, {
                                    method: "POST",
                                    body: {},
                                  });
                                  await load();
                                  setNotice(
                                    "14-day free trial assigned. You can now create this client's CRM Owner.",
                                  );
                                } catch (error) {
                                  setError(error.message);
                                } finally {
                                  setTrialBusy("");
                                }
                              }}
                            >
                              {trialBusy === row.id
                                ? "Assigning trial…"
                                : options.subscriptions?.some(
                                      (sub) => sub.clientId === row.id,
                                    )
                                  ? "Trial / subscription assigned"
                                  : "Grant 14-day trial"}
                            </Button>
                          )}
                          {section === "clients" && (
                            <a
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              href={`${options.crmFrontendUrl || "http://localhost:5173"}/login?company=${encodeURIComponent(row.organizationId)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              CRM login
                            </a>
                          )}
                          {(section === "subscriptions"
                            ? ["trial", "renew", "suspend", "cancel"]
                            : section === "billing"
                              ? row.status === "draft"
                                ? ["issue", "void"]
                                : row.status === "issued"
                                  ? ["pay", "void"]
                                  : []
                              : []
                          ).map((name) => (
                            <Button
                              variant="secondary"
                              key={name}
                              onClick={() =>
                                setAction({
                                  name,
                                  row,
                                  days: 14,
                                  reason: "",
                                  reference: "",
                                })
                              }
                            >
                              {name === "trial" ? "Grant trial" : name}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-gray-400">
            <Layers size={30} />
            <h3>No {config.title.toLowerCase()} yet</h3>
            <p>
              {query ? "Try another search." : "Your saved records will appear here."}
            </p>
          </div>
        )}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[25, 50, 100].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              {page} / {pages}
            </span>
            <Button
              variant="secondary"
              disabled={page >= pages || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </footer>
      </Card>
      {websiteCompany && (
        <WebsiteSettings
          company={websiteCompany}
          onClose={() => setWebsiteCompany(null)}
          setNotice={setNotice}
        />
      )}
    </>
  );
}
