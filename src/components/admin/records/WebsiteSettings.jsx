import { useEffect, useState } from "react";
import { api } from "../../../configs/api.js";
import Modal from "../../global/Modal.jsx";
import Field from "../../global/FormInput.jsx";
import Button from "../../global/Button.jsx";
import DataLoader from "../../global/DataLoader.jsx";
export default function WebsiteSettings({ company, onClose, setNotice }) {
  const [values, setValues] = useState(null);
  const [domains, setDomains] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api(`clients/${company.id}/website-settings`)
      .then((data) => {
        if (active) {
          setValues(data);
          setDomains(data.allowedOrigins.join("\n"));
        }
      })
      .catch((error) => active && setError(error.message));
    return () => {
      active = false;
    };
  }, [company.id]);
  return (
    <Modal title={`Website Forms · ${company.name}`} onClose={onClose} busy={busy}>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {!values ? (
        !error && <DataLoader />
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              await api(`clients/${company.id}/website-settings`, {
                method: "PUT",
                body: {
                  enabled: values.enabled,
                  maxForms: Number(values.maxForms),
                  maxMonthlySubmissions: Number(values.maxMonthlySubmissions),
                  allowedOrigins: domains
                    .split(/\n/)
                    .map((value) => value.trim())
                    .filter(Boolean),
                  managerAccess: values.managerAccess,
                },
              });
              setNotice("Website Forms settings saved");
              onClose();
            } catch (error) {
              setError(error.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="mb-5 text-sm text-gray-500">
            Enable website intake and private webhooks for this company. Accepted
            submissions count toward its existing CRM lead allowance; repeated contacts
            remain one client.
          </p>
          <label className="mb-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={values.enabled}
              onChange={(event) =>
                setValues({ ...values, enabled: event.target.checked })
              }
            />
            Enable website webhooks
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Maximum active webhooks">
              <input
                type="number"
                min="0"
                max="1000"
                required
                value={values.maxForms}
                onChange={(event) =>
                  setValues({ ...values, maxForms: event.target.value })
                }
              />
            </Field>
            <Field label="Monthly accepted submissions">
              <input
                type="number"
                min="0"
                max="1000000"
                required
                value={values.maxMonthlySubmissions}
                onChange={(event) =>
                  setValues({ ...values, maxMonthlySubmissions: event.target.value })
                }
              />
            </Field>
          </div>
          <Field
            label="Approved website origins"
            hint="One HTTPS origin per line, for example https://example.com. Localhost HTTP is allowed for development."
          >
            <textarea
              rows={4}
              value={domains}
              onChange={(event) => setDomains(event.target.value)}
            />
          </Field>
          <label className="mb-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={values.managerAccess}
              onChange={(event) =>
                setValues({ ...values, managerAccess: event.target.checked })
              }
            />
            Allow CRM Managers to manage forms
          </label>
          <p className="mb-5 text-sm text-gray-500">
            Current usage: {values.activeForms} active forms · {values.monthlySubmissions}{" "}
            accepted submissions this UTC calendar month. Zero limits block new
            forms/submissions.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save website settings
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
