import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../utils/axios";
import { ordersListFromResponse, orderTableId } from "../../../helpers/ordersResponse";
import { docId } from "../../../helpers/docId";
import { toast } from "react-toastify";

import CartSidebar from "./CartSidebar";
import MobileCartDrawer from "./MobileCartDrawer";
import OrderHeader from "./OrderHeader";
import ProductGrid from "./ProductGrid";
import SearchAndCategories from "./SearchAndCategories";
import { allLineItemsKitchenReady, kitchenLineStats } from "../../../helpers/orderKitchen";

const PAGE_SIZE = 24;
const ALL_CATEGORY = "all";

const OrderScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tableMeta = location.state && typeof location.state === "object" ? location.state : {};

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(ALL_CATEGORY);
  const [existingOrder, setExistingOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [sending, setSending] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadCategories = useCallback(async () => {
    const res = await api.get("/api/categories", { params: { limit: 100 } });
    setCategories(res.data?.categories || []);
  }, []);

  const loadProducts = useCallback(async () => {
    const res = await api.get("/api/products", { params: { limit: 200 } });
    setProducts(res.data?.products || []);
  }, []);

  const loadExistingOrder = useCallback(async () => {
    if (!tableId) return;
    try {
      const res = await api.get("/api/orders", { params: { tableId } });
      const list = ordersListFromResponse(res.data);

      const openOrder = list.find(
        (o) =>
          orderTableId(o) === String(tableId) &&
          o.orderStatus === "open"
      );

      setExistingOrder(openOrder || null);
    } catch {
      setExistingOrder(null);
    }
  }, [tableId]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  useEffect(() => {
    loadExistingOrder();
  }, [loadExistingOrder]);

  useEffect(() => {
    const id = setInterval(() => loadExistingOrder(), 7000);
    return () => clearInterval(id);
  }, [loadExistingOrder]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCat, search]);

  // ================= FILTER =================

  const categoryOptions = useMemo(
    () => [{ id: ALL_CATEGORY, name: "All" }, ...categories],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeCat !== ALL_CATEGORY) {
      list = list.filter(
        (p) => String(p.categoryId || p.category?._id || p.category) === String(activeCat)
      );
    }

    if (search.trim()) {
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    return list;
  }, [products, activeCat, search]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // ================= CART =================

  const cartLookup = useMemo(() => {
    const map = new Map();
    cart.forEach((item) => map.set(docId(item), item));
    return map;
  }, [cart]);

  const cartItemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const kitchenReady = allLineItemsKitchenReady(existingOrder);
  const kitchenStats = useMemo(
    () => kitchenLineStats(existingOrder),
    [existingOrder]
  );

  const subtotal = cart.reduce(
    (sum, i) => sum + Number(i.price) * i.qty,
    0
  );

  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;

  const addToCart = (product) => {
    const pid = docId(product);
    if (!pid) return;
    setCart((prev) => {
      const found = prev.find((i) => docId(i) === pid);

      if (found) {
        return prev.map((i) =>
          docId(i) === pid ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) =>
        docId(i) === String(id)
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => docId(i) !== String(id)));
  };

  const sendToKitchen = async () => {
    if (cart.length === 0) {
      toast.info("Add items to the cart first");
      return;
    }

    try {
      setSending(true);

      await api.post("/api/orders", {
        tableId,
        items: cart.map((i) => ({
          productId: docId(i),
          quantity: i.qty,
        })),
      });

      setCart([]);
      loadExistingOrder();
      toast.success("Order sent to kitchen");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not send order");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-indigo-50/45 to-violet-50/30">
      <OrderHeader
        tableMeta={tableMeta}
        existingOrder={existingOrder}
        kitchenReady={kitchenReady}
        kitchenStats={kitchenStats}
        cartItemCount={cartItemCount}
        onBack={() => navigate("/cashier/tables")}
        onBilling={() =>
          navigate(`/cashier/billing/${tableId}`)
        }
        onSendToKitchen={sendToKitchen}
        sending={sending}
        billingDisabled={!existingOrder}
      >
        <SearchAndCategories
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          categoryOptions={categoryOptions}
          activeCat={activeCat}
          onSelectCategory={setActiveCat}
        />
      </OrderHeader>

      <main className="grid w-full grid-cols-1 gap-3 px-0 pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:grid-cols-12 md:gap-4 md:pt-4 md:pb-4">
        <ProductGrid
          visibleProducts={visibleProducts}
          filteredProducts={filteredProducts}
          hasMore={hasMore}
          onLoadMore={() =>
            setVisibleCount((p) => p + PAGE_SIZE)
          }
          cartLookup={cartLookup}
          onAddToCart={addToCart}
          reserveMobileCart={cartItemCount > 0}
        />

        <CartSidebar
          existingOrder={existingOrder}
          kitchenReady={kitchenReady}
          kitchenStats={kitchenStats}
          cart={cart}
          cartItemCount={cartItemCount}
          onRemoveItem={removeItem}
          onChangeQty={changeQty}
          subtotal={subtotal}
          tax={tax}
          grandTotal={grandTotal}
          onSendToKitchen={sendToKitchen}
          sending={sending}
          onBilling={() => navigate(`/cashier/billing/${tableId}`)}
          billingDisabled={!existingOrder}
        />
      </main>

      {/* Mobile floating bar - compact, always tappable */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 md:hidden">
        <div className="mx-auto max-w-lg px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-0.5 pointer-events-auto">
          {cartItemCount > 0 ? (
            <div className="flex items-center gap-2 rounded-2xl border border-indigo-100/90 bg-white/95 px-3 py-2 shadow-lg shadow-indigo-950/12 ring-1 ring-indigo-950/[0.05]">
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-medium text-indigo-600/80">{cartItemCount} in cart</span>
                <span className="block text-sm font-semibold tabular-nums text-slate-900">₹{Number(grandTotal || 0).toFixed(0)}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white shadow-md shadow-indigo-600/35 hover:bg-indigo-700"
              >
                Cart
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isCartOpen && (
        <MobileCartDrawer
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onRemoveItem={removeItem}
          onChangeQty={changeQty}
          subtotal={subtotal}
          tax={tax}
          grandTotal={grandTotal}
          onSendToKitchen={sendToKitchen}
          sending={sending}
        />
      )}
    </div>
  );
};

export default OrderScreen;