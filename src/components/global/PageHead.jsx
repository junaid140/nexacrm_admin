function PageHead({ title, children }) {
  return (
    <div className="page-head mb-7 flex min-h-10 flex-wrap items-center justify-between gap-4 [&>h1]:m-0 [&>h1]:text-2xl [&>h1]:font-semibold [&>h1]:tracking-tight md:[&>h1]:text-3xl">
      <h1 className="min-w-0 break-words text-brand-900">{title}</h1>
      {children && (
        <div className="page-actions ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 print:hidden">
          {children}
        </div>
      )}
    </div>
  );
}
export default PageHead;
