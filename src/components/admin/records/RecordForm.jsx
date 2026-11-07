import { money } from "../../../utils/format.js";
import { Formik, Form } from "formik";
import { recordValidation } from "../../../validations/recordValidation.js";
import FormInput from "../../global/FormInput.jsx";
import Modal from "../../global/Modal.jsx";
import Button from "../../global/Button.jsx";
export default function RecordForm({
  editing,
  setEditing,
  config,
  busy,
  error,
  save,
  options,
}) {
  return (
    <Modal
      wide
      busy={busy}
      title={`${editing.id ? "Edit" : "Create"} ${config.title.toLowerCase()}`}
      onClose={() => {
        if (!busy) setEditing(null);
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
      <Formik
        initialValues={editing.values}
        validationSchema={recordValidation(config, options)}
        onSubmit={save}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            <div className="grid items-start gap-x-6 gap-y-5 sm:grid-cols-2">
              {config.fields.map(([key, label, type = "text", choices]) => {
                const value = values[key];
                const change = (value) => {
                  setFieldValue(key, value);
                  if (key === "planId") {
                    const plan = options.plans?.find((item) => item.id === value);
                    if (plan?.code) setFieldValue("cycle", plan.code);
                    if (
                      config.fields.some(([name]) => name === "subscriptionPrice") &&
                      plan
                    )
                      setFieldValue("subscriptionPrice", plan.price / 100);
                  }
                };
                const pool =
                  type === "subscriptions"
                    ? options.subscriptions?.filter(
                        (item) => item.clientId === values.clientId,
                      )
                    : type === "organizations"
                      ? options.clients
                      : type in options
                        ? options[type]
                        : null;
                return (
                  <FormInput
                    className={type === "textarea" ? "sm:col-span-2" : ""}
                    key={key}
                    label={
                      key === "subscriptionPrice" &&
                      options.plans?.find((plan) => plan.id === values.planId)?.code ===
                        "lifetime"
                        ? "Selling Price (PKR)"
                        : label
                    }
                    error={touched[key] && errors[key]}
                  >
                    {type === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => change(e.target.checked)}
                      />
                    ) : type === "textarea" ? (
                      <textarea
                        rows={4}
                        value={value}
                        onChange={(e) => change(e.target.value)}
                      />
                    ) : choices || pool ? (
                      <select
                        required
                        value={value}
                        onChange={(e) => change(e.target.value)}
                      >
                        <option value="">Select…</option>
                        {(choices || pool).map((option) => (
                          <option
                            key={typeof option === "string" ? option : option.id}
                            value={
                              typeof option === "string"
                                ? option
                                : type === "organizations"
                                  ? option.organizationId
                                  : option.id
                            }
                          >
                            {typeof option === "string" ? option : option.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={
                          ["money", "number", "optionalNumber"].includes(type)
                            ? "number"
                            : type
                        }
                        min={
                          ["money", "number", "optionalNumber"].includes(type)
                            ? 0
                            : undefined
                        }
                        step={type === "money" ? "0.01" : undefined}
                        value={value}
                        autoComplete={type === "password" ? "new-password" : undefined}
                        onChange={(e) => change(e.target.value)}
                      />
                    )}
                  </FormInput>
                );
              })}
            </div>
            {config.fields.some(([key]) => key === "subscriptionPrice") &&
              values.planId && (
                <div className="mt-3 grid gap-4 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:grid-cols-3">
                  {(() => {
                    const plan = options.plans?.find((row) => row.id === values.planId);
                    const actual = plan?.price || 0;
                    const agreed = Math.round(
                      Number(values.subscriptionPrice || 0) * 100,
                    );
                    return [
                      ["Actual Price", actual],
                      [
                        plan?.code === "lifetime"
                          ? "Selling Price"
                          : "Subscription Price",
                        agreed,
                      ],
                      ["Total Discount", Math.max(0, actual - agreed)],
                    ].map(([label, amount]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="mt-1 font-semibold text-brand-900">
                          {money(amount, plan?.currency || "PKR")}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              )}
            <div className="modal-actions">
              <Button
                variant="secondary"
                type="button"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-brand-900 text-white"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
