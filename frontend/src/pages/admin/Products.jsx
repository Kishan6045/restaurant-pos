// import { useEffect, useState } from "react";
// import api from "../../utils/axios";
// import { Trash2, Pencil, Loader2 } from "lucide-react";
// import { toast } from "react-toastify";

// const CUISINES = ["All", "Gujarati", "Punjabi", "Chinese", "Common"];

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // filters
//   const [search, setSearch] = useState("");
//   const [activeCuisine, setActiveCuisine] = useState("All");

//   // create
//   const [form, setForm] = useState({
//     name: "",
//     price: "",
//     category: "",
//     image: null
//   });

//   // edit
//   const [editOpen, setEditOpen] = useState(false);
//   const [editProduct, setEditProduct] = useState({
//     id: "",
//     name: "",
//     price: "",
//     category: "",
//     image: null,
//     preview: ""
//   });

//   /* ================= FETCH ================= */

//   const loadCategories = async () => {
//     try {
//       const res = await api.get("/api/categories");
//       setCategories((res.data.categories || []).filter(c => c.isActive));
//     } catch {
//       toast.error("Failed to load categories");
//     }
//   };

//   const loadProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/api/products");
//       setProducts(res.data.products || []);
//     } catch {
//       toast.error("Failed to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//     loadProducts();
//   }, []);

//   /* ================= CREATE ================= */

//   const addProduct = async () => {
//     const { name, price, category, image } = form;

//     if (!name || !price || !category || !image) {
//       return toast.error("All fields required");
//     }

//     const fd = new FormData();
//     fd.append("name", name);
//     fd.append("price", price);
//     fd.append("category", category);
//     fd.append("image", image);

//     try {
//       await api.post("/api/products", fd);
//       toast.success("Product added");
//       setForm({ name: "", price: "", category: "", image: null });
//       loadProducts();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed");
//     }
//   };

//   /* ================= EDIT ================= */

//   const openEdit = (p) => {
//     setEditProduct({
//       id: p._id,
//       name: p.name,
//       price: p.price,
//       category: p.category?._id,
//       image: null,
//       preview: p.image   // 🔥 cloudinary url direct
//     });
//     setEditOpen(true);
//   };

//   const updateProduct = async () => {
//     const fd = new FormData();
//     fd.append("name", editProduct.name);
//     fd.append("price", editProduct.price);
//     fd.append("category", editProduct.category);
//     if (editProduct.image) {
//       fd.append("image", editProduct.image);
//     }

//     try {
//       await api.put(`/api/products/${editProduct.id}`, fd);
//       toast.success("Product updated");
//       setEditOpen(false);
//       loadProducts();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Update failed");
//     }
//   };

//   /* ================= DELETE ================= */

//   const deleteProduct = async (id) => {
//     if (!confirm("Delete this product?")) return;
//     try {
//       await api.delete(`/api/products/${id}`);
//       toast.success("Product deleted");
//       loadProducts();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   /* ================= FILTER ================= */

//   const filteredProducts = products.filter(p => {
//     const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
//     const matchCuisine =
//       activeCuisine === "All" || p.category?.cuisine === activeCuisine;
//     return matchSearch && matchCuisine;
//   });

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">

//       {/* HEADER */}
//       <h1 className="text-xl font-semibold mb-4">Products</h1>

//       {/* CUISINE FILTER */}
//       <div className="flex gap-2 mb-4 flex-wrap">
//         {CUISINES.map(c => (
//           <button
//             key={c}
//             onClick={() => setActiveCuisine(c)}
//             className={`px-4 py-1.5 rounded-full text-sm border
//               ${activeCuisine === c
//                 ? "bg-gray-900 text-white"
//                 : "bg-white"}`}
//           >
//             {c}
//           </button>
//         ))}
//       </div>

//       {/* CREATE FORM */}
//       <div className="bg-white p-4 rounded-xl border mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
//         <input
//           placeholder="Name"
//           value={form.name}
//           onChange={e => setForm({ ...form, name: e.target.value })}
//           className="border rounded px-3 py-2"
//         />
//         <input
//           type="number"
//           placeholder="Price"
//           value={form.price}
//           onChange={e => setForm({ ...form, price: e.target.value })}
//           className="border rounded px-3 py-2"
//         />
//         <select
//           value={form.category}
//           onChange={e => setForm({ ...form, category: e.target.value })}
//           className="border rounded px-3 py-2"
//         >
//           <option value="">Category</option>
//           {categories.map(c => (
//             <option key={c._id} value={c._id}>
//               {c.name} ({c.cuisine})
//             </option>
//           ))}
//         </select>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={e => setForm({ ...form, image: e.target.files[0] })}
//         />
//         <button
//           onClick={addProduct}
//           className="bg-gray-900 text-white rounded"
//         >
//           Add
//         </button>
//       </div>

//       {/* SEARCH */}
//       <input
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//         placeholder="Search..."
//         className="mb-4 w-full border rounded px-4 py-2"
//       />

//       {/* TABLE */}
//       {loading ? (
//         <div className="flex justify-center py-20">
//           <Loader2 className="animate-spin" />
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border overflow-x-auto">
//           <table className="w-full text-sm table-fixed">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="w-16 px-4 py-3">Image</th>
//                 <th className="px-4 py-3 text-left">Name</th>
//                 <th className="px-4 py-3 text-left">Category</th>
//                 <th className="px-4 py-3 text-left">Cuisine</th>
//                 <th className="px-4 py-3 text-left">Price</th>
//                 <th className="w-20 px-4 py-3">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredProducts.map(p => (
//                 <tr key={p._id} className="border-t">
//                   <td className="px-4 py-2">
//                     <img
//                       src={p.image}   // 🔥 Cloudinary direct
//                       alt={p.name}
//                       className="w-10 h-10 object-cover rounded border"
//                     />
//                   </td>
//                   <td className="px-4 py-2">{p.name}</td>
//                   <td className="px-4 py-2">{p.category?.name}</td>
//                   <td className="px-4 py-2">{p.category?.cuisine}</td>
//                   <td className="px-4 py-2">₹{p.price}</td>
//                   <td className="px-4 py-2">
//                     <div className="flex gap-3">
//                       <button onClick={() => openEdit(p)}>
//                         <Pencil size={16} />
//                       </button>
//                       <button onClick={() => deleteProduct(p._id)}>
//                         <Trash2 size={16} className="text-red-600" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* EDIT MODAL */}
//       {editOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-md p-6 rounded-xl">
//             <h3 className="font-semibold mb-4">Edit Product</h3>

//             <input
//               value={editProduct.name}
//               onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
//               className="border w-full mb-3 px-3 py-2 rounded"
//             />

//             <input
//               type="number"
//               value={editProduct.price}
//               onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
//               className="border w-full mb-3 px-3 py-2 rounded"
//             />

//             <select
//               value={editProduct.category}
//               onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
//               className="border w-full mb-3 px-3 py-2 rounded"
//             >
//               {categories.map(c => (
//                 <option key={c._id} value={c._id}>
//                   {c.name} ({c.cuisine})
//                 </option>
//               ))}
//             </select>

//             <div className="flex items-center gap-4 mb-4">
//               <img
//                 src={editProduct.preview}
//                 className="w-14 h-14 rounded object-cover border"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={e =>
//                   setEditProduct({
//                     ...editProduct,
//                     image: e.target.files[0],
//                     preview: URL.createObjectURL(e.target.files[0])
//                   })
//                 }
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setEditOpen(false)}
//                 className="flex-1 border rounded py-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={updateProduct}
//                 className="flex-1 bg-gray-900 text-white rounded py-2"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default Products;




import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { Trash2, Pencil, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== FILTERS =====
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  // ===== ADD PRODUCT =====
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: null
  });

  // ===== EDIT =====
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    image: null,
    preview: ""
  });

  /* ================= FETCH ================= */

  const loadCategories = async () => {
    const res = await api.get("/api/categories");
    setCategories(res.data.categories || []);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/products");
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  /* ================= ADD ================= */

  const addProduct = async () => {
    const { name, price, category, image } = form;
    if (!name || !price || !category || !image) {
      return toast.error("All fields required");
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("category", category);
    fd.append("image", image);

    await api.post("/api/products", fd);
    toast.success("Product added");
    setForm({ name: "", price: "", category: "", image: null });
    loadProducts();
  };

  /* ================= EDIT ================= */

  const openEdit = (p) => {
    setEditProduct({
      id: p._id,
      name: p.name,
      price: p.price,
      category: p.category?._id,
      image: null,
      preview: p.image
    });
    setEditOpen(true);
  };

  const updateProduct = async () => {
    const fd = new FormData();
    fd.append("name", editProduct.name);
    fd.append("price", editProduct.price);
    fd.append("category", editProduct.category);
    if (editProduct.image) fd.append("image", editProduct.image);

    await api.put(`/api/products/${editProduct.id}`, fd);
    toast.success("Product updated");
    setEditOpen(false);
    loadProducts();
  };

  /* ================= DELETE ================= */

  const deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return;
    await api.delete(`/api/products/${id}`);
    toast.success("Product deleted");
    loadProducts();
  };

  /* ================= FILTER ================= */

  const filteredProducts = products.filter(p => (
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!categoryFilter || p.category?._id === categoryFilter) &&
    (!cuisineFilter || p.category?.cuisine === cuisineFilter) &&
    (!priceFilter || String(p.price).includes(priceFilter))
  ));

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-hidden">

      {/* ===== ADD PRODUCT ===== */}
      <div className="bg-white p-4 rounded-lg border mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">Category</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input
          type="file"
          onChange={e => setForm({ ...form, image: e.target.files[0] })}
        />
        <button onClick={addProduct} className="bg-gray-900 text-white rounded">
          Add
        </button>
      </div>

      {/* ===== TABLE (ONLY SCROLL HERE) ===== */}
      <div className="bg-white rounded-xl border">
        <div className="max-h-[450px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Cuisine</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3">Action</th>
              </tr>
              <tr className="bg-white border-t">
                <th></th>
                <th><input className="border px-2 py-1 w-full rounded" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} /></th>
                <th>
                  <select className="border px-2 py-1 w-full rounded" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </th>
                <th><input className="border px-2 py-1 w-full rounded" placeholder="Cuisine" value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)} /></th>
                <th><input className="border px-2 py-1 w-full rounded" placeholder="₹" value={priceFilter} onChange={e => setPriceFilter(e.target.value)} /></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10"><Loader2 className="animate-spin inline" /></td></tr>
              ) : filteredProducts.map(p => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-3"><img src={p.image} className="w-10 h-10 rounded object-cover" /></td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category?.name}</td>
                  <td className="p-3">{p.category?.cuisine}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => openEdit(p)}><Pencil size={16} /></button>
                    <button onClick={() => deleteProduct(p._id)}><Trash2 size={16} className="text-red-600" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
    {/* ===== EDIT PRODUCT MODAL (COMPACT & PROFESSIONAL) ===== */}
{editOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
    <div className="bg-white w-full max-w-xs rounded-lg shadow-md">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="text-sm font-semibold text-gray-800">
          Edit Product
        </h3>
        <button
          onClick={() => setEditOpen(false)}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3 text-sm">

        {/* Product Name */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Item Name
          </label>
          <input
            value={editProduct.name}
            onChange={e =>
              setEditProduct({ ...editProduct, name: e.target.value })
            }
            className="w-full border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-800"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Price (₹)
          </label>
          <input
            type="number"
            value={editProduct.price}
            onChange={e =>
              setEditProduct({ ...editProduct, price: e.target.value })
            }
            className="w-full border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-800"
          />
        </div>

        {/* Category (native dropdown, clean) */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Category
          </label>
         <select
  value={editProduct.category}
  onChange={e =>
    setEditProduct({ ...editProduct, category: e.target.value })
  }
  onFocus={e => (e.target.size = 6)}   // 👈 open with scroll
  onBlur={e => (e.target.size = 1)}    // 👈 close back to normal
  className="w-full border rounded-md px-2 py-1.5 bg-white
             focus:outline-none focus:ring-1 focus:ring-gray-800"
>
  {categories.map(c => (
    <option key={c._id} value={c._id}>
      {c.name}
    </option>
  ))}
</select>

        </div>

        {/* Image */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Image
          </label>
          <div className="flex items-center gap-2">
            <img
              src={editProduct.preview}
              className="w-10 h-10 rounded border object-cover"
            />
            <input
              type="file"
              onChange={e =>
                setEditProduct({
                  ...editProduct,
                  image: e.target.files[0],
                  preview: URL.createObjectURL(e.target.files[0])
                })
              }
              className="text-xs"
            />
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t flex gap-2">
        <button
          onClick={() => setEditOpen(false)}
          className="flex-1 border rounded-md py-1.5 text-xs hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={updateProduct}
          className="flex-1 bg-gray-900 text-white rounded-md py-1.5 text-xs hover:bg-black"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}
    </div>  
  );

};
export default Products;
