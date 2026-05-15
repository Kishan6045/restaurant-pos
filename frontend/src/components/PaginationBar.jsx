import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Table-style pagination: in-flow footer with "X–Y of Z" and page controls.
 * @param {{ page: number, totalPages: number, total: number, limit: number, onPageChange: (page: number) => void, loading?: boolean }} props
 */
const PaginationBar = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  loading = false,
}) => {
  const totalSafe = Number(total) || 0;
  const from = totalSafe === 0 ? 0 : (page - 1) * limit + 1;
  const to = totalSafe === 0 ? 0 : Math.min(page * limit, totalSafe);
  const totalPagesSafe = Math.max(1, totalPages || Math.ceil(totalSafe / limit) || 1);

  const showPages = 5;
  let startPage = Math.max(1, page - Math.floor(showPages / 2));
  let endPage = Math.min(totalPagesSafe, startPage + showPages - 1);
  if (endPage - startPage + 1 < showPages) startPage = Math.max(1, endPage - showPages + 1);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  if (totalSafe === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 rounded-b-lg text-slate-500 text-sm">
        <span>0 items</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50 rounded-b-lg">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">{from}</span>
        <span className="mx-1 text-slate-400">–</span>
        <span className="font-medium text-slate-800">{to}</span>
        <span className="mx-1 text-slate-400">of</span>
        <span className="font-medium text-slate-800">{totalSafe}</span>
        <span className="ml-1 text-slate-500">{totalSafe === 1 ? "item" : "items"}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                disabled={loading}
                className="min-w-[2rem] h-8 px-2 rounded-md border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="text-slate-400 px-1 text-sm">…</span>}
            </>
          )}
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? "border border-slate-700 bg-slate-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
          {endPage < totalPagesSafe && (
            <>
              {endPage < totalPagesSafe - 1 && <span className="text-slate-400 px-1 text-sm">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPagesSafe)}
                disabled={loading}
                className="min-w-[2rem] h-8 px-2 rounded-md border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {totalPagesSafe}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPagesSafe || loading}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationBar;
