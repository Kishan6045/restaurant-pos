import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axios";
import {
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ShoppingBag,
  Clock,
  CheckCircle,
  X,
  Search,
} from "lucide-react";

const PAGE_SIZE = 24;
const ALL_CATEGORY = "all";

const OrderScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(ALL_CATEGORY);
  const [existingOrder, setExistingOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [sending, setSending] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadExistingOrder();
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCat, search]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      const cats = res.data.categories || [];
      setCategories(cats);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const loadExistingOrder = async () => {
    try {
      const res = await api.get("/api/orders");
      const openOrder = (res.data || []).find(
        (o) => o.tableId?._id === tableId && o.orderStatus === "open"
      );
      setExistingOrder(openOrder || null);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const categoryOptions = useMemo(
    () => [{ _id: ALL_CATEGORY, name: "All" }, ...categories],
    [categories]
  );

  const normalizedSearch = useMemo(
    () => search.trim().toLowerCase(),
    [search]
  );

  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCat && activeCat !== ALL_CATEGORY) {
      list = list.filter(
        (p) => p.category?._id === activeCat || p.category === activeCat
      );
    }

    if (normalizedSearch) {
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(normalizedSearch)
      );
    }

    return list;
  }, [products, activeCat, normalizedSearch]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  const cartLookup = useMemo(() => {
    const lookup = new Map();
    cart.forEach((item) => lookup.set(item._id, item));
    return lookup;
  }, [cart]);

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.qty,
        0
      ),
    [cart]
  );

  const tax = subtotal * 0.05;
  const discount = subtotal * 0.1;
  const grandTotal = subtotal + tax - discount;

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i._id === product._id);
      if (found) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, filteredProducts.length)
    );
  };

  const handleBack = () => {
    if (cart.length > 0 && !window.confirm("Discard current cart?")) {
      return;
    }
    navigate("/cashier/tables");
  };

  const sendToKitchen = async () => {
    if (cart.length === 0) {
      alert("Add items first");
      return;
    }

    try {
      setSending(true);
      await api.post("/api/orders", {
        tableId,
        items: cart.map((i) => ({
          productId: i._id,
          quantity: i.qty,
        })),
      });

      setCart([]);
      setIsCartOpen(false);
      loadExistingOrder();

      alert("Order sent to kitchen");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Order failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Tables</span>
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Table
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  Table {tableId}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {existingOrder && (
                <div className="hidden md:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <Clock className="h-4 w-4" />
                  Active order
                </div>
              )}
              <button
                onClick={() => navigate(`/cashier/billing/${tableId}`)}
                className="hidden md:inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Billing
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 md:hidden"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search menu items..."
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categoryOptions.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCat(cat._id)}
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 md:hidden">
          <button
            onClick={() => navigate(`/cashier/billing/${tableId}`)}
            className="rounded-md border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600"
          >
            Billing
          </button>
          {existingOrder && (
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <Clock className="h-4 w-4" />
              Active order
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <span className="text-xs text-slate-500">
                Showing {visibleProducts.length} of {filteredProducts.length}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No items found. Try a different search or category.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((product) => {
                    const inCart = cartLookup.get(product._id);
                    return (
                      <div
                        key={product._id}
                        className="flex flex-col rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div className="h-24 overflow-hidden rounded-md bg-slate-100 sm:h-28">
                          <img
                            src={product.image || "/no-image.png"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-2 flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="mt-1 text-xs text-slate-500 truncate">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">
                            ₹{product.price}
                          </span>
                          <button
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </button>
                        </div>
                        {inCart && (
                          <div className="mt-2 text-xs font-medium text-emerald-600">
                            In cart: {inCart.qty}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-4">
              {existingOrder && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <Clock className="h-4 w-4" />
                    Active Order
                  </div>
                  <div className="mt-3 space-y-2">
                    {existingOrder.items.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                          {item.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Current Order
                  </h3>
                  <span className="text-xs text-slate-500">
                    {cartItemCount} items
                  </span>
                </div>
                <div className="max-h-[360px] overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-500">
                      Your cart is empty.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item._id}
                          className="rounded-md border border-slate-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ₹{item.price} each
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-md border border-slate-200 px-1">
                              <button
                                onClick={() => changeQty(item._id, -1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => changeQty(item._id, 1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              ₹
                              {(
                                Number(item.price || 0) * item.qty
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-slate-200 p-4">
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                        <span>Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={sendToKitchen}
                        disabled={sending}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {sending ? "Sending..." : "Send to Kitchen"}
                      </button>
                      <button
                        onClick={() => navigate(`/cashier/billing/${tableId}`)}
                        className="w-full rounded-md border border-blue-600 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Billing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">
                Current Order
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Your cart is empty.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-md border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            ₹{item.price} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-md border border-slate-200 px-1">
                          <button
                            onClick={() => changeQty(item._id, -1)}
                            className="p-1 text-slate-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => changeQty(item._id, 1)}
                            className="p-1 text-slate-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          ₹{(Number(item.price || 0) * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200 p-4">
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={sendToKitchen}
                  disabled={sending}
                  className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Confirm Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;