import { Formik, Form } from "formik";
import Modal from "../../global/Modal.jsx";
import Field from "../../global/FormInput.jsx";
import Button from "../../global/Button.jsx";
import { planValidation, planBody } from "../../../validations/planValidation.js";
export default function PlanForm({ plan, onClose, onSave, error }) {
  return (
    <Formik
      initialValues={{
        name: plan.name,
        price: plan.price / 100,
        renewalDiscountPercent: plan.renewalDiscountPercent || 0,
        renewalDiscountScope: plan.renewalDiscountScope || "plan_change",
      }}
      validationSchema={planValidation}
      onSubmit={(values) => onSave(planBody(values, plan.version || 0))}
    >
      {({ values, errors, touched, handleChange, isSubmitting }) => (
        <Modal
          busy={isSubmitting}
          title={`Edit ${plan.name} plan`}
          onClose={() => {
            if (!isSubmitting) onClose();
          }}
        >
          <Form>
            <Field label="Plan name" error={touched.name && errors.name}>
              <input
                name="name"
                value={values.name}
                onChange={handleChange}
                maxLength={200}
              />
            </Field>
            <Field label="Price (PKR)" error={touched.price && errors.price}>
              <input
                name="price"
                type="number"
                min="1"
                max="10000000"
                step="0.01"
                value={values.price}
                onChange={handleChange}
              />
            </Field>
            <Field
              label="Discount on renewal (%)"
              hint="Use 0 to disable the plan promotion. Maximum 99%."
              error={touched.renewalDiscountPercent && errors.renewalDiscountPercent}
            >
              <input
                name="renewalDiscountPercent"
                type="number"
                min="0"
                max="99"
                step="0.01"
                value={values.renewalDiscountPercent}
                onChange={handleChange}
              />
            </Field>
            <Field
              label="Apply discount to"
              error={touched.renewalDiscountScope && errors.renewalDiscountScope}
            >
              <select
                name="renewalDiscountScope"
                value={values.renewalDiscountScope}
                onChange={handleChange}
              >
                <option value="plan_change">Plan changes only</option>
                <option value="all_renewals">Every renewal</option>
              </select>
            </Field>
            <p className="mb-5 rounded-xl bg-brand-50 p-4 text-sm text-gray-500">
              Changes apply to new quotes. Existing invoices and submitted payment
              requests retain their saved amounts. Company discounts do not stack with
              plan discounts; the higher eligible discount applies.
            </p>
            {error && (
              <p role="alert" className="mb-4 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <Button
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save plan
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </Formik>
  );
}
