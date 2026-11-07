function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  ...props
}) {
  return (
    <button
      className={`btn inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 btn-${variant} ${className}`}
      {...props}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : null}
      {children}
    </button>
  );
}
export default Button;
