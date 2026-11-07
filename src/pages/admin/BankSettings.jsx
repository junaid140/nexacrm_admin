import { useEffect, useRef, useState } from "react";
import { api } from "../../configs/api.js";
import PageHead from "../../components/global/PageHead.jsx";
import Card from "../../components/global/Card.jsx";
import Field from "../../components/global/FormInput.jsx";
import Button from "../../components/global/Button.jsx";
import DataLoader from "../../components/global/DataLoader.jsx";
export default function BankSettings() {
  const [values, setValues] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    api("payment-settings")
      .then((row) => {
        if (active) setValues(row);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("payment-settings", { method: "PUT", body: values });
      setNotice(
        "Bank details saved. Enabled details are visible to CRM Owners for manual renewal payments.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead title="Bank details" />
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
      {!values ? (
        !error && <DataLoader />
      ) : (
        <Card title="Receiving Pakistani bank account">
          <form onSubmit={save} className="max-w-3xl p-5">
            <p className="mb-5 text-sm text-gray-500">
              Clients transfer renewal payments to this account. Payment proof must be
              verified before approving a renewal.
            </p>
            <div className="grid gap-x-5 sm:grid-cols-2">
              {[
                ["bankName", "Bank name"],
                ["accountTitle", "Account title"],
                ["accountNumber", "Account number"],
                ["iban", "Pakistani IBAN (optional)"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    required={key !== "iban"}
                    maxLength={key === "iban" ? 32 : key === "accountNumber" ? 50 : 150}
                    value={values[key]}
                    onChange={(e) =>
                      setValues((current) => ({ ...current, [key]: e.target.value }))
                    }
                  />
                </Field>
              ))}
              <div className="sm:col-span-2">
                <Field label="Payment instructions">
                  <textarea
                    maxLength={1000}
                    rows={4}
                    value={values.instructions}
                    onChange={(e) =>
                      setValues((current) => ({
                        ...current,
                        instructions: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </div>
            <label className="mb-6 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={values.enabled}
                onChange={(e) =>
                  setValues((current) => ({ ...current, enabled: e.target.checked }))
                }
              />
              Show bank details and enable manual renewal requests
            </label>
            <Button loading={busy} type="submit">
              Save bank details
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
