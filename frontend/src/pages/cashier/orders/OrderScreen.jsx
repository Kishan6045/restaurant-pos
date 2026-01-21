import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import api from "../../../utils/axios";
import CartSidebar from "./CartSidebar";
import MobileCartDrawer from "./MobileCartDrawer";
import OrderHeader from "./OrderHeader";
import ProductGrid from "./ProductGrid";
import SearchAndCategories from "./SearchAndCategories";

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

  const handleBilling = () => {
    navigate(`/cashier/billing/${tableId}`);
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
      <OrderHeader
        tableId={tableId}
        existingOrder={existingOrder}
        cartItemCount={cartItemCount}
        onBack={handleBack}
        onBilling={handleBilling}
        onOpenCart={() => setIsCartOpen(true)}
      >
        <SearchAndCategories
          search={search}
          onSearchChange={(event) => setSearch(event.target.value)}
          categoryOptions={categoryOptions}
          activeCat={activeCat}
          onSelectCategory={setActiveCat}
        />
      </OrderHeader>

      <main className="mx-auto w-full max-w-7xl px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 md:hidden">
          <button
            onClick={handleBilling}
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
          <ProductGrid
            visibleProducts={visibleProducts}
            filteredProducts={filteredProducts}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            cartLookup={cartLookup}
            onAddToCart={addToCart}
          />

          <CartSidebar
            existingOrder={existingOrder}
            cart={cart}
            cartItemCount={cartItemCount}
            onRemoveItem={removeItem}
            onChangeQty={changeQty}
            subtotal={subtotal}
            tax={tax}
            discount={discount}
            grandTotal={grandTotal}
            onSendToKitchen={sendToKitchen}
            sending={sending}
            onBilling={handleBilling}
          />
        </div>
      </main>

      {isCartOpen && (
        <MobileCartDrawer
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onRemoveItem={removeItem}
          onChangeQty={changeQty}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          grandTotal={grandTotal}
          onSendToKitchen={sendToKitchen}
          sending={sending}
        />
      )}
    </div>
  );
};

export default OrderScreen;
