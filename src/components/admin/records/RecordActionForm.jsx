import Field from "../../global/FormInput.jsx";
import Modal from "../../global/Modal.jsx";
import Button from "../../global/Button.jsx";
import { api } from "../../../configs/api.js";
export default function RecordActionForm({
  action,
  setAction,
  error,
  setError,
  busy,
  setBusy,
  load,
  doAction,
}) {
  return (
    <Modal
      busy={busy}
      title={
        action.name === "import"
          ? "Import existing CRM"
          : action.name === "trial"
            ? "Grant free trial"
            : action.name
      }
      onClose={() => {
        if (!busy) setAction(null);
      }}
    >
      {error && (
        <p
          className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <form
        onSubmit={
          action.name === "import"
            ? async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await api("clients/import", {
                    method: "POST",
                    body: { organizationId: action.organizationId },
                  });
                  setAction(null);
                  await load();
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }
            : doAction
        }
      >
        {action.name === "import" ? (
          <Field label="Existing Company ID">
            <input
              required
              value={action.organizationId}
              onChange={(e) => setAction({ ...action, organizationId: e.target.value })}
            />
          </Field>
        ) : (
          <>
            <p className="mb-5 rounded-xl bg-brand-50 p-4 text-sm text-gray-600">
              Changes affect client access. Confirm the reason before continuing.
            </p>
            {action.name === "trial" && (
              <Field label="Trial days">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={action.days}
                  onChange={(e) => setAction({ ...action, days: e.target.value })}
                />
              </Field>
            )}
            {action.name === "pay" && (
              <Field label="Manual payment reference">
                <input
                  required
                  minLength={3}
                  value={action.reference}
                  onChange={(e) => setAction({ ...action, reference: e.target.value })}
                />
              </Field>
            )}
            <Field label="Reason">
              <textarea
                required
                minLength={3}
                value={action.reason}
                onChange={(e) => setAction({ ...action, reason: e.target.value })}
              />
            </Field>
          </>
        )}
        <div className="modal-actions">
          <Button
            variant="secondary"
            type="button"
            disabled={busy}
            onClick={() => setAction(null)}
          >
            Cancel
          </Button>
          <Button variant="primary" className="bg-brand-900 text-white" disabled={busy}>
            {busy ? "Saving…" : "Confirm"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
