const StatCard = ({ title, value }) => {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-shadow hover:shadow-card-lg">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-slate-500" />
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl">
          {value}
        </p>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <p className="mt-3 text-[11px] text-slate-400">Selected date range</p>
      </div>
    </div>
  );
};

export default StatCard;
