export const date = (value) => (value ? new Date(value).toLocaleDateString() : "—");
export const money = (value, currency = "PKR") =>
  new Intl.NumberFormat("en", { style: "currency", currency }).format(
    (Number(value) || 0) / 100,
  );
