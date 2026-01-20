import { useEffect, useState, useRef } from "react";
import api from "../../utils/axios";
import { Trash2, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

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
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: null
  });

  // ===== EDIT PRODUCT =====
  const editFileRef = useRef(null);
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
    if (fileRef.current) fileRef.current.value = "";

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
    if (editFileRef.current) editFileRef.current.value = "";
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
    if (editFileRef.current) editFileRef.current.value = "";

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
    (!cuisineFilter ||
      (p.category?.cuisine || "")
        .toLowerCase()
        .includes(cuisineFilter.toLowerCase())
    ) &&
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
          type="text"
          inputMode="numeric"
          placeholder="Price"
          value={form.price}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, "");
            setForm({ ...form, price: digitsOnly });
          }}
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
          ref={fileRef}
          onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            setForm({ ...form, image: file });
          }}
        />
        <button onClick={addProduct} className="bg-gray-900 text-white rounded">
          Add
        </button>
      </div>

      {/* ===== TABLE ===== */}
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

              {/* 🔥 FILTER ROW (WAPAS ADD) */}
              <tr className="bg-white border-t">
                <th></th>
                <th>
                  <input
                    className="border px-2 py-1 w-full rounded"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </th>
                <th>
                  <select
                    className="border px-2 py-1 w-full rounded"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </th>
                <th>
                  <input
                    className="border px-2 py-1 w-full rounded"
                    placeholder="Cuisine"
                    value={cuisineFilter}
                    onChange={e => setCuisineFilter(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="₹"
                    value={priceFilter}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      setPriceFilter(digitsOnly);
                    }}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="border px-2 py-1 w-full rounded"
                  />

                </th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <Loader label="Loading products..." />
                  </td>
                </tr>
              ) : filteredProducts.map(p => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {/* <img src={p.image} className="w-10 h-10 rounded object-cover" /> */}
                    <img
                      src={p.image || "/no-image.png"}
                      onError={(e) => (e.target.src = "/no-image.png")}
                      className="w-10 h-10 rounded object-cover"
                    />

                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category?.name}</td>
                  <td className="p-3">{p.category?.cuisine}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => openEdit(p)}><Pencil size={16} /></button>
                    <button onClick={() => deleteProduct(p._id)}>
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
          <div className="bg-white w-full max-w-xs rounded-lg shadow-md">

            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="text-sm font-semibold">Edit Product</h3>
              <button onClick={() => setEditOpen(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="px-4 py-3 space-y-3 text-sm">
              <input
                value={editProduct.name}
                onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full border rounded px-2 py-1.5"
              />
              <input
                type="number"
                value={editProduct.price}
                onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                className="w-full border rounded px-2 py-1.5"
              />
              <select
                value={editProduct.category}
                onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
                className="w-full border rounded px-2 py-1.5"
              >
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <img src={editProduct.preview} className="w-10 h-10 rounded object-cover" />
                <input
                  type="file"
                  ref={editFileRef}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setEditProduct({
                      ...editProduct,
                      image: file,
                      preview: URL.createObjectURL(file)
                    });
                  }}
                />
              </div>
            </div>

            <div className="px-4 py-2 border-t flex gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 border rounded py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={updateProduct}
                className="flex-1 bg-gray-900 text-white rounded py-1.5 text-xs"
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
