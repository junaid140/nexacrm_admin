import { createContext, useContext } from "react";

export const DataLoadingContext = createContext(false);
export const useDataLoading = () => useContext(DataLoadingContext);

export default function DataLoader({ label = "Loading data", className = "" }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center gap-2 p-5 text-brand-900 ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
