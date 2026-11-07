import ReportFilters from "./ReportFilters.jsx";
import Card from "../../global/Card.jsx";
import { Link } from "react-router-dom";
import { Users, Layers, LifeBuoy, ArrowUpRight } from "lucide-react";
import DataLoader from "../../global/DataLoader.jsx";
import { money } from "../../../utils/format.js";
export default function ReportOverview({
  section,
  range,
  setRange,
  loading,
  summary,
  options,
}) {
  return (
    <>
      {section === "reports" && (
        <ReportFilters range={range} setRange={setRange} options={options} />
      )}
      {loading ? (
        <DataLoader />
      ) : (
        summary && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Clients", summary.clients, Users],
                ["Current subscriptions", summary.subscriptionCount, Layers],
                ["Active CRM users", summary.activeUsers, Users],
                ["Open support tickets", summary.openTickets, LifeBuoy],
              ].map(([label, value, Icon]) => (
                <article
                  className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm"
                  key={label}
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-900">
                    <Icon size={19} />
                  </div>
                  <p>{label}</p>
                  <strong className="my-2 block text-3xl font-semibold text-gray-900">
                    {Number(value).toLocaleString()}
                  </strong>
                  <small>From your CRM platform</small>
                </article>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                  <h2>Revenue overview</h2>
                  <span className="inline-flex rounded-full bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-900">
                    Manual payments
                  </span>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Currency</th>
                        <th>Collected</th>
                        <th>Outstanding</th>
                        <th>Monthly recurring</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.currencies.map((row) => (
                        <tr key={row.currency}>
                          <td>{row.currency}</td>
                          <td>{money(row.collected, row.currency)}</td>
                          <td>{money(row.outstanding, row.currency)}</td>
                          <td>{money(row.monthlyRecurring, row.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!summary.currencies.length && (
                  <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-gray-400">
                    No invoices or active paid subscriptions yet.
                  </div>
                )}
                <p className="px-5 pb-5 text-xs text-gray-400">
                  Currencies remain separate. Recurring revenue uses current agreed
                  subscription prices; collected revenue uses paid invoice amounts.
                </p>
              </Card>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                  <h2>Subscription health</h2>
                  <Layers size={18} />
                </div>
                <div className="space-y-4 p-5 [&>div]:flex [&>div]:items-center [&>div]:gap-3 [&_strong]:ml-auto">
                  {Object.entries(summary.statuses).map(([status, count]) => (
                    <div key={status}>
                      <span className="size-2 rounded-full bg-brand-900" />
                      <span>{status}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            {section === "reports" && (
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                  <h2>Client usage & access</h2>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Company ID</th>
                        <th>Users / limit</th>
                        <th>Leads / limit</th>
                        <th>Storage (MB)</th>
                        <th>Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.clientUsage?.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.organizationId}</td>
                          <td>
                            {row.users} / {row.maxUsers}
                          </td>
                          <td>
                            {row.leads} / {row.maxLeads}
                          </td>
                          <td>{row.storageMb}</td>
                          <td>
                            <span className="inline-flex rounded-full bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-900">
                              {row.access ? "Enabled" : "No active subscription"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2>Build your next customer relationship.</h2>
                <p>Choose a plan, register your company, and create its CRM Owner.</p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 bg-brand-900 text-white"
                to="/clients"
              >
                Manage clients <ArrowUpRight size={16} />
              </Link>
            </Card>
          </>
        )
      )}
    </>
  );
}
