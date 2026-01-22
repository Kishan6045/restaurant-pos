import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import api from "../../../utils/axios";
import useAutoRefresh from "../../../utils/useAutoRefresh";

// Components
import CartSidebar from "./CartSidebar";
import MobileCartDrawer from "./MobileCartDrawer";
import OrderHeader from "./OrderHeader";
import ProductGrid from "./ProductGrid";
import SearchAndCategories from "./SearchAndCategories";

const PAGE_SIZE = 24; // Pagination size
const ORDER_REFRESH_MS = 5000;
const MENU_REFRESH_MS = 15000;

const ALL_CATEGORY = "all"; // Special value for all categories

const OrderScreen = () => {
  const { tableId } = useParams();  // Get tableId from URL
  const navigate = useNavigate();  // For navigation
  const [categories, setCategories] = useState([]);  // Categories list
  const [products, setProducts] = useState([]);  // Products list
  const [activeCat, setActiveCat] = useState(ALL_CATEGORY);  // Active selected category
  const [existingOrder, setExistingOrder] = useState(null);  // Existing open order for this table
  const [cart, setCart] = useState([]);  // Cart items
  const [sending, setSending] = useState(false);  // Sending order to kitchen loading state
  const [isCartOpen, setIsCartOpen] = useState(false);  // Mobile cart drawer open/close
  const [search, setSearch] = useState("");  // Search input text
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);  // How many products to show (pagination)


  // Load initial data on page load
  useEffect(() => {
    loadCategories();
    loadProducts();
    loadExistingOrder();
  }, []);

  useAutoRefresh(loadExistingOrder, ORDER_REFRESH_MS, { runOnMount: false });
  useAutoRefresh(loadCategories, MENU_REFRESH_MS, { runOnMount: false });
  useAutoRefresh(loadProducts, MENU_REFRESH_MS, { runOnMount: false });

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCat, search]);

  // Fetch categories from API
  const loadCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      const cats = res.data.categories || [];
      setCategories(cats);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Fetch products from API
  const loadProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Fetch existing open order for this table
  const loadExistingOrder = async () => {
    try {
      const res = await api.get("/api/orders");

      // Find open order for current table
      const openOrder = (res.data || []).find(
        (o) =>
          o.tableId?._id === tableId &&
          o.orderStatus !== "completed"
      );

      setExistingOrder(openOrder || null);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Prepare category list with "All" option
  const categoryOptions = useMemo(
    () => [{ _id: ALL_CATEGORY, name: "All" }, ...categories],
    [categories]
  );

  // Normalize search text
  const normalizedSearch = useMemo(
    () => search.trim().toLowerCase(),
    [search]
  );

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let list = products;

    // Category filter
    if (activeCat && activeCat !== ALL_CATEGORY) {
      list = list.filter(
        (p) => p.category?._id === activeCat || p.category === activeCat
      );
    }

    // Search filter
    if (normalizedSearch) {
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(normalizedSearch)
      );
    }

    return list;
  }, [products, activeCat, normalizedSearch]);

  // Visible products for pagination
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  // Check if more products are available
  const hasMore = visibleCount < filteredProducts.length;

  // Create lookup map for cart items
  const cartLookup = useMemo(() => {
    const lookup = new Map();
    cart.forEach((item) => lookup.set(item._id, item));
    return lookup;
  }, [cart]);

  // Total cart item count
  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  // Calculate subtotal
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.qty,
        0
      ),
    [cart]
  );

  // Tax and discount calculations
  const tax = subtotal * 0.05;
  // const discount = subtotal * 0.1;
  const grandTotal = subtotal + tax; //- discount

  // Add product to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i._id === product._id);

      // If already in cart, increase quantity
      if (found) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      // Else add new product
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Increase or decrease quantity
  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  // Load more products
  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, filteredProducts.length)
    );
  };

  // Back to tables page
  const handleBack = () => {
    if (cart.length > 0 && !window.confirm("Discard current cart?")) {
      return;
    }
    navigate("/cashier/tables");
  };

  // Go to billing page
  const handleBilling = () => {
    navigate(`/cashier/billing/${tableId}`);
  };

  // Send order to kitchen
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

      // Reset cart and reload existing order
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
      {/* Header */}
      <OrderHeader
        tableId={tableId}
        existingOrder={existingOrder}
        cartItemCount={cartItemCount}
        onBack={handleBack}
        onBilling={handleBilling}
        onOpenCart={() => setIsCartOpen(true)}
      >
        {/* Search and category filter */}
        <SearchAndCategories
          search={search}
          onSearchChange={(event) => setSearch(event.target.value)}
          categoryOptions={categoryOptions}
          activeCat={activeCat}
          onSelectCategory={setActiveCat}
        />
      </OrderHeader>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-4">
        {/* Mobile actions */}
        <div className="mb-4 flex flex-wrap items-center gap-2 md:hidden">
          <button onClick={handleBilling}>Billing</button>

          {existingOrder && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active order
            </div>
          )}
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Product list */}
          <ProductGrid
            visibleProducts={visibleProducts}
            filteredProducts={filteredProducts}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            cartLookup={cartLookup}
            onAddToCart={addToCart}
          />

          {/* Desktop cart */}
          <CartSidebar
            existingOrder={existingOrder}
            cart={cart}
            cartItemCount={cartItemCount}
            onRemoveItem={removeItem}
            onChangeQty={changeQty}
            subtotal={subtotal}
            tax={tax}
            // discount={discount}
            grandTotal={grandTotal}
            onSendToKitchen={sendToKitchen}
            sending={sending}
            onBilling={handleBilling}
          />
        </div>
      </main>

      {/* Mobile cart drawer */}
      {isCartOpen && (
        <MobileCartDrawer
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onRemoveItem={removeItem}
          onChangeQty={changeQty}
          subtotal={subtotal}
          tax={tax}
          // discount={discount}
          grandTotal={grandTotal}
          onSendToKitchen={sendToKitchen}
          sending={sending}
        />
      )}
    </div>
  );
};

export default OrderScreen;
