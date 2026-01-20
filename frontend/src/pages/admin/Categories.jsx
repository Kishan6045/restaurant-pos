import { useEffect, useState } from "react";
import api from "../../utils/axios";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  MoreVertical
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";


const CUISINES = ["Gujarati", "Punjabi", "Chinese", "Common"];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // add
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");

  // filter
  const [activeCuisine, setActiveCuisine] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  // edit
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCuisine, setEditCuisine] = useState("");

  // view
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);
  const [viewProducts, setViewProducts] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  /* ================= FETCH ================= */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/categories");
      setCategories(res.data.categories || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= ADD ================= */
  const addCategory = async () => {
    if (!name.trim()) return toast.error("Category name required");
    if (!cuisine) return toast.error("Please select cuisine");

    await api.post("/api/categories", { name, cuisine });
    toast.success("Category added");

    setName("");
    setCuisine("");
    loadCategories();
  };

  /* ================= UPDATE ================= */
  const updateCategory = async () => {
    if (!editName.trim()) return toast.error("Name required");
    if (!editCuisine) return toast.error("Cuisine required");

    await api.put(`/api/categories/${editId}`, {
      name: editName,
      cuisine: editCuisine
    });
    toast.success("Category updated");
    setEditOpen(false);
    loadCategories();
  };

  /* ================= DELETE ================= */
  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/api/categories/${id}`);
    toast.success("Category deleted");
    loadCategories();
  };

  /* ================= VIEW ================= */
  const openView = async (cat) => {
    setViewCategory(cat);
    setViewOpen(true);
    setViewLoading(true);
    setOpenMenuId(null);

    try {
      const res = await api.get(`/api/categories/${cat._id}/products`);
      setViewProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setViewLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = activeCuisine
    ? categories.filter(c => c.cuisine === activeCuisine)
    : categories;

  return (
    <div
      className="p-6 h-screen overflow-hidden bg-gray-100"
      onClick={() => setOpenMenuId(null)}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Menu Categories
        </h1>
        <p className="text-sm text-gray-500">
          Restaurant Menu Management
        </p>
      </div>

      {/* ADD CATEGORY */}
      <div className="mb-6 bg-white border rounded-xl px-4 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Category name (e.g. Starters)"
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none"
          />

          <select
            value={cuisine}
            onChange={e => setCuisine(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select Cuisine
            </option>
            {CUISINES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={addCategory}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveCuisine("")}
          className={`px-4 py-1.5 rounded-full text-sm border
            ${activeCuisine === ""
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700"}`}
        >
          All
        </button>

        {CUISINES.map(c => (
          <button
            key={c}
            onClick={() => setActiveCuisine(c)}
            className={`px-4 py-1.5 rounded-full text-sm border
              ${activeCuisine === c
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* GRID (ONLY THIS SCROLLS) */}
      <div className="bg-white rounded-xl border shadow-sm p-4 h-[65vh] overflow-y-auto">
        {loading ? (
          <Loader label="Loading categories..." containerClassName="py-20" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(cat => (
              <div
                key={cat._id}
                className="relative bg-white rounded-xl border p-6 h-[140px]
                           hover:shadow-lg transition"
                onClick={e => e.stopPropagation()}
              >
                {/* LEFT COLOR STRIP */}
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-900" />

                {/* MENU */}
                <button
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === cat._id ? null : cat._id
                    )
                  }
                  className="absolute top-3 right-3 text-gray-500"
                >
                  <MoreVertical size={18} />
                </button>

                {/* NAME */}
                <p className="text-lg font-semibold truncate">
                  {cat.name}
                </p>

                {/* CUISINE CHIP */}
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {cat.cuisine}
                </span>

                {/* ITEM BADGE (UI ONLY) */}
                <span className="absolute bottom-4 right-4 text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {cat.productCount || 0} items
                </span>

                {/* DROPDOWN */}
                {openMenuId === cat._id && (
                  <div className="absolute right-3 top-10 bg-white border rounded-lg shadow-lg w-36 z-50">
                    <button
                      onClick={() => openView(cat)}
                      className="w-full px-3 py-2 text-sm flex gap-2 hover:bg-gray-100"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => {
                        setEditId(cat._id);
                        setEditName(cat.name);
                        setEditCuisine(cat.cuisine);
                        setEditOpen(true);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-3 py-2 text-sm flex gap-2 hover:bg-gray-100"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="w-full px-3 py-2 text-sm flex gap-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[90%] max-w-sm relative">
            <button
              onClick={() => setEditOpen(false)}
              className="absolute top-3 right-3"
            >
              <X size={18} />
            </button>

            <h3 className="font-semibold mb-3">
              Edit Category
            </h3>

            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="border w-full px-3 py-2 rounded-lg mb-3"
            />

            <select
              value={editCuisine}
              onChange={e => setEditCuisine(e.target.value)}
              className="border w-full px-3 py-2 rounded-lg mb-4"
            >
              <option value="" disabled>Select Cuisine</option>
              {CUISINES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={updateCategory}
              className="w-full bg-gray-900 text-white py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">
                {viewCategory.name}
              </h3>
              <button onClick={() => setViewOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[150px] overflow-y-auto divide-y scrollbar-thin">
              {viewLoading ? (
                <div className="p-6">
                  <Loader label="Loading items..." />
                </div>
              ) : viewProducts.length === 0 ? (
                <p className="p-6 text-center text-gray-500">
                  No products found
                </p>
              ) : (
                viewProducts.map(p => (
                  <div key={p._id} className="flex justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">₹{p.price}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${p.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {p.isAvailable ? "Available" : "Out"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
