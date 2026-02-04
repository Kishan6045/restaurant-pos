import { Search } from "lucide-react";

// Search and Category filter component
const SearchAndCategories = ({
  search,            // Current search text
  onSearchChange,    // Search input change handler
  categoryOptions,   // List of categories (including "All")
  activeCat,         // Currently selected category
  onSelectCategory,  // Category selection handler
}) => {
  return (
    // Wrapper: column on mobile, row on desktop
    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">

      {/* Search input section */}
      <div className="relative flex-1">

        {/* Search icon inside input */}
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        {/* Search text input */}
        <input
          type="text"
          value={search}               // Controlled input value
          onChange={onSearchChange}    // Update search state
          placeholder="Search menu items..."
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Category buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">

        {/* Loop through categories */}
        {categoryOptions.map((cat) => (
          <button
            key={cat._id}                     // Unique key
            onClick={() => onSelectCategory(cat._id)} // Set active category
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
              activeCat === cat._id
                ? "border-orange-500 bg-orange-500 text-white" // Active category style
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300" // Inactive category style
            }`}
          >
            {/* Category name */}
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndCategories;
