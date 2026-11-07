import SelectField from "../../components/global/SelectField.jsx";
import FilterPanel from "../../components/global/FilterPanel.jsx";
import { useState } from "react";
import { api } from "../../configs/api.js";
import Button from "../../components/global/Button.jsx";
import PlanForm from "../../components/admin/plans/PlanForm.jsx";
import useCrm from "../../hooks/useCrm.js";
import PageHead from "../../components/global/PageHead.jsx";
import Card from "../../components/global/Card.jsx";
import DataLoader from "../../components/global/DataLoader.jsx";
import { money } from "../../utils/format.js";
export default function Plans() {
  const { rows, loading, error: loadError, load } = useCrm();
  const [cycle, setCycle] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function save(body) {
    setError("");
    try {
      await api(`plans/${editing.id}`, { method: "PUT", body });
      setEditing(null);
      setNotice("Plan pricing and renewal discount saved.");
      await load();
    } catch (failure) {
      setError(failure.message);
    }
  }
  return (
    <>
      <PageHead title="Plans & pricing" />
      <FilterPanel active={cycle ? 1 : 0} onClear={() => setCycle("")}>
        <SelectField
          label="Plan"
          placeholder="All plans"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Yearly" },
            { value: "lifetime", label: "Lifetime" },
          ]}
        />
      </FilterPanel>
      {(loadError || error) && (
        <p role="alert" className="mb-5 text-red-600">
          {loadError || error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-5 text-brand-700">
          {notice}
        </p>
      )}
      {loading ? (
        <DataLoader />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {rows
            .filter((row) => !cycle || row.code === cycle)
            .sort((a, b) => a.price - b.price)
            .map((plan) => (
              <Card key={plan.id} title={plan.name}>
                <div className="p-6">
                  <p className="mb-2 text-3xl font-semibold text-brand-900">
                    {money(plan.price, plan.currency)}
                  </p>
                  <p>
                    {plan.code === "lifetime"
                      ? "One-time payment"
                      : plan.code === "annual"
                        ? "Per year"
                        : "Per month"}
                  </p>
                  <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm">
                    <p className="font-medium text-brand-900">
                      {plan.renewalDiscountPercent || 0}% renewal discount
                    </p>
                    <p className="mt-1 text-gray-500">
                      {plan.renewalDiscountScope === "all_renewals"
                        ? "Applies to every renewal"
                        : "Applies when changing to this plan"}
                    </p>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    <li>All CRM features included</li>
                    <li>Complete CRM Owner control</li>
                    <li>Permanent company discount available</li>
                    {plan.code === "lifetime" && <li>No expiry date</li>}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant="secondary"
                    onClick={() => {
                      setEditing(plan);
                      setError("");
                      setNotice("");
                    }}
                  >
                    Edit plan
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
      {editing && (
        <PlanForm
          plan={editing}
          onClose={() => setEditing(null)}
          onSave={save}
          error={error}
        />
      )}
    </>
  );
}
