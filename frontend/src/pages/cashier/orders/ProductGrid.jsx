import { Plus } from "lucide-react";
import { docId } from "../../../helpers/docId";
import { POS, posLineImageSrc } from "../../../components/cashier/posListTheme";

const ProductGrid = ({
  visibleProducts,
  filteredProducts,
  hasMore,
  onLoadMore,
  cartLookup,
  onAddToCart,
  /** When true (mobile cart bar visible), shrink scroll height + pad list end so last row stays tappable */
  reserveMobileCart = false,
}) => {
  return (
    <section className="min-w-0 md:col-span-8">
      <div className="mb-2 flex items-center justify-between px-0.5 text-[11px] text-slate-500 md:text-xs">
        <span className="font-semibold text-slate-800">Menu</span>
        <span className="font-medium tabular-nums text-indigo-600/85">
          {visibleProducts.length}/{filteredProducts.length}
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-indigo-100/80 bg-white p-6 text-center text-xs text-slate-500 shadow-[0_4px_20px_rgba(67,56,202,0.08)] ring-1 ring-indigo-950/[0.05] md:p-8">
          No items match.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-b from-white via-white to-indigo-50/35 shadow-[0_8px_28px_rgba(67,56,202,0.09)] ring-1 ring-indigo-950/[0.05]">
          <div
            className={[
              "overflow-y-auto overscroll-y-contain p-2 sm:p-3 md:p-4 md:max-h-[min(70vh,calc(100dvh-10rem))] lg:max-h-[min(75vh,calc(100dvh-9rem))]",
              /* Mobile: reserve space for fixed cart bar + sticky header (bar is out of document flow) */
              reserveMobileCart
                ? "max-h-[calc(100dvh-15.5rem-env(safe-area-inset-bottom,0px))] scroll-pb-28 pb-28 pt-0.5 md:max-h-[min(70vh,calc(100dvh-10rem))] md:scroll-pb-0 md:pb-3 md:pt-0"
                : "max-h-[calc(100dvh-11.5rem-env(safe-area-inset-bottom,0px))] pb-4 md:max-h-[min(70vh,calc(100dvh-10rem))] md:pb-3",
            ].join(" ")}
          >
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3 xl:grid-cols-3">
              {visibleProducts.map((product, idx) => {
                const productKey = docId(product) || `p-${idx}`;
                const inCart = productKey ? cartLookup?.get(productKey) : undefined;
                const price = Number(product?.price ?? 0);
                const src = posLineImageSrc(product);

                return (
                  <button
                    key={productKey}
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className={`${POS.rowBtn} md:h-full`}
                  >
                    <img
                      src={src}
                      alt=""
                      className={POS.thumbLg}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={POS.title}>{product?.name || "Item"}</p>
                      {inCart ? (
                        <p className="mt-0.5 text-[10px] font-medium text-emerald-600/95">Cart ×{inCart.qty}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={POS.price}>₹{price.toFixed(0)}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/35 ring-2 ring-white">
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center py-2 pb-4 md:pb-2">
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="rounded-xl border border-indigo-200/90 bg-white px-4 py-2 text-[11px] font-semibold text-indigo-900 shadow-sm hover:bg-indigo-50/60 hover:shadow-md"
                >
                  More
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
