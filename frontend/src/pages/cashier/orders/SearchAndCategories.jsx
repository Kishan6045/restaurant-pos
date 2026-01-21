import { Search } from "lucide-react";

const SearchAndCategories = ({
  search,
  onSearchChange,
  categoryOptions,
  activeCat,
  onSelectCategory,
}) => {
  return (
    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search menu items..."
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categoryOptions.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onSelectCategory(cat._id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
              activeCat === cat._id
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndCategories;
