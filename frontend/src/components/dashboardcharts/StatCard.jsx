const StatCard = ({ title, value }) => {
  return (
    <div className="group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />
      <div className="p-4">
        <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
          {title}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-900 tabular-nums">
          {value}
        </h2>
        <div className="mt-3 h-px bg-gray-100" />
        <p className="mt-2 text-xs text-gray-500">
          Updated for selected range
        </p>
      </div>
    </div>
  );
};

export default StatCard;
