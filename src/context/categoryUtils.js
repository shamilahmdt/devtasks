export const normalizeCategory = (name) =>
  typeof name === "string" ? name.trim().toUpperCase() : "";
