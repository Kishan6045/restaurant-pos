import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { Plus, Minus, Trash2 } from "lucide-react";

const OrderScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(null);

  const [existingOrder, setExistingOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadExistingOrder();
  }, []);

  const loadCategories = async () => {
    const res = await api.get("/api/categories");
    const cats = res.data.categories || [];
    setCategories(cats);
    if (cats.length) setActiveCat(cats[0]._id);
  };

  const loadProducts = async () => {
    const res = await api.get("/api/products");
    setProducts(res.data.products || []);
  };

  const loadExistingOrder = async () => {
    const res = await api.get("/api/orders");
    const openOrder = res.data.find(
      (o) =>
        o.tableId?._id === tableId &&
        o.orderStatus === "open"
    );
    setExistingOrder(openOrder || null);
  };

  const filteredProducts = useMemo(() => {
    if (!activeCat) return [];
    return products.filter(
      (p) =>
        p.category?._id === activeCat ||
        p.category === activeCat
    );
  }, [products, activeCat]);

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i._id === product._id);
      if (found) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) =>
        i._id === id
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

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
    <>
      {/* 🔥 TOP BAR */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4 z-10">
        <button
          onClick={() => {
            if (cart.length > 0 && !window.confirm("Discard current cart?")) return;
            navigate("/cashier/tables");
          }}
          className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
        >
          ← Back to Tables
        </button>

        <div className="ml-4 font-bold">
          Table {tableId}
        </div>
      </div>

      {/* MAIN */}
      <div className="h-screen flex bg-gray-100 pt-12">

        {/* CATEGORIES */}
        <div className="w-44 bg-gray-900 text-white">
          {categories.map((c) => (
            <div
              key={c._id}
              onClick={() => setActiveCat(c._id)}
              className={`px-3 py-3 cursor-pointer border-b ${
                activeCat === c._id
                  ? "bg-orange-500 text-black font-bold"
                  : "hover:bg-gray-800"
              }`}
            >
              {c.name}
            </div>
          ))}
        </div>

        {/* PRODUCTS */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i._id === p._id);
              return (
                <div
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="bg-white p-2 border rounded flex gap-2 cursor-pointer"
                >
                  <img
                    src={p.image || "/no-image.png"}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-green-600">₹{p.price}</div>
                  </div>
                  {inCart && (
                    <div className="bg-green-600 text-white px-2 rounded">
                      {inCart.qty}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CART + EXISTING ORDER */}
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-3 font-bold border-b">
            Already Ordered
          </div>

          {existingOrder && (
            <div className="p-2 bg-yellow-50 border-b">
              {existingOrder.items.map((i) => (
                <div key={i._id} className="flex justify-between text-xs">
                  <span>{i.name} × {i.quantity}</span>
                  <span className="text-gray-500">{i.status}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto divide-y">
            {cart.map((i) => (
              <div key={i._id} className="p-2 flex justify-between">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs">
                    ₹{i.price} × {i.qty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(i._id, -1)}>
                    <Minus size={14} />
                  </button>
                  <span>{i.qty}</span>
                  <button onClick={() => changeQty(i._id, 1)}>
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeItem(i._id)}
                    className="text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-between font-bold mb-2">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              onClick={sendToKitchen}
              disabled={sending}
              className="w-full bg-green-600 text-white py-2 font-bold"
            >
              {sending ? "Sending..." : "SEND TO KITCHEN"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderScreen;
