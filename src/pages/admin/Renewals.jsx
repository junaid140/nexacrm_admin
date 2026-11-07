import SelectField from "../../components/global/SelectField.jsx";
import FilterPanel from "../../components/global/FilterPanel.jsx";
import { useEffect, useRef, useState } from "react";
import { api } from "../../configs/api.js";
import PageHead from "../../components/global/PageHead.jsx";
import Card from "../../components/global/Card.jsx";
import Button from "../../components/global/Button.jsx";
import DataLoader from "../../components/global/DataLoader.jsx";
import Modal from "../../components/global/Modal.jsx";
import Field from "../../components/global/FormInput.jsx";
const money = (value, currency = "PKR") =>
  `${currency} ${(Number(value || 0) / 100).toLocaleString()}`;
export default function Renewals() {
  const [status, setStatus] = useState("pending");
  const [filters, setFilters] = useState({ search: "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [proof, setProof] = useState("");
  const [proofError, setProofError] = useState("");
  const [proofLoading, setProofLoading] = useState(false);
  const [decision, setDecision] = useState("approved");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(null);
    setError("");
    api(
      "renewals?" +
        new URLSearchParams({
          status,
          page: String(page),
          pageSize: String(limit),
          ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
        }),
    )
      .then((row) => {
        if (active) setResult(row);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, page, limit, revision, filters]);
  useEffect(() => {
    let active = true;
    setProof("");
    setProofError("");
    if (selected) {
      setProofLoading(true);
      api(`renewals/${selected.id}/proof`)
        .then((row) => {
          if (active) setProof(row.data);
        })
        .catch((e) => {
          if (active) setProofError(e.message);
        })
        .finally(() => {
          if (active) setProofLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [selected]);
  function open(row) {
    setSelected(row);
    setReason("");
    setDecision("approved");
  }
  async function review(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setProofError("");
    try {
      await api(`renewals/${selected.id}/review`, {
        method: "POST",
        body: { decision, reason },
      });
      setSelected(null);
      setNotice(
        decision === "approved"
          ? "Payment approved. Subscription updated and paid invoice created."
          : "Request rejected. The client can see your detailed reason.",
      );
      setRevision((value) => value + 1);
    } catch (e) {
      setProofError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead title="Payment verification" />
      {error && (
        <p role="alert" className="mb-4 text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-brand-700">
          {notice}
        </p>
      )}
      <FilterPanel
        search={filters.search}
        placeholder="Search companies…"
        onSearchChange={(value) => {
          setPage(1);
          setFilters((current) => ({ ...current, search: value }));
        }}
        active={
          Object.values(filters).filter(Boolean).length + (status !== "all" ? 1 : 0)
        }
        onClear={() => {
          setPage(1);
          setStatus("pending");
          setFilters({ search: "", from: "", to: "" });
        }}
      >
        <SelectField
          label="Verification status"
          value={status === "all" ? "" : status}
          placeholder="All"
          onChange={(value) => {
            setStatus(value || "all");
            setPage(1);
          }}
          options={["pending", "approved", "rejected"].map((value) => ({
            value,
            label: value[0].toUpperCase() + value.slice(1),
          }))}
        />

        {[
          ["from", "Submitted from"],
          ["to", "Submitted to"],
        ].map(([key, title]) => (
          <label
            key={key}
            className="flex min-w-36 flex-1 flex-col gap-2 text-xs text-gray-500"
          >
            {title}
            <input
              type={key === "search" ? "search" : "date"}
              value={filters[key]}
              maxLength={key === "search" ? 100 : undefined}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, [key]: event.target.value }));
              }}
            />
          </label>
        ))}
      </FilterPanel>
      <Card>
        {loading ? (
          <DataLoader />
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {[
                    "Company",
                    "Plan change",
                    "Total due",
                    "Transferred",
                    "Status",
                    "Submitted",
                    "Review",
                  ].map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result?.docs.map((row) => (
                  <tr key={row.id}>
                    <td>{row.companyName}</td>
                    <td>
                      <p className="font-medium">{row.planName}</p>
                      <span className="text-xs text-gray-400">
                        {row.fromCycle} to {row.targetCycle}
                        {row.discountPercent ? ` / ${row.discountPercent}% discount` : ""}
                      </span>
                    </td>
                    <td>{money(row.amountDue, row.currency)}</td>
                    <td>{money(row.transferredAmount, row.currency)}</td>
                    <td className="capitalize">{row.status}</td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button variant="secondary" onClick={() => open(row)}>
                        {row.status === "pending" ? "Verify payment" : "View details"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!result?.docs.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No {status === "all" ? "renewal" : status} requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-5 text-sm">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[25, 50, 100].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span>
              {page} / {result?.pages || 1}
            </span>
            <Button
              variant="secondary"
              disabled={loading || page >= (result?.pages || 1)}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      {selected && (
        <Modal
          busy={busy}
          title={`Payment - ${selected.companyName}`}
          wide
          onClose={() => {
            if (!busy) setSelected(null);
          }}
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold">Payment screenshot</h3>
              {proofLoading ? (
                <DataLoader />
              ) : proof ? (
                <img
                  src={proof}
                  alt="Renewal payment screenshot"
                  className="max-h-[55vh] w-full rounded-xl border border-gray-200 object-contain"
                />
              ) : (
                <p className="text-sm text-gray-400">Screenshot unavailable.</p>
              )}
            </div>
            <div>
              <dl className="grid gap-4 text-sm">
                {[
                  ["Requested plan", selected.planName],
                  ["Quoted total", money(selected.amountDue, selected.currency)],
                  [
                    "Transferred amount",
                    money(selected.transferredAmount, selected.currency),
                  ],
                  ["Sender bank", selected.sourceBankName],
                  ["Sender account / IBAN", selected.sourceAccountNumber],
                  ["Receiving bank", selected.receivingBank?.bankName],
                  ["Receiving account", selected.receivingBank?.accountNumber],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-gray-400">{label}</dt>
                    <dd className="mt-1 break-all font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-gray-500">
                Confirm the actual credit in your bank account. A screenshot alone does
                not verify receipt.
              </p>
            </div>
          </div>
          {selected.status === "pending" ? (
            <form onSubmit={review} className="mt-6 border-t border-gray-100 pt-5">
              <Field label="Decision">
                <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                  <option value="approved">Approve payment and renew plan</option>
                  <option value="rejected">Decline / reject request</option>
                </select>
              </Field>
              <Field
                label="Detailed verification reason"
                hint="This reason is visible to the client. Minimum 10 characters."
              >
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              {proofError && (
                <p role="alert" className="mb-4 text-red-600">
                  {proofError}
                </p>
              )}
              {selected.amountDue !== selected.transferredAmount && (
                <p className="mb-4 text-sm text-amber-800">
                  The transferred amount differs from the quoted total. Reject the request
                  and ask for corrected payment details.
                </p>
              )}
              <div className="modal-actions">
                <Button
                  type="submit"
                  loading={busy}
                  disabled={
                    decision === "approved" &&
                    (!proof || selected.amountDue !== selected.transferredAmount)
                  }
                >
                  {decision === "approved" ? "Approve renewal" : "Reject request"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm">
              <p className="mb-2 font-semibold capitalize">{selected.status}</p>
              <p className="whitespace-pre-wrap">{selected.reviewReason}</p>
              {proofError && (
                <p role="alert" className="mt-3 text-red-600">
                  {proofError}
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
