// Consistent, readable date formatting used across the app (e.g. "Aug 9, 2026")
export const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
