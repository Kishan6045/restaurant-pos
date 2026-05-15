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
import PaginationBar from "../../components/PaginationBar";
import AdminPageShell from "../../components/admin/AdminPageShell";
import { docId } from "../../helpers/docId";
import Select from "../../components/ui/Select";

const CUISINES = ["Gujarati", "Punjabi", "Chinese", "Common"];

const CUISINE_OPTIONS = CUISINES.map((c) => ({ value: c, label: c }));

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const LIMIT = 10;

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


  // ================= FETCH CATEGORIES ================= //
  const loadCategories = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/api/categories", { params: { page: pageNum, limit: LIMIT } });
      setCategories(res.data.categories || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: LIMIT });
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(page);
  }, [page]);


  // ================= ADD CATEGORY ================= //
  const addCategory = async () => {
    if (!name.trim()) return toast.error("Category name required");
    if (!cuisine) return toast.error("Please select cuisine");

    try {
      await api.post("/api/categories", { name, cuisine });  // only name and cuisine bhejne hain

      toast.success("Category added");
      setName("");   // reset fields
      setCuisine("");  // reset fields
      loadCategories(page);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add category"
      );
    }
  };

  // ================= UPDATE CATEGORY ================= //
  const updateCategory = async () => {
    if (!editName.trim()) return toast.error("Name required");
    if (!editCuisine) return toast.error("Cuisine required");

    try {
      await api.put(`/api/categories/${editId}`, {  // put request to update category
        name: editName,           // send updated name
        cuisine: editCuisine      // send updated cuisine
      });

      toast.success("Category updated");
      setEditOpen(false);  // close edit modal
      loadCategories(page);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Update failed"
      );
    }
  };

  // ================= DELETE CATEGORY ================= //
  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Category deleted");
      loadCategories(page);
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= VIEW ================= //
  const openView = async (cat) => {  //cat = category object
    setViewCategory(cat);  // set the category to view
    setViewOpen(true);      // open the view modal
    setViewLoading(true);    // start loading
    setOpenMenuId(null);   // close the dropdown menu

    try {
      const res = await api.get(`/api/categories/${docId(cat)}/products`); // fetch products under category
      setViewProducts(res.data.products || []);  // set the products to state
    } catch {
      toast.error("Failed to load products");
    } finally {
      setViewLoading(false);
    }
  };


  // ================= FILTER ================= //
  const filtered = activeCuisine  // if activeCuisine set then filter
    ? categories.filter(c => c.cuisine === activeCuisine)  // filter by cuisine
    : categories;  // else show all


  return (
    <>
    <div
      className="h-full"
      onClick={() => setOpenMenuId(null)}
    >
    <AdminPageShell title="Categories">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
      {/* ADD CATEGORY */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Category name "
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none"
          />

          <Select
            aria-label="Cuisine for new category"
            value={cuisine}
            onChange={setCuisine}
            options={CUISINE_OPTIONS}
            placeholder="Select cuisine"
            className="w-full sm:w-48 shrink-0"
          />

          <button
            onClick={addCategory}
            className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm flex items-center gap-2"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCuisine("")}   // reset filter to show all
          className={`rounded-full border px-4 py-1.5 text-sm transition
            ${activeCuisine === ""
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
        >
          All
        </button>

        {CUISINES.map(c => (
          <button
            key={c}    // unique key
            onClick={() => setActiveCuisine(c)}  // set active cuisine filter
            className={`rounded-full border px-4 py-1.5 text-sm transition
              ${activeCuisine === c
                ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* GRID (ONLY THIS SCROLLS) */}
      <div className="flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {loading ? (
          <Loader label="Loading categories..." containerClassName="py-20" />
        ) : (   // condition false ho to ye chalta hai
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(cat => (
              <div
                key={docId(cat)}
                className="relative rounded-lg border p-4 h-[110px]
                        bg-gradient-to-br from-gray-50 to-gray-100
                        hover:shadow-md transition"
                onClick={e => e.stopPropagation()}  // card ke andar click par dropdown band na ho jaye
              >
                {/* LEFT COLOR STRIP */}
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-indigo-500" />

                {/* MENU */}
                <button
                  onClick={(e) => { // stop propagation to prevent card click
                    e.stopPropagation();  // card ke andar click par dropdown band na ho jaye
                    setOpenMenuId(openMenuId === docId(cat) ? null : docId(cat));
                  }}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                  <MoreVertical size={18} />
                </button>

                {/* NAME */}
                <p className="text-lg font-semibold truncate" >
                  {cat.name}
                </p>

                {/* CUISINE CHIP */}
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full 
                   bg-indigo-100 text-indigo-700">
                  {cat.cuisine}
                </span>

                {/* ITEM BADGE (UI ONLY) */}
                <span className="absolute bottom-3 right-3 text-[10px] 
                   bg-white px-2 py-0.5 rounded-full text-gray-600 border">
                  {cat.productCount || 0} items
                </span>

                {/* DROPDOWN */}
                {openMenuId === docId(cat) && (  // show dropdown if this menu is open
                  <div className="absolute right-3 top-10 bg-white border rounded-lg shadow-lg w-32 z-40">
                    <button
                      onClick={(e) => {  // stop propagation to prevent card click
                        e.stopPropagation();   // card ke andar click par dropdown band na ho jaye
                        openView(cat);   // open view modal
                      }}
                      className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-200"
                    >
                      <Eye size={14} /> View
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();  // stop propagation to prevent card click
                        setEditId(docId(cat));   // set the id of category to edit
                        setEditName(cat.name);  // set the name of category to edit
                        setEditCuisine(cat.cuisine);  // set the cuisine of category to edit
                        setEditOpen(true);    // open the edit modal
                        setOpenMenuId(null);   // close the dropdown menu
                      }}
                      className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-200"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={(e) => {  // stop propagation to prevent card click
                        e.stopPropagation();
                        deleteCategory(docId(cat));
                      }}
                      className="w-full px-3 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
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
        <PaginationBar
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
      </div>
    </AdminPageShell>
    </div>

      {/* EDIT MODAL */}
      {
        editOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-[85%] max-w-xs relative">
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
                className="border w-full px-2.5 py-1.5 rounded-md mb-2 text-sm"
              />

              <Select
                aria-label="Cuisine"
                value={editCuisine}
                onChange={setEditCuisine}
                options={CUISINE_OPTIONS}
                placeholder="Select cuisine"
                className="mb-3 w-full"
              />

              <button
                onClick={updateCategory}
                className="w-full bg-gray-900 text-white py-1.5 rounded-md text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        )
      }

      {/* VIEW MODAL */}
      {
        viewOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[85%] max-w-sm rounded-xl overflow-hidden">
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
                    <div key={docId(p)} className="flex items-center justify-between px-4 py-3">
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
        )
      }
    </>
  );
};

export default Categories;
