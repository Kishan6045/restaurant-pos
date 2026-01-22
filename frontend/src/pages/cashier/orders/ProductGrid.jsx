import { Plus } from "lucide-react";

// Product grid component
const ProductGrid = ({
  visibleProducts,   // Products currently visible (pagination applied)
  filteredProducts,  // All filtered products (category + search)
  hasMore,            // Whether more products are available
  onLoadMore,         // Load more button handler
  cartLookup,         // Map to check if product is already in cart
  onAddToCart,        // Add product to cart handler
}) => {
  return (
    // Main section for products
    <section className="lg:col-span-8">

      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Menu</h2>

        {/* Showing count */}
        <span className="text-xs text-slate-500">
          Showing {visibleProducts.length} of {filteredProducts.length}
        </span>
      </div>

      {/* Empty state when no products found */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No items found. Try a different search or category.
        </div>
      ) : (
        // Product list container
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-3 pr-2 sm:p-4">

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => {
                // Check if product is already in cart
                const inCart = cartLookup.get(product._id);

                return (
                  // Single product card
                  <div
                    key={product._id} // Unique key
                    className="flex flex-col rounded-lg border border-slate-200 bg-white p-3"
                  >
                    {/* Product image */}
                    <div className="h-24 overflow-hidden rounded-md bg-slate-100 sm:h-28">
                      <img
                        src={product.image || "/no-image.png"} // Fallback image
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy" // Lazy load for performance
                      />
                    </div>

                    {/* Product details */}
                    <div className="mt-2 flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {product.name}
                      </h3>

                      {/* Show description only if available */}
                      {product.description && (
                        <p className="mt-1 text-xs text-slate-500 truncate">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Price and add button */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        ₹{product.price}
                      </span>

                      {/* Add to cart button */}
                      <button
                        onClick={() => onAddToCart(product)} // Add product to cart
                        className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>

                    {/* Show quantity if item is already in cart */}
                    {inCart && (
                      <div className="mt-2 text-xs font-medium text-emerald-600">
                        In cart: {inCart.qty}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load more button */}
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={onLoadMore} // Increase visible products
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                >
                  Load more
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
