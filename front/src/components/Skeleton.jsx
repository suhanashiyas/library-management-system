// Reusable loading placeholder block. Compose these into page-shaped
// skeletons (stat cards, table rows, list rows) instead of plain "Loading..." text.
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

export default Skeleton;
