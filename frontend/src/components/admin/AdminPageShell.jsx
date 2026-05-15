/**
 * Shared admin page chrome: title band + card body.
 */
const AdminPageShell = ({ title, description, actions, children }) => {
  return (
    <div className="space-y-5 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
        {children}
      </section>
    </div>
  );
};

export default AdminPageShell;
