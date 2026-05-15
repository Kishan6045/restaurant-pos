import { Search } from "lucide-react";

const SearchAndCategories = ({
  search = "",
  onSearchChange,
  categoryOptions = [],
  activeCat,
  onSelectCategory,
  variant = "light",
}) => {
  const dark = variant === "dark";
  return (
    <div className="flex flex-col gap-2 md:gap-2.5">
      <div className="relative">
        <Search
          className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 md:h-4 md:w-4 ${dark ? "left-3.5 text-slate-500 md:left-4" : "left-3 text-indigo-400/90 md:left-3.5"}`}
        />
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search…"
          className={`w-full rounded-full border py-2.5 pr-3 text-xs shadow-sm transition focus:outline-none focus:ring-2 md:py-3 md:pr-4 md:text-sm ${
            dark
              ? "border-slate-600 bg-slate-800 pl-9 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-500/30 md:pl-11"
              : "border-indigo-100/80 bg-white/90 pl-9 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-indigo-500/20 md:pl-11"
          }`}
          aria-label="Search menu items"
        />
      </div>

      <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none md:gap-2 md:pb-0">
        {categoryOptions.length === 0 ? (
          <span className={`py-1 text-[10px] ${dark ? "text-slate-500" : "text-slate-400"}`}>—</span>
        ) : (
          categoryOptions.map((cat, i) => {
            const catId = cat?._id ?? cat?.id ?? `cat-${i}`;
            const name = cat?.name ?? "All";
            const isActive = activeCat === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => onSelectCategory(catId)}
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold shadow-sm transition md:px-4 md:py-1.5 md:text-xs ${
                  dark
                    ? isActive
                      ? "bg-indigo-500 text-white shadow-indigo-500/25"
                      : "border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700/50"
                    : isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "border border-indigo-100/90 bg-white/90 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                }`}
              >
                {name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchAndCategories;
