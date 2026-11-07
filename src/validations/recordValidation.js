import * as Yup from "yup";
export function prepareRecordValues(config, section, values) {
  const body = { ...values };
  for (const [key, , type] of config.fields) {
    if (["number", "optionalNumber"].includes(type)) {
      if (type === "optionalNumber" && body[key] === "") delete body[key];
      else body[key] = Number(body[key]);
    }
    if (type === "money") body[key] = Math.round(Number(body[key]) * 100);
    if (type === "password" && !body[key]) delete body[key];
  }
  if (section === "packages")
    body.features = String(body.features || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  return body;
}

export function recordValidation(config, options = {}) {
  const fields = {};
  for (const [key, label, type = "text", choices] of config.fields) {
    if (["money", "number", "optionalNumber"].includes(type))
      fields[key] = Yup.number()
        .transform((value, original) => (original === "" ? undefined : value))
        .min(0, `${label} cannot be negative`)
        .typeError(`${label} must be a number`);
    else if (type === "email")
      fields[key] = Yup.string().email("Enter a valid email address");
    else if (type === "password")
      fields[key] = Yup.string().test(
        "password-length",
        "Use at least 12 characters",
        (value) => !value || value.length >= 12,
      );
    else if (choices)
      fields[key] = Yup.string()
        .oneOf(choices, `Select a valid ${label.toLowerCase()}`)
        .required(`Select ${label.toLowerCase()}`);
    else if (
      ["clients", "packages", "plans", "organizations", "subscriptions"].includes(type)
    )
      fields[key] = Yup.string().required(`Select ${label.toLowerCase()}`);
  }
  if (fields.subscriptionPrice)
    fields.subscriptionPrice = fields.subscriptionPrice
      .required("Enter the subscription or selling price")
      .test(
        "price-precision",
        "Use at most two decimal places",
        (value) =>
          value === undefined ||
          Math.abs(value * 100 - Math.round(value * 100)) < 0.00001,
      )
      .when("planId", ([planId], schema) => {
        const plan = options.plans?.find((row) => row.id === planId);
        return plan
          ? schema.max(plan.price / 100, "Price cannot exceed the actual plan price")
          : schema;
      });
  return Yup.object(fields);
}
