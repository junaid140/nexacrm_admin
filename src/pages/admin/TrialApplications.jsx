import SelectField from "../../components/global/SelectField.jsx";
import FilterPanel from "../../components/global/FilterPanel.jsx";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../configs/api.js";
import { sections } from "../../configs/sections.js";
import { createRecordDefaults } from "../../data/initialState.js";
import PageHead from "../../components/global/PageHead.jsx";
import Card from "../../components/global/Card.jsx";
import Button from "../../components/global/Button.jsx";
import DataLoader from "../../components/global/DataLoader.jsx";
import Modal from "../../components/global/Modal.jsx";
import Field from "../../components/global/FormInput.jsx";
import RecordForm from "../../components/admin/records/RecordForm.jsx";
export default function TrialApplications() {
  const [filters, setFilters] = useState({
    status: "pending",
    search: "",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1),
    [limit, setLimit] = useState(25),
    [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null),
    [decision, setDecision] = useState("approved"),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(null);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(null);
    setError("");
    api(
      "trial-applications?" +
        new URLSearchParams({
          ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
          page: String(page),
          pageSize: String(limit),
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
  }, [filters, page, limit, revision]);
  const change = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  async function review(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await api(`trial-applications/${selected.id}/review`, {
        method: "POST",
        body: { decision, reason },
      });
      setSelected(null);
      setPage(1);
      setFilters((current) => ({ ...current, status: decision }));
      setNotice(
        decision === "approved"
          ? "Trial approved. Client and 14-day trial created. You can now create the CRM Owner."
          : "Application declined. No client or CRM account was created.",
      );
      setRevision((value) => value + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  function owner(row) {
    setSelected(row);
    setError("");
    setEditing({
      id: "",
      values: {
        ...createRecordDefaults(sections.users),
        organizationId: row.organizationId,
        name: row.fullName,
        email: row.email,
        role: "Admin",
        active: true,
      },
    });
  }
  async function saveOwner(values) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await api("users", { method: "POST", body: values });
      setEditing(null);
      setSelected(null);
      setNotice(
        "CRM Owner created. Share sign-in details with the client through your approved channel.",
      );
      setRevision((value) => value + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead title="Free trial applications" />
      {error && !selected && (
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
        placeholder="Search applicants…"
        onSearchChange={(value) => {
          setPage(1);
          setFilters((current) => ({ ...current, search: value }));
        }}
        active={Object.values(filters).filter(Boolean).length}
        onClear={() => {
          setPage(1);
          setFilters({ status: "pending", search: "", from: "", to: "" });
        }}
      >
        <SelectField
          label="Status"
          value={filters.status === "all" ? "" : filters.status}
          placeholder="All"
          onChange={(value) => change("status", value || "all")}
          options={["pending", "approved", "declined"].map((value) => ({
            value,
            label: value[0].toUpperCase() + value.slice(1),
          }))}
        />

        {[
          ["from", "Submitted from"],
          ["to", "Submitted to"],
        ].map(([key, label]) => (
          <label key={key} className="flex flex-col gap-2 text-xs text-gray-500">
            {label}
            <input
              type="date"
              min={key === "to" ? filters.from : undefined}
              value={filters[key]}
              onChange={(e) => change(key, e.target.value)}
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
                    "Applicant",
                    "Company",
                    "Contact",
                    "Submitted",
                    "Status",
                    "Actions",
                  ].map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result?.docs.map((row) => (
                  <tr key={row.id}>
                    <td>{row.fullName}</td>
                    <td>
                      {row.companyName}
                      <p className="mt-1 text-xs text-gray-400">{row.industry}</p>
                    </td>
                    <td>
                      {row.email}
                      <p className="mt-1 text-xs text-gray-400">{row.phone}</p>
                    </td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="capitalize">{row.status}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelected(row);
                            setReason("");
                            setDecision("approved");
                            setError("");
                          }}
                        >
                          View details
                        </Button>
                        {row.status === "approved" && !row.ownerCreated && (
                          <Button onClick={() => owner(row)}>Create CRM Owner</Button>
                        )}
                        {row.ownerCreated && (
                          <Link
                            to="/users"
                            className="text-sm font-medium text-brand-800"
                          >
                            View CRM Owners
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!result?.docs.length && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No trial applications match these filters.
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
            <span>{result?.count || 0} applications</span>
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
      {selected && !editing && (
        <Modal
          title="Trial application details"
          wide
          busy={busy}
          onClose={() => setSelected(null)}
        >
          <dl className="grid gap-5 sm:grid-cols-2">
            {[
              ["Full name", selected.fullName],
              ["Email", selected.email],
              ["Phone", selected.phone],
              ["Company", selected.companyName],
              ["Industry", selected.industry],
              ["Team size", selected.teamSize],
              ["City", selected.city],
              ["Country", selected.country],
              ["Company address", selected.address],
              ["Website", selected.website],
              ["CRM requirements", selected.message],
            ].map(([label, value]) => (
              <div
                key={label}
                className={label === "CRM requirements" ? "sm:col-span-2" : ""}
              >
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="mt-1 break-words whitespace-pre-wrap text-sm font-medium">
                  {value || "-"}
                </dd>
              </div>
            ))}
          </dl>
          {selected.status === "pending" ? (
            <form onSubmit={review} className="mt-6 border-t border-gray-100 pt-5">
              <Field label="Decision">
                <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                  <option value="approved">Approve 14-day trial and add client</option>
                  <option value="declined">Decline application</option>
                </select>
              </Field>
              <Field label="Detailed verification reason">
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </Field>
              <p className="mb-4 text-sm text-gray-500">
                Verify the company and contact details before approving. Approval creates
                a client and starts a 14-day trial; create the CRM Owner separately
                afterwards.
              </p>
              {error && (
                <p role="alert" className="mb-4 text-red-600">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <Button type="submit" loading={busy}>
                  {decision === "approved" ? "Approve trial" : "Decline application"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm">
              <p className="mb-2 font-semibold capitalize">{selected.status}</p>
              <p className="whitespace-pre-wrap">{selected.reviewReason}</p>
              {selected.organizationId && (
                <p className="mt-3 break-all text-xs text-gray-500">
                  Company ID: {selected.organizationId}
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
      {editing && (
        <RecordForm
          editing={editing}
          setEditing={(value) => {
            setEditing(value);
            if (!value) setSelected(null);
          }}
          config={sections.users}
          busy={busy}
          error={error}
          save={saveOwner}
          options={{
            clients: [
              {
                id: selected.clientId,
                organizationId: selected.organizationId,
                name: selected.companyName,
              },
            ],
          }}
        />
      )}
    </>
  );
}
