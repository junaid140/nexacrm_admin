function Card({ title, description, action, children, className = "" }) {
  return (
    <section
      className={`card mb-6 min-w-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_8px_0_rgb(24_52_40_/_0.025)] ${className}`}
    >
      {title && (
        <div className="card-head flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-semibold [&_p]:mt-1 [&_p]:text-sm [&_p]:text-gray-500">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export default Card;
