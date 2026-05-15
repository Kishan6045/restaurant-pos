import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import api from "../../utils/axios";
import { Trash2, Pencil, X, Upload, ChevronDown, Search, Filter, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import PaginationBar from "../../components/PaginationBar";
import AdminPageShell from "../../components/admin/AdminPageShell";
import { docId } from "../../helpers/docId";
import Select from "../../components/ui/Select";

const Products = () => {
  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const PRODUCTS_LIMIT = 10;

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
    cuisine: "",
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
    cuisine: "",
    category: "",
    image: null,
    preview: ""  // img URL for preview in edit form
  });

  /* ================= FETCH ================= */
  // load categories 
  const loadCategories = useCallback(async () => {  // useCallback use kyki ye function baar baar na bane, dependencies change hone pr hi bane
    try {
      const res = await api.get("/api/categories", { params: { limit: 200 } });
      const data = res.data.categories || res.data.data || (Array.isArray(res.data) ? res.data : []);
      setCategories(data);
      return data;
    } catch (error) {
      toast.error("Failed to load categories");
      setCategories([]);  // set empty array on error to avoid undefined issues
      return [];
    }
  }, []);  // one time function data load ke liye []

  // load products
  const loadProducts = useCallback(async (pageNum = 1) => {   // ye function baar baar na bane, dependencies change hone pr hi bane
    try {
      console.log("Fetching products...");
      const res = await api.get("/api/products", { params: { page: pageNum || 1, limit: PRODUCTS_LIMIT } });
      const productsData = res.data.products || res.data.data || [];
      setProducts(productsData);
      setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: PRODUCTS_LIMIT });
      return productsData;
    } catch (error) {
      toast.error("Failed to load products");
      return [];
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        await loadCategories();
        await loadProducts(page);
        setIsDataLoaded(true);
      } catch (error) {
        toast.error("Error loading data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [page]);


  /* ================= ACTIONS ================= */
  // Get unique cuisines from categories
  const cuisines = useMemo(() => {
    if (!categories || categories.length === 0) {
      console.log("No categories available for cuisine extraction");
      return [];
    }

    console.log("Extracting cuisines from categories:", categories);

    const cuisineSet = new Set(); // Set is used to store unique cuisines, automatically handles duplicates
    categories.forEach(category => {
      if (category && category.cuisine) {
        cuisineSet.add(category.cuisine.trim());
      }
    });

    const uniqueCuisines = Array.from(cuisineSet).sort(); // Convert set back to array and sort alphabetically
    console.log("Extracted cuisines:", uniqueCuisines);
    return uniqueCuisines;
  }, [categories]);

  // Filter categories based on selected cuisine in add form
  const filteredCategories = useMemo(() => {
    if (!form.cuisine || !categories.length) return [];

    const filtered = categories.filter(category =>
      category && category.cuisine && category.cuisine.trim() === form.cuisine
    );
    console.log(`Categories for cuisine "${form.cuisine}":`, filtered);
    return filtered;
  }, [categories, form.cuisine]);

  // Filter categories based on selected cuisine in edit form
  const editFilteredCategories = useMemo(() => {
    if (!editProduct.cuisine || !categories.length) return [];

    return categories.filter(category =>
      category && category.cuisine && category.cuisine.trim() === editProduct.cuisine
    );
  }, [categories, editProduct.cuisine]);

  // Filter categories based on selected cuisine in table filter
  const filteredCategoriesForTable = useMemo(() => {
    if (!cuisineFilter || !categories.length) return categories;

    return categories.filter(category =>
      category && category.cuisine && category.cuisine.trim() === cuisineFilter
    );
  }, [categories, cuisineFilter]);


  /* ================= ADD ================= */
  // form reset function
  const resetForm = useCallback(() => {   // useCallback use kyuki ye function baar baar na bane, dependencies change hone pr hi bane
    setForm({ name: "", price: "", cuisine: "", category: "", image: null });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const validateProductForm = useCallback(({ name, price, cuisine, category, image }) => {
    if (!name.trim()) return "Product name is required";
    if (!price || Number(price) <= 0) return "Valid price is required";
    if (!cuisine) return "Cuisine is required";
    if (!category) return "Category is required";
    if (!image) return "Product image is required";
    return null;
  }, []);

  // Add product function
  const addProduct = async () => {
    const validationError = validateProductForm(form);
    if (validationError) {
      return toast.error(validationError);
    }

    const fd = new FormData();   // FormData is used to send multipart/form-data, which is necessary for file uploads. It allows us to append text fields and files together in one request.
    fd.append("name", form.name.trim());
    fd.append("price", form.price);  // fd.append automatically converts numbers to strings, so no need to convert price to string explicitly
    fd.append("categoryId", String(form.category));
    fd.append("image", form.image);

    try {
      setLoading(true);
      await api.post("/api/products", fd);
      toast.success("Product added successfully");
      await loadProducts(page);
      resetForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add product";
      console.error("Add product error:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  /* ================= EDIT ================= */
  // Open edit modal and populate form with product data
  const openEdit = useCallback((product) => {
    console.log("Opening edit for product:", product);
    const cuisine = product.category?.cuisine || "";
    const categoryId = docId(product.category) || "";

    setEditProduct({
      id: docId(product),
      name: product.name,
      price: product.price,
      cuisine: cuisine,
      category: categoryId,
      image: null,
      preview: product.image
    });
    setEditOpen(true);
    if (editFileRef.current) editFileRef.current.value = "";
  }, []);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setEditProduct({
      id: "",
      name: "",
      price: "",
      cuisine: "",
      category: "",
      image: null,
      preview: ""
    });
  }, []);

  // Update product function
  const updateProduct = async () => {
    if (!editProduct.name.trim() || !editProduct.price || Number(editProduct.price) <= 0) {
      return toast.error("Product name and valid price are required");
    }
    if (!editProduct.cuisine) {
      return toast.error("Cuisine is required");
    }
    if (!editProduct.category) {
      return toast.error("Category is required");
    }

    const fd = new FormData();
    fd.append("name", editProduct.name.trim());
    fd.append("price", editProduct.price);
    fd.append("categoryId", String(editProduct.category));
    if (editProduct.image) fd.append("image", editProduct.image);

    try {
      setLoading(true);
      await api.put(`/api/products/${docId(editProduct)}`, fd);
      toast.success("Product updated successfully");
      closeEdit();
      await loadProducts(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Update failed";
      console.error("Update product error:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  /* ================= DELETE ================= */
  const deleteProduct = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setLoading(true);
      await api.delete(`/api/products/${id}`);
      toast.success("Product deleted successfully");
      await loadProducts(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Delete failed";
      console.error("Delete product error:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);


  // Fillter Produstcs --------------------- //
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = search
        ? p.name.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesCategory = categoryFilter
        ? String(docId(p.category)) === String(categoryFilter)
        : true;

      const matchesCuisine = cuisineFilter
        ? (p.category?.cuisine || "").toLowerCase() === cuisineFilter.toLowerCase()
        : true;

      const matchesPrice = priceFilter
        ? String(p.price).includes(priceFilter)
        : true;

      return matchesSearch && matchesCategory && matchesCuisine && matchesPrice;
    });
  }, [products, search, categoryFilter, cuisineFilter, priceFilter]);


  /* ================= HANDLERS ================= */

  const handlePriceChange = useCallback((value, setter) => {
    const digitsOnly = value.replace(/\D/g, "");
    setter(digitsOnly);
  }, []);

  const handleFileChange = useCallback((e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP, GIF)");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      e.target.value = "";
      return;
    }

    setter(file);
  }, []);

  const handleCuisineChange = useCallback((cuisine, isEdit = false) => {
    if (isEdit) {
      setEditProduct((prev) => ({
        ...prev,
        cuisine,
        category: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        cuisine,
        category: "",
      }));
    }
  }, []);

  // ================= RENDER ================= // 

  const renderTableRows = useCallback(() => {
    if (loading && products.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-10">
            <Loader label="Loading products..." />
          </td>
        </tr>
      );
    }

    if (filteredProducts.length === 0 && !loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-10">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {products.length === 0 ? "No products available" : "No products match your filters"}
              </p>
              <p className="text-xs mt-1">
                {products.length === 0 ? "Add your first product above" : "Try adjusting your search or filters"}
              </p>
            </div>
          </td>
        </tr>
      );
    }

    return filteredProducts.map(product => (
      <tr key={docId(product)} className="border-b hover:bg-gray-50/50 transition-colors duration-150">
        <td className="py-2 px-3">
          <div className="relative w-9 h-9 sm:w-12 sm:h-12">
            <img
              src={product.image || "/no-image.png"}
              alt={product.name}
              onError={(e) => {
                e.target.src = "/no-image.png";
                e.target.onerror = null;
              }}
              className="w-full h-full rounded-lg object-cover border border-gray-100 shadow-sm"
            />
          </div>
        </td>
        <td className="py-2 px-3">
          <div>
            <p className="font-medium text-gray-800">{product.name}</p>
          </div>
        </td>
        <td className="py-2 px-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {product.category?.name || "Uncategorized"}
          </span>
        </td>
        <td className="py-2 px-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            {product.category?.cuisine || "-"}
          </span>
        </td>
        <td className="py-2 px-3">
          <div className="flex items-center">
            <span className="font-semibold text-gray-900">₹{Number(product.price).toLocaleString()}</span>
          </div>
        </td>
        <td className="py-2 px-3">
          <div className="flex gap-2">
            <button
              onClick={() => openEdit(product)}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => deleteProduct(docId(product))}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [loading, products, filteredProducts, openEdit, deleteProduct]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products and categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <AdminPageShell title="Products">
      <div className="flex flex-col gap-6 overflow-hidden p-4 sm:p-6">
      {/* ===== ADD PRODUCT CARD ===== */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setShowAddForm(v => !v)}
            className=" md:hidden flex items-center gap-2 text-sm font-medium text-gray-700 px-3 py-1.5 rounded-lg border transition-all duration-200 hover:bg-gray-50 active:scale-95 ">
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${showAddForm ? "rotate-180" : "rotate-0"
                }`}
            />
            <span>
              {showAddForm ? "Hide Form" : "Add Product"}
            </span>
          </button>

        </div>


        {/* Product Name */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 ${showAddForm ? "block" : "hidden"} md:grid`}
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Name</label>
            <div className="relative">
              <input
                placeholder="enter product name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-sm"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Price (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => handlePriceChange(e.target.value, (value) =>
                  setForm({ ...form, price: value })
                )}
                className="w-full border border-gray-300 pl-8 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-sm"
              />
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Cuisine</label>
            <Select
              aria-label="Product cuisine"
              value={form.cuisine}
              onChange={(v) => handleCuisineChange(v, false)}
              options={cuisines.map((c) => ({ value: c, label: c }))}
              placeholder={!isDataLoaded ? "Loading..." : cuisines.length === 0 ? "No cuisines found" : "Select Cuisine"}
              disabled={!isDataLoaded || cuisines.length === 0}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
            <Select
              aria-label="Product category"
              value={form.category}
              onChange={(v) => setForm((prev) => ({ ...prev, category: String(v) }))}
              disabled={!form.cuisine || filteredCategories.length === 0}
              placeholder={
                !form.cuisine
                  ? "Select cuisine first"
                  : filteredCategories.length === 0
                    ? "No categories"
                    : "Select Category"
              }
              options={filteredCategories.map((category) => ({
                value: docId(category),
                label: category.name,
              }))}
              className="w-full"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Image</label>
            <div className="relative">
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e, (file) =>
                  setForm({ ...form, image: file })
                )}
                className="w-full opacity-0 absolute inset-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl px-3.5 py-2.5 text-center hover:border-gray-400 hover:bg-gray-50 transition-all bg-white">
                <div className="flex items-center justify-center gap-2">
                  <Upload size={14} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {form.image?.name || "Choose image"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Max 5MB • JPEG, PNG</p>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              onClick={addProduct}
              disabled={loading || !isDataLoaded}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 py-2.5 px-4 font-medium text-sm shadow-sm hover:shadow active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </span>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </div>

      </div>

      {/* ===== PRODUCTS TABLE ===== */}
      <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header with Filters */}
        <div className="px-5 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
              <p className="text-sm text-gray-500">
                {filteredProducts.length} of {pagination.total} products
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full border border-gray-300 pl-9 pr-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-sm"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Filter size={14} />
                <span>Filters</span>
              </div>

            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">

            <div>
              <Select
                aria-label="Filter by category"
                variant="compact"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "", label: "All Categories" },
                  ...filteredCategoriesForTable.map((category) => ({
                    value: docId(category),
                    label: category.name,
                  })),
                ]}
                placeholder="All Categories"
                className="w-full"
              />
            </div>

            <div>
              <Select
                aria-label="Filter by cuisine"
                variant="compact"
                value={cuisineFilter}
                onChange={(v) => {
                  setCuisineFilter(v);
                  setCategoryFilter("");
                }}
                options={[
                  { value: "", label: "All Cuisines" },
                  ...cuisines.map((cuisine) => ({ value: cuisine, label: cuisine })),
                ]}
                placeholder="All Cuisines"
                className="w-full"
              />
            </div>

            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Filter by price..."
                value={priceFilter}
                onChange={(e) => handlePriceChange(e.target.value, setPriceFilter)}
                className="w-full border border-gray-300 px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-sm"
              />
            </div>

            <div>
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setCuisineFilter("");
                  setPriceFilter("");
                }}
                className="w-full border border-gray-300 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[700px] lg:min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr className="bg-gray-50 sticky top-0 z-10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Cuisine</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
        <PaginationBar
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          loading={initialLoading}
        />
      </div>
      </div>
    </AdminPageShell>

      {/* ===== EDIT MODAL ===== */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className=" bg-white w-full sm:w-full max-w-md max-h-[90vh]  overflow-y-auto  rounded-2xl shadow-xl animate-in fade-in duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
                <p className="text-sm text-gray-500">Update product details</p>
              </div>
              <button
                onClick={closeEdit}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Name</label>
                <input
                  placeholder="Enter product name"
                  value={editProduct.name}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter price"
                    value={editProduct.price}
                    onChange={(e) => handlePriceChange(e.target.value, (value) =>
                      setEditProduct({ ...editProduct, price: value })
                    )}
                    className="w-full border border-gray-300 pl-8 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Cuisine</label>
                <Select
                  aria-label="Edit product cuisine"
                  value={editProduct.cuisine}
                  onChange={(v) => handleCuisineChange(v, true)}
                  options={cuisines.map((c) => ({ value: c, label: c }))}
                  placeholder="Select Cuisine"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
                <Select
                  aria-label="Edit product category"
                  value={editProduct.category}
                  onChange={(v) => setEditProduct((prev) => ({ ...prev, category: String(v) }))}
                  disabled={!editProduct.cuisine || editFilteredCategories.length === 0}
                  placeholder={
                    !editProduct.cuisine
                      ? "Select cuisine first"
                      : editFilteredCategories.length === 0
                        ? "No categories"
                        : "Select Category"
                  }
                  options={editFilteredCategories.map((category) => ({
                    value: docId(category),
                    label: category.name,
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Image</label>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={editProduct.preview || "/no-image.png"}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                        e.target.onerror = null;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <Pencil size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        ref={editFileRef}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (file) => {
                          setEditProduct({
                            ...editProduct,
                            image: file,
                            preview: URL.createObjectURL(file)
                          });
                        })}
                        className="opacity-0 absolute inset-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-xl px-3.5 py-3 text-center hover:border-gray-400 hover:bg-gray-50 transition-all">
                        <div className="flex items-center justify-center gap-2">
                          <Upload size={14} className="text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">
                            Change image
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Leave empty to keep current</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeEdit}
                className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={updateProduct}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl py-2.5 text-sm font-medium hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;