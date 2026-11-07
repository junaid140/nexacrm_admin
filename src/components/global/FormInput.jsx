function Field({ label: title, hint, error, children, className = "" }) {
  return (
    <label
      className={`field mb-5 flex min-w-0 flex-col gap-2 text-sm [&>span:first-child]:font-medium [&>span:first-child]:text-gray-600 [&>small]:text-xs [&>small]:leading-relaxed [&>small]:text-gray-400 [&>input]:w-full [&>textarea]:w-full ${className}`}
    >
      <span>{title}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <small className="error-text text-sm text-red-600">{error}</small>}
    </label>
  );
}
export default Field;
