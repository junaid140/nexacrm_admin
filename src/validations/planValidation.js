import * as Yup from "yup";
const precision = (value) =>
  value === undefined || Math.abs(Math.round(value * 100) - value * 100) < 0.00001;
export const planValidation = Yup.object({
  name: Yup.string().trim().required("Enter the plan name").max(200),
  price: Yup.number()
    .typeError("Enter a price")
    .required("Enter a price")
    .min(1)
    .max(10000000)
    .test("precision", "Use at most two decimal places", precision),
  renewalDiscountPercent: Yup.number()
    .typeError("Enter a percentage")
    .required("Enter a percentage")
    .min(0)
    .max(99)
    .test("precision", "Use at most two decimal places", precision),
  renewalDiscountScope: Yup.string().oneOf(["plan_change", "all_renewals"]).required(),
});
export const planBody = (values, version) => ({
  name: values.name.trim(),
  price: Math.round(Number(values.price) * 100),
  renewalDiscountPercent: Number(values.renewalDiscountPercent),
  renewalDiscountScope: values.renewalDiscountScope,
  version,
});
