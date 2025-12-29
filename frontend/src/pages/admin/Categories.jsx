import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [editName, setEditName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    // ================= FETCH =================
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/categories");
            setCategories(res.data.categories || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ================= ADD =================
    const addCategory = async () => {
        if (!name.trim()) return toast.error("Category name required");
        try {
            const res = await axios.post("/api/categories", { name });
            toast.success(res.data.message);
            setName("");
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    // ================= UPDATE =================
    const updateCategory = async () => {
        if (!editName.trim()) return toast.error("Category name required");
        try {
            const res = await axios.put(`/api/categories/${editingId}`, {
                name: editName
            });
            toast.success(res.data.message);
            setOpenModal(false);
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    // ================= DELETE =================
    const deleteCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const res = await axios.delete(`/api/categories/${id}`);
            toast.success(res.data.message);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">

            {/* ===== HEADER (FIXED) ===== */}
            <h1 className="text-2xl font-semibold mb-4 shrink-0">
                Category Management
            </h1>

            {/* ===== ADD CATEGORY (FIXED) ===== */}
            <div className="bg-white p-4 rounded-xl shadow mb-4 shrink-0">
                <div className="flex gap-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={addCategory}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </div>

            {/* ===== CATEGORY LIST (ONLY THIS SCROLLS) ===== */}
            <div className="bg-white rounded-xl shadow flex-1 overflow-y-auto">

                {/* Sticky list header */}
                <div className="sticky top-0 bg-white z-10 px-5 py-3 font-semibold border-b">
                    All Categories
                </div>

                {loading && (
                    <div className="p-6 flex justify-center">
                        <Loader2 className="animate-spin" />
                    </div>
                )}

                {!loading && categories.length === 0 && (
                    <p className="p-6 text-center text-gray-500">
                        No categories found
                    </p>
                )}

                {!loading &&
                    categories.map((cat) => (
                        <div
                            key={cat._id}
                            className="flex justify-between items-center px-5 py-4 border-b last:border-b-0 hover:bg-gray-50"
                        >
                            <span className="font-medium">{cat.name}</span>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEditingId(cat._id);
                                        setEditName(cat.name);
                                        setOpenModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    onClick={() => deleteCategory(cat._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* ===== EDIT MODAL ===== */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] max-w-md rounded-xl shadow-lg p-6 relative">

                        <button
                            onClick={() => setOpenModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <X />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">
                            Edit Category
                        </h2>

                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Category name"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-4 py-2 rounded-lg border"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateCategory}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Update
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
