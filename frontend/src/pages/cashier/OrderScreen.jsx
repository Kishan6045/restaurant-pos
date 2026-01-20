// // // import { useEffect, useState, useMemo } from "react";
// // // import { useParams, useNavigate } from "react-router-dom";
// // // import api from "../../utils/axios";
// // // import { Plus, Minus, Trash2 } from "lucide-react";

// // // const OrderScreen = () => {
// // //   const { tableId } = useParams();
// // //   const navigate = useNavigate();

// // //   const [categories, setCategories] = useState([]);
// // //   const [products, setProducts] = useState([]);
// // //   const [activeCat, setActiveCat] = useState(null);

// // //   const [existingOrder, setExistingOrder] = useState(null);
// // //   const [cart, setCart] = useState([]);
// // //   const [sending, setSending] = useState(false);

// // //   useEffect(() => {
// // //     loadCategories();
// // //     loadProducts();
// // //     loadExistingOrder();
// // //   }, []);

// // //   const loadCategories = async () => {
// // //     const res = await api.get("/api/categories");
// // //     const cats = res.data.categories || [];
// // //     setCategories(cats);
// // //     if (cats.length) setActiveCat(cats[0]._id);
// // //   };

// // //   const loadProducts = async () => {
// // //     const res = await api.get("/api/products");
// // //     setProducts(res.data.products || []);
// // //   };

// // //   const loadExistingOrder = async () => {
// // //     const res = await api.get("/api/orders");
// // //     const openOrder = res.data.find(
// // //       (o) =>
// // //         o.tableId?._id === tableId &&
// // //         o.orderStatus === "open"
// // //     );
// // //     setExistingOrder(openOrder || null);
// // //   };

// // //   const filteredProducts = useMemo(() => {
// // //     if (!activeCat) return [];
// // //     return products.filter(
// // //       (p) =>
// // //         p.category?._id === activeCat ||
// // //         p.category === activeCat
// // //     );
// // //   }, [products, activeCat]);

// // //   const addToCart = (product) => {
// // //     setCart((prev) => {
// // //       const found = prev.find((i) => i._id === product._id);
// // //       if (found) {
// // //         return prev.map((i) =>
// // //           i._id === product._id
// // //             ? { ...i, qty: i.qty + 1 }
// // //             : i
// // //         );
// // //       }
// // //       return [...prev, { ...product, qty: 1 }];
// // //     });
// // //   };

// // //   const changeQty = (id, delta) => {
// // //     setCart((prev) =>
// // //       prev.map((i) =>
// // //         i._id === id
// // //           ? { ...i, qty: Math.max(1, i.qty + delta) }
// // //           : i
// // //       )
// // //     );
// // //   };

// // //   const removeItem = (id) => {
// // //     setCart((prev) => prev.filter((i) => i._id !== id));
// // //   };

// // //   const total = cart.reduce(
// // //     (sum, i) => sum + i.price * i.qty,
// // //     0
// // //   );

// // //   const sendToKitchen = async () => {
// // //     if (cart.length === 0) {
// // //       alert("Add items first");
// // //       return;
// // //     }

// // //     try {
// // //       setSending(true);
// // //       await api.post("/api/orders", {
// // //         tableId,
// // //         items: cart.map((i) => ({
// // //           productId: i._id,
// // //           quantity: i.qty,
// // //         })),
// // //       });

// // //       setCart([]);
// // //       loadExistingOrder();

// // //       alert("Order sent to kitchen");
// // //     } catch (err) {
// // //       console.error(err.response?.data || err.message);
// // //       alert("Order failed");
// // //     } finally {
// // //       setSending(false);
// // //     }
// // //   };

// // //   return (
// // //     <>
// // //       {/* 🔥 TOP BAR */}
// // //       <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4 z-10">
// // //         <button
// // //           onClick={() => {
// // //             if (cart.length > 0 && !window.confirm("Discard current cart?")) return;
// // //             navigate("/cashier/tables");
// // //           }}
// // //           className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
// // //         >
// // //           ← Back to Tables
// // //         </button>

// // //         <div className="ml-4 font-bold">
// // //           Table {tableId}
// // //         </div>
// // //       </div>

// // //       {/* MAIN */}
// // //       <div className="h-screen flex bg-gray-100 pt-12">

// // //         {/* CATEGORIES */}
// // //         <div className="w-44 bg-gray-900 text-white">
// // //           {categories.map((c) => (
// // //             <div
// // //               key={c._id}
// // //               onClick={() => setActiveCat(c._id)}
// // //               className={`px-3 py-3 cursor-pointer border-b ${
// // //                 activeCat === c._id
// // //                   ? "bg-orange-500 text-black font-bold"
// // //                   : "hover:bg-gray-800"
// // //               }`}
// // //             >
// // //               {c.name}
// // //             </div>
// // //           ))}
// // //         </div>

// // //         {/* PRODUCTS */}
// // //         <div className="flex-1 p-3 overflow-y-auto">
// // //           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
// // //             {filteredProducts.map((p) => {
// // //               const inCart = cart.find((i) => i._id === p._id);
// // //               return (
// // //                 <div
// // //                   key={p._id}
// // //                   onClick={() => addToCart(p)}
// // //                   className="bg-white p-2 border rounded flex gap-2 cursor-pointer"
// // //                 >
// // //                   <img
// // //                     src={p.image || "/no-image.png"}
// // //                     className="w-12 h-12 object-cover rounded"
// // //                   />
// // //                   <div className="flex-1">
// // //                     <div className="text-sm font-bold">{p.name}</div>
// // //                     <div className="text-green-600">₹{p.price}</div>
// // //                   </div>
// // //                   {inCart && (
// // //                     <div className="bg-green-600 text-white px-2 rounded">
// // //                       {inCart.qty}
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         </div>

// // //         {/* CART + EXISTING ORDER */}
// // //         <div className="w-80 bg-white border-l flex flex-col">
// // //           <div className="p-3 font-bold border-b">
// // //             Already Ordered
// // //           </div>

// // //           {existingOrder && (
// // //             <div className="p-2 bg-yellow-50 border-b">
// // //               {existingOrder.items.map((i) => (
// // //                 <div key={i._id} className="flex justify-between text-xs">
// // //                   <span>{i.name} × {i.quantity}</span>
// // //                   <span className="text-gray-500">{i.status}</span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           )}

// // //           <div className="flex-1 overflow-y-auto divide-y">
// // //             {cart.map((i) => (
// // //               <div key={i._id} className="p-2 flex justify-between">
// // //                 <div>
// // //                   <div className="font-medium">{i.name}</div>
// // //                   <div className="text-xs">
// // //                     ₹{i.price} × {i.qty}
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex items-center gap-2">
// // //                   <button onClick={() => changeQty(i._id, -1)}>
// // //                     <Minus size={14} />
// // //                   </button>
// // //                   <span>{i.qty}</span>
// // //                   <button onClick={() => changeQty(i._id, 1)}>
// // //                     <Plus size={14} />
// // //                   </button>
// // //                   <button
// // //                     onClick={() => removeItem(i._id)}
// // //                     className="text-red-500"
// // //                   >
// // //                     <Trash2 size={14} />
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           <div className="p-4 border-t">
// // //             <div className="flex justify-between font-bold mb-2">
// // //               <span>Total</span>
// // //               <span>₹{total}</span>
// // //             </div>
// // //             <button
// // //               onClick={sendToKitchen}
// // //               disabled={sending}
// // //               className="w-full bg-green-600 text-white py-2 font-bold"
// // //             >
// // //               {sending ? "Sending..." : "SEND TO KITCHEN"}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // };

// // // export default OrderScreen;




// // // ======================= IMPORTS =======================

// // // React hooks: state, lifecycle & memoization
// // import { useEffect, useState, useMemo } from "react";

// // // Router hooks: URL se tableId lena & page navigation
// // import { useParams, useNavigate } from "react-router-dom";

// // // Axios instance (token + baseURL configured)
// // import api from "../../utils/axios";

// // // Icons (UI actions)
// // import { Plus, Minus, Trash2 } from "lucide-react";

// // // ======================= COMPONENT =======================

// // const OrderScreen = () => {

// //   // URL se tableId milta hai (/cashier/table/:tableId)
// //   const { tableId } = useParams();

// //   // Page navigation ke liye
// //   const navigate = useNavigate();

// //   // ======================= STATES =======================

// //   // Saari categories (Veg, Non-Veg, Drinks etc.)
// //   const [categories, setCategories] = useState([]);

// //   // Saare products
// //   const [products, setProducts] = useState([]);

// //   // Currently selected category ID
// //   const [activeCat, setActiveCat] = useState(null);

// //   // Agar pehle se order open hai to wo
// //   const [existingOrder, setExistingOrder] = useState(null);

// //   // Current cart (new items jo cashier add karega)
// //   const [cart, setCart] = useState([]);

// //   // Order send ho raha hai ya nahi (button disable)
// //   const [sending, setSending] = useState(false);

// //   // ======================= INITIAL LOAD =======================

// //   // Component mount hote hi data load
// //   useEffect(() => {
// //     loadCategories();
// //     loadProducts();
// //     loadExistingOrder();
// //   }, []);

// //   // ======================= API CALLS =======================

// //   // 🔹 Categories load
// //   const loadCategories = async () => {
// //     const res = await api.get("/api/categories");

// //     const cats = res.data.categories || [];
// //     setCategories(cats);

// //     // First category ko default active banana
// //     if (cats.length) setActiveCat(cats[0]._id);
// //   };

// //   // 🔹 Products load
// //   const loadProducts = async () => {
// //     const res = await api.get("/api/products");
// //     setProducts(res.data.products || []);
// //   };

// //   // 🔹 Existing OPEN order check (same table)
// //   const loadExistingOrder = async () => {
// //     const res = await api.get("/api/orders");

// //     // Us table ka open order dhundhna
// //     const openOrder = res.data.find(
// //       (o) =>
// //         o.tableId?._id === tableId &&
// //         o.orderStatus === "open"
// //     );

// //     setExistingOrder(openOrder || null);
// //   };

// //   // ======================= FILTER PRODUCTS =======================

// //   // Sirf active category ke products dikhane ke liye
// //   const filteredProducts = useMemo(() => {
// //     if (!activeCat) return [];

// //     return products.filter(
// //       (p) =>
// //         // Kabhi populated object hota hai, kabhi sirf ID
// //         p.category?._id === activeCat ||
// //         p.category === activeCat
// //     );
// //   }, [products, activeCat]);

// //   // ======================= CART FUNCTIONS =======================

// //   // ➕ Product cart me add karna
// //   const addToCart = (product) => {
// //     setCart((prev) => {

// //       // Agar product pehle se cart me hai
// //       const found = prev.find((i) => i._id === product._id);

// //       if (found) {
// //         // Quantity +1
// //         return prev.map((i) =>
// //           i._id === product._id
// //             ? { ...i, qty: i.qty + 1 }
// //             : i
// //         );
// //       }

// //       // Naya product add
// //       return [...prev, { ...product, qty: 1 }];
// //     });
// //   };

// //   // ➕ / ➖ Quantity change
// //   const changeQty = (id, delta) => {
// //     setCart((prev) =>
// //       prev.map((i) =>
// //         i._id === id
// //           ? { ...i, qty: Math.max(1, i.qty + delta) }
// //           : i
// //       )
// //     );
// //   };

// //   // ❌ Item remove from cart
// //   const removeItem = (id) => {
// //     setCart((prev) => prev.filter((i) => i._id !== id));
// //   };

// //   // ======================= TOTAL AMOUNT =======================

// //   // Cart ka total amount
// //   const total = cart.reduce(
// //     (sum, i) => sum + i.price * i.qty,
// //     0
// //   );

// //   // ======================= SEND ORDER =======================

// //   const sendToKitchen = async () => {

// //     // Cart empty guard
// //     if (cart.length === 0) {
// //       alert("Add items first");
// //       return;
// //     }

// //     try {
// //       setSending(true);

// //       // Backend ko order bhejna
// //       await api.post("/api/orders", {
// //         tableId,
// //         items: cart.map((i) => ({
// //           productId: i._id,
// //           quantity: i.qty,
// //         })),
// //       });

// //       // Cart reset
// //       setCart([]);

// //       // Updated existing order reload
// //       loadExistingOrder();

// //       alert("Order sent to kitchen");
// //     } catch (err) {
// //       console.error(err.response?.data || err.message);
// //       alert("Order failed");
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   // ======================= UI =======================

// //   return (
// //     <>
// //       {/* ================= TOP BAR ================= */}
// //       <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4 z-10">

// //         {/* Back button */}
// //         <button
// //           onClick={() => {
// //             // Agar cart me items ho aur user confirm na kare
// //             if (cart.length > 0 && !window.confirm("Discard current cart?")) return;

// //             navigate("/cashier/tables");
// //           }}
// //           className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
// //         >
// //           ← Back to Tables
// //         </button>

// //         {/* Table info */}
// //         <div className="ml-4 font-bold">
// //           Table {tableId}
// //         </div>
// //       </div>

// //       {/* ================= MAIN LAYOUT ================= */}
// //       <div className="h-screen flex bg-gray-100 pt-12">

// //         {/* ===== LEFT: CATEGORIES ===== */}
// //         <div className="w-44 bg-gray-900 text-white">
// //           {categories.map((c) => (
// //             <div
// //               key={c._id}
// //               onClick={() => setActiveCat(c._id)}
// //               className={`px-3 py-3 cursor-pointer border-b ${activeCat === c._id
// //                   ? "bg-orange-500 text-black font-bold"
// //                   : "hover:bg-gray-800"
// //                 }`}
// //             >
// //               {c.name}
// //             </div>
// //           ))}
// //         </div>

// //         {/* ===== CENTER: PRODUCTS ===== */}
// //         <div className="flex-1 p-3 overflow-y-auto">
// //           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">

// //             {filteredProducts.map((p) => {
// //               const inCart = cart.find((i) => i._id === p._id);

// //               return (
// //                 <div
// //                   key={p._id}
// //                   onClick={() => addToCart(p)}
// //                   className="bg-white p-2 border rounded flex gap-2 cursor-pointer"
// //                 >
// //                   {/* Product image with fallback */}
// //                   <img
// //                     src={p.image || "/no-image.png"}
// //                     className="w-12 h-12 object-cover rounded"
// //                   />

// //                   <div className="flex-1">
// //                     <div className="text-sm font-bold">{p.name}</div>
// //                     <div className="text-green-600">₹{p.price}</div>
// //                   </div>

// //                   {/* Quantity badge */}
// //                   {inCart && (
// //                     <div className="bg-green-600 text-white px-2 rounded">
// //                       {inCart.qty}
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>

// //         {/* ===== RIGHT: CART + EXISTING ORDER ===== */}
// //         <div className="w-80 bg-white border-l flex flex-col">

// //           {/* Existing order header */}
// //           <div className="p-3 font-bold border-b">
// //             Already Ordered
// //           </div>

// //           {/* Existing order items */}
// //           {existingOrder && (
// //             <div className="p-2 bg-yellow-50 border-b">
// //               {existingOrder.items.map((i) => (
// //                 <div key={i._id} className="flex justify-between text-xs">
// //                   <span>{i.name} × {i.quantity}</span>
// //                   <span className="text-gray-500">{i.status}</span>
// //                 </div>
// //               ))}
// //             </div>
// //           )}

// //           {/* Cart items */}
// //           <div className="flex-1 overflow-y-auto divide-y">
// //             {cart.map((i) => (
// //               <div key={i._id} className="p-2 flex justify-between">
// //                 <div>
// //                   <div className="font-medium">{i.name}</div>
// //                   <div className="text-xs">
// //                     ₹{i.price} × {i.qty}
// //                   </div>
// //                 </div>

// //                 <div className="flex items-center gap-2">
// //                   <button onClick={() => changeQty(i._id, -1)}>
// //                     <Minus size={14} />
// //                   </button>

// //                   <span>{i.qty}</span>

// //                   <button onClick={() => changeQty(i._id, 1)}>
// //                     <Plus size={14} />
// //                   </button>

// //                   <button
// //                     onClick={() => removeItem(i._id)}
// //                     className="text-red-500"
// //                   >
// //                     <Trash2 size={14} />
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Total + Send */}
// //           <div className="p-4 border-t">
// //             <div className="flex justify-between font-bold mb-2">
// //               <span>Total</span>
// //               <span>₹{total}</span>
// //             </div>

// //             <button
// //               onClick={sendToKitchen}
// //               disabled={sending}
// //               className="w-full bg-green-600 text-white py-2 font-bold"
// //             >
// //               {sending ? "Sending..." : "SEND TO KITCHEN"}
// //             </button>
// //             <button
// //   onClick={() => navigate(`/cashier/billing/${tableId}`)}
// //   className="w-full mt-2 bg-blue-600 text-white py-2 font-bold"
// // >
// //   GO TO BILLING
// // </button>

// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default OrderScreen;




// import { useEffect, useState, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../utils/axios";
// import { Plus, Minus, Trash2, ChevronLeft, ShoppingBag, Clock, CheckCircle, X } from "lucide-react";

// const OrderScreen = () => {
//   const { tableId } = useParams();
//   const navigate = useNavigate();

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [activeCat, setActiveCat] = useState(null);
//   const [existingOrder, setExistingOrder] = useState(null);
//   const [cart, setCart] = useState([]);
//   const [sending, setSending] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);

//   useEffect(() => {
//     loadCategories();
//     loadProducts();
//     loadExistingOrder();
//   }, []);

//   const loadCategories = async () => {
//     const res = await api.get("/api/categories");
//     const cats = res.data.categories || [];
//     setCategories(cats);
//     if (cats.length) setActiveCat(cats[0]._id);
//   };

//   const loadProducts = async () => {
//     const res = await api.get("/api/products");
//     setProducts(res.data.products || []);
//   };

//   const loadExistingOrder = async () => {
//     const res = await api.get("/api/orders");
//     const openOrder = res.data.find(
//       (o) =>
//         o.tableId?._id === tableId &&
//         o.orderStatus === "open"
//     );
//     setExistingOrder(openOrder || null);
//   };

//   const filteredProducts = useMemo(() => {
//     if (!activeCat) return [];
//     return products.filter(
//       (p) =>
//         p.category?._id === activeCat ||
//         p.category === activeCat
//     );
//   }, [products, activeCat]);

//   const addToCart = (product) => {
//     setCart((prev) => {
//       const found = prev.find((i) => i._id === product._id);
//       if (found) {
//         return prev.map((i) =>
//           i._id === product._id
//             ? { ...i, qty: i.qty + 1 }
//             : i
//         );
//       }
//       return [...prev, { ...product, qty: 1 }];
//     });
//   };

//   const changeQty = (id, delta) => {
//     setCart((prev) =>
//       prev.map((i) =>
//         i._id === id
//           ? { ...i, qty: Math.max(1, i.qty + delta) }
//           : i
//       )
//     );
//   };

//   const removeItem = (id) => {
//     setCart((prev) => prev.filter((i) => i._id !== id));
//   };

//   const total = cart.reduce(
//     (sum, i) => sum + i.price * i.qty,
//     0
//   );

//   const sendToKitchen = async () => {
//     if (cart.length === 0) {
//       alert("Add items first");
//       return;
//     }

//     try {
//       setSending(true);
//       await api.post("/api/orders", {
//         tableId,
//         items: cart.map((i) => ({
//           productId: i._id,
//           quantity: i.qty,
//         })),
//       });

//       setCart([]);
//       setIsCartOpen(false);
//       loadExistingOrder();

//       alert("Order sent to kitchen");
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       alert("Order failed");
//     } finally {
//       setSending(false);
//     }
//   };

//   // Calculate cart item count
//   const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
//         <div className="container mx-auto px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => {
//                   if (cart.length > 0 && !window.confirm("Discard current cart?")) return;
//                   navigate("/cashier/tables");
//                 }}
//                 className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//                 <span className="hidden sm:inline">Tables</span>
//               </button>
              
//               <div className="flex items-center space-x-3">
//                 <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
//                 <div>
//                   <h1 className="text-xl font-bold text-gray-800">Table {tableId}</h1>
//                   <p className="text-sm text-gray-500">Restaurant Order System</p>
//                 </div>
//               </div>
//             </div>

//             {/* Cart Button for Mobile */}
//             <button
//               onClick={() => setIsCartOpen(true)}
//               className="relative p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all lg:hidden"
//             >
//               <ShoppingBag className="w-6 h-6" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </button>

//             {/* Desktop Order Status */}
//             <div className="hidden lg:flex items-center space-x-4">
//               {existingOrder && (
//                 <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <Clock className="w-4 h-4 text-yellow-600" />
//                   <span className="text-sm font-medium text-yellow-700">
//                     Order in Progress
//                   </span>
//                 </div>
//               )}
//               <button
//                 onClick={() => navigate(`/cashier/billing/${tableId}`)}
//                 className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105"
//               >
//                 Billing
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           {/* Left Column - Categories & Products */}
//           <div className="lg:col-span-8 space-y-6">
//             {/* Categories Tabs */}
//             <div className="bg-white rounded-2xl shadow-lg p-4">
//               <div className="flex flex-wrap gap-2">
//                 {categories.map((c) => (
//                   <button
//                     key={c._id}
//                     onClick={() => setActiveCat(c._id)}
//                     className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
//                       activeCat === c._id
//                         ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
//                     }`}
//                   >
//                     {c.name}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Products Grid */}
//             <div className="bg-white rounded-2xl shadow-lg p-6">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                 Menu Items
//                 <span className="ml-2 text-sm font-normal text-gray-500">
//                   ({filteredProducts.length} items)
//                 </span>
//               </h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {filteredProducts.map((p) => {
//                   const inCart = cart.find((i) => i._id === p._id);
//                   return (
//                     <div
//                       key={p._id}
//                       onClick={() => addToCart(p)}
//                       className="group relative bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
//                     >
//                       {/* Product Image */}
//                       <div className="relative h-40 mb-4 rounded-xl overflow-hidden">
//                         <img
//                           src={p.image || "/no-image.png"}
//                           alt={p.name}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
//                         {inCart && (
//                           <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
//                             {inCart.qty} in cart
//                           </div>
//                         )}
//                       </div>

//                       {/* Product Info */}
//                       <div>
//                         <h3 className="font-bold text-gray-800 mb-1 truncate">{p.name}</h3>
//                         <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
//                           {p.description || "Delicious item"}
//                         </p>
//                         <div className="flex items-center justify-between">
//                           <span className="text-xl font-bold text-orange-600">
//                             ₹{p.price}
//                           </span>
//                           <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105">
//                             Add +
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Cart & Existing Orders (Desktop) */}
//           <div className="lg:col-span-4 hidden lg:block space-y-6">
//             {/* Existing Order Panel */}
//             {existingOrder && (
//               <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl shadow-lg p-6">
//                 <div className="flex items-center space-x-3 mb-4">
//                   <div className="p-2 bg-yellow-100 rounded-lg">
//                     <Clock className="w-6 h-6 text-yellow-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-gray-800">Active Order</h3>
//                     <p className="text-sm text-gray-600">Preparing in kitchen</p>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   {existingOrder.items.map((i, index) => (
//                     <div
//                       key={i._id || index}
//                       className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-yellow-100"
//                     >
//                       <div>
//                         <div className="font-medium text-gray-800">{i.name}</div>
//                         <div className="text-sm text-gray-500">Qty: {i.quantity}</div>
//                       </div>
//                       <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         i.status === 'preparing' 
//                           ? 'bg-blue-100 text-blue-800' 
//                           : i.status === 'ready'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {i.status || 'pending'}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Cart Panel */}
//             <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//               <div className="p-6 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-xl font-bold text-gray-800">Current Order</h3>
//                   <div className="flex items-center space-x-2">
//                     <ShoppingBag className="w-5 h-5 text-gray-500" />
//                     <span className="text-sm font-medium text-gray-700">
//                       {cartItemCount} items
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Cart Items */}
//               <div className="p-4 max-h-[400px] overflow-y-auto">
//                 {cart.length === 0 ? (
//                   <div className="text-center py-12">
//                     <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-500">Your cart is empty</p>
//                     <p className="text-sm text-gray-400 mt-2">
//                       Add items from the menu
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {cart.map((i) => (
//                       <div
//                         key={i._id}
//                         className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex-1">
//                             <h4 className="font-semibold text-gray-800">{i.name}</h4>
//                             <p className="text-sm text-gray-600">₹{i.price} each</p>
//                           </div>
//                           <div className="flex items-center space-x-3">
//                             <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   changeQty(i._id, -1);
//                                 }}
//                                 className="text-gray-600 hover:text-gray-900 p-1"
//                               >
//                                 <Minus className="w-4 h-4" />
//                               </button>
//                               <span className="font-bold text-gray-800 w-6 text-center">
//                                 {i.qty}
//                               </span>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   changeQty(i._id, 1);
//                                 }}
//                                 className="text-gray-600 hover:text-gray-900 p-1"
//                               >
//                                 <Plus className="w-4 h-4" />
//                               </button>
//                             </div>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 removeItem(i._id);
//                               }}
//                               className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between text-sm">
//                           <span className="text-gray-500">
//                             Total: <span className="font-bold text-gray-800">₹{i.price * i.qty}</span>
//                           </span>
//                           {i.qty > 1 && (
//                             <span className="text-green-600 font-medium">
//                               Saving: ₹{Math.round((i.price * i.qty * 0.1))}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Cart Summary */}
//               {cart.length > 0 && (
//                 <div className="border-t border-gray-200 p-6">
//                   <div className="space-y-3 mb-6">
//                     <div className="flex justify-between text-gray-600">
//                       <span>Subtotal</span>
//                       <span>₹{total}</span>
//                     </div>
//                     <div className="flex justify-between text-gray-600">
//                       <span>Tax (5%)</span>
//                       <span>₹{(total * 0.05).toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between text-green-600">
//                       <span>Discount</span>
//                       <span>-₹{(total * 0.1).toFixed(2)}</span>
//                     </div>
//                     <div className="border-t pt-3">
//                       <div className="flex justify-between text-lg font-bold text-gray-800">
//                         <span>Total Amount</span>
//                         <span>₹{(total * 0.95).toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <button
//                       onClick={sendToKitchen}
//                       disabled={sending}
//                       className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {sending ? (
//                         <span className="flex items-center justify-center">
//                           <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                           </svg>
//                           Sending to Kitchen...
//                         </span>
//                       ) : (
//                         <span className="flex items-center justify-center">
//                           <CheckCircle className="w-5 h-5 mr-2" />
//                           Send to Kitchen
//                         </span>
//                       )}
//                     </button>
                    
//                     <button
//                       onClick={() => navigate(`/cashier/billing/${tableId}`)}
//                       className="w-full border-2 border-blue-500 text-blue-600 font-bold py-4 rounded-xl hover:bg-blue-50 transition-colors"
//                     >
//                       Go to Billing
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Mobile Cart Modal */}
//       {isCartOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           {/* Backdrop */}
//           <div 
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={() => setIsCartOpen(false)}
//           />
          
//           {/* Cart Drawer */}
//           <div className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slideUp">
//             {/* Header */}
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-2xl font-bold text-gray-800">Your Order</h3>
//                 <button
//                   onClick={() => setIsCartOpen(false)}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
              
//               {/* Mobile Status */}
//               {existingOrder && (
//                 <div className="flex items-center space-x-2 px-4 py-3 bg-yellow-50 rounded-xl">
//                   <Clock className="w-5 h-5 text-yellow-600" />
//                   <span className="text-sm font-medium text-yellow-700">
//                     Active order in progress
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Cart Items */}
//             <div className="p-4 h-[calc(85vh-200px)] overflow-y-auto">
//               {cart.length === 0 ? (
//                 <div className="text-center py-12">
//                   <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">Your cart is empty</p>
//                   <p className="text-gray-400 mt-2">Select items to begin order</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {cart.map((i) => (
//                     <div
//                       key={i._id}
//                       className="bg-gray-50 rounded-xl p-4 border border-gray-200"
//                     >
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <h4 className="font-bold text-gray-800">{i.name}</h4>
//                           <p className="text-gray-600">₹{i.price} each</p>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <div className="flex items-center space-x-3 bg-white rounded-lg px-3 py-1 border">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 changeQty(i._id, -1);
//                               }}
//                               className="text-gray-600 p-1"
//                             >
//                               <Minus className="w-4 h-4" />
//                             </button>
//                             <span className="font-bold text-gray-800 w-6 text-center">
//                               {i.qty}
//                             </span>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 changeQty(i._id, 1);
//                               }}
//                               className="text-gray-600 p-1"
//                             >
//                               <Plus className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <button
//                             onClick={() => removeItem(i._id)}
//                             className="text-red-500 p-2"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">
//                           Total: <span className="font-bold text-gray-800">₹{i.price * i.qty}</span>
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Mobile Cart Footer */}
//             {cart.length > 0 && (
//               <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <p className="text-gray-600">Total Amount</p>
//                     <p className="text-2xl font-bold text-gray-800">₹{(total * 0.95).toFixed(2)}</p>
//                   </div>
//                   <button
//                     onClick={sendToKitchen}
//                     disabled={sending}
//                     className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
//                   >
//                     {sending ? "Sending..." : "Confirm Order"}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Floating Cart Button for Mobile */}
//       {cart.length > 0 && !isCartOpen && (
//         <button
//           onClick={() => setIsCartOpen(true)}
//           className="fixed bottom-6 right-6 lg:hidden z-40 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all animate-bounce-subtle"
//         >
//           <div className="relative">
//             <ShoppingBag className="w-8 h-8" />
//             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
//               {cartItemCount}
//             </span>
//           </div>
//         </button>
//       )}

//       {/* Add custom animations to global styles or Tailwind config */}
//       <style jsx>{`
//         @keyframes slideUp {
//           from {
//             transform: translateY(100%);
//           }
//           to {
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes bounce-subtle {
//           0%, 100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-10px);
//           }
//         }
        
//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out;
//         }
        
//         .animate-bounce-subtle {
//           animation: bounce-subtle 2s infinite;
//         }
        
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default OrderScreen;












import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { Plus, Minus, Trash2, ChevronLeft, ShoppingBag, Clock, CheckCircle, X } from "lucide-react";
 
const OrderScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
 
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [sending, setSending] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
 
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
 
  // Calculate cart item count
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  if (cart.length > 0 && !window.confirm("Discard current cart?")) return;
                  navigate("/cashier/tables");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs sm:text-sm text-slate-600 shadow-sm hover:text-slate-900 hover:border-slate-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Tables</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-9 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400">Current</p>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Table {tableId}</h1>
                  <p className="hidden sm:block text-sm text-slate-500">Restaurant Order System</p>
                </div>
              </div>
            </div>
 
            {/* Cart Button for Mobile */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg ring-4 ring-orange-100 hover:shadow-xl hover:scale-105 transition-all lg:hidden"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
 
            {/* Desktop Order Status */}
            <div className="hidden lg:flex items-center space-x-4">
              {existingOrder && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    Order in Progress
                  </span>
                </div>
              )}
              <button
                onClick={() => navigate(`/cashier/billing/${tableId}`)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-sm hover:shadow-lg transition-all hover:scale-105"
              >
                Billing
              </button>
            </div>
          </div>
        </div>
      </header>
 
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-4 sm:py-6">
        {/* Mobile Quick Actions */}
        <div className="lg:hidden mb-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/cashier/billing/${tableId}`)}
              className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-3 py-3 text-left shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-wide text-blue-400">
                Billing
              </p>
              <div className="mt-1 text-sm font-semibold text-blue-700">
                View Bill
              </div>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white px-3 py-3 text-left shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-wide text-orange-400">
                Cart
              </p>
              <div className="mt-1 flex items-center justify-between text-sm font-semibold text-orange-700">
                <span>Open Cart</span>
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-2 text-xs text-white">
                  {cartItemCount}
                </span>
              </div>
            </button>
          </div>
          {existingOrder && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              <Clock className="w-4 h-4" />
              Active order in progress
            </div>
          )}
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Categories & Products */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Categories Tabs */}
            <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-2 sm:p-3">
              <div className="relative">
                <div className="flex flex-nowrap gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 -mx-1 px-1">
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setActiveCat(c._id)}
                      className={`shrink-0 snap-start whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-300 ${
                        activeCat === c._id
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-white via-white/80 to-transparent rounded-l-2xl" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-white via-white/80 to-transparent rounded-r-2xl" />
              </div>
            </div>
 
            {/* Products Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-6">
                Menu Items
                <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                  ({filteredProducts.length} items)
                </span>
              </h2>
 
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
                {filteredProducts.map((p) => {
                  const inCart = cart.find((i) => i._id === p._id);
                  return (
                    <div
                      key={p._id}
                      onClick={() => addToCart(p)}
                      className="group relative bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="relative h-20 sm:h-28 lg:h-32 mb-2 sm:mb-3 rounded-xl overflow-hidden">
                        <img
                          src={p.image || "/no-image.png"}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        {inCart && (
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                            {inCart.qty} in cart
                          </div>
                        )}
                      </div>
 
                      {/* Product Info */}
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1 truncate">{p.name}</h3>
                        <p className="hidden sm:block text-slate-500 text-xs mb-2 line-clamp-2 h-8">
                          {p.description || "Delicious item"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-orange-600">
                            ₹{p.price}
                          </span>
                          <button className="px-2.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            Add +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
 
          {/* Right Column - Cart & Existing Orders (Desktop) */}
          <div className="lg:col-span-4 hidden lg:block space-y-6">
            {/* Existing Order Panel */}
            {existingOrder && (
              <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100 border border-amber-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Active Order</h3>
                    <p className="text-sm text-slate-600">Preparing in kitchen</p>
                  </div>
                </div>
 
                <div className="space-y-3">
                  {existingOrder.items.map((i, index) => (
                    <div
                      key={i._id || index}
                      className="flex items-center justify-between bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-amber-100"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{i.name}</div>
                        <div className="text-sm text-slate-500">Qty: {i.quantity}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        i.status === 'preparing' 
                          ? 'bg-blue-100 text-blue-800' 
                          : i.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {i.status || 'pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* Cart Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Current Order</h3>
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {cartItemCount} items
                    </span>
                  </div>
                </div>
              </div>
 
              {/* Cart Items */}
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Your cart is empty</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Add items from the menu
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((i) => (
                      <div
                        key={i._id}
                        className="group bg-gradient-to-r from-slate-50 via-white to-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{i.name}</h4>
                            <p className="text-sm text-slate-600">₹{i.price} each</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeQty(i._id, -1);
                                }}
                                className="text-slate-600 hover:text-slate-900 p-1"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-slate-900 w-6 text-center">
                                {i.qty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeQty(i._id, 1);
                                }}
                                className="text-slate-600 hover:text-slate-900 p-1"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(i._id);
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">
                            Total: <span className="font-bold text-slate-900">₹{i.price * i.qty}</span>
                          </span>
                          {i.qty > 1 && (
                            <span className="text-emerald-600 font-medium">
                              Saving: ₹{Math.round((i.price * i.qty * 0.1))}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
 
              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="border-t border-slate-200 p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>₹{total}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (5%)</span>
                      <span>₹{(total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{(total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>Total Amount</span>
                        <span>₹{(total * 0.95).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-3">
                    <button
                      onClick={sendToKitchen}
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending to Kitchen...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Send to Kitchen
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => navigate(`/cashier/billing/${tableId}`)}
                      className="w-full border-2 border-blue-500 text-blue-600 font-bold py-4 rounded-2xl hover:bg-blue-50 transition-colors"
                    >
                      Go to Billing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
 
      {/* Mobile Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Cart Drawer */}
          <div className="fixed bottom-0 left-0 right-0 h-[90vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slideUp border border-slate-200">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Your Order</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Mobile Status */}
              {existingOrder && (
                <div className="flex items-center space-x-2 px-3 py-2.5 bg-amber-50 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-xs sm:text-sm font-medium text-amber-700">
                    Active order in progress
                  </span>
                </div>
              )}
            </div>
 
            {/* Cart Items */}
            <div className="p-3 sm:p-4 h-[calc(90vh-200px)] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">Your cart is empty</p>
                  <p className="text-slate-400 mt-2">Select items to begin order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div
                      key={i._id}
                      className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">{i.name}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">₹{i.price} each</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-3 bg-white rounded-lg px-2.5 py-1 border border-slate-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                changeQty(i._id, -1);
                              }}
                              className="text-slate-600 p-1"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-slate-900 w-6 text-center">
                              {i.qty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                changeQty(i._id, 1);
                              }}
                              className="text-slate-600 p-1"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(i._id)}
                            className="text-rose-500 p-1.5"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Total: <span className="font-bold text-slate-900">₹{i.price * i.qty}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
 
            {/* Mobile Cart Footer */}
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-slate-600">Total Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">₹{(total * 0.95).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={sendToKitchen}
                    disabled={sending}
                    className="px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Confirm Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
 
      {/* Floating Cart Button for Mobile */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:hidden z-40 p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl ring-4 ring-orange-100 hover:shadow-3xl hover:scale-110 transition-all animate-bounce-subtle"
        >
          <div className="relative">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}
 
      {/* Add custom animations to global styles or Tailwind config */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
 
export default OrderScreen;