export const createRecordDefaults = (config) =>
  Object.fromEntries(
    (config.fields || []).map(([key, , type, choices]) => [
      key,
      type === "checkbox"
        ? true
        : type === "number" || type === "money"
          ? 0
          : type === "date"
            ? new Date().toISOString().slice(0, 10)
            : choices?.[0] || "",
    ]),
  );
