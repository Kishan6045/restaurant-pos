import { useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // backend role decide karta hai
      toast.success("Login successful");
      // navigate(`/${res.data.role}`);
      const roleRouteMap = {
  admin: "/admin",
  cashier: "/cashier",
  kitchen: "/kitchen",
};

navigate(roleRouteMap[res.data.role] || "/login");


    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🍽️ Restaurant POS System

          </h1>
          <p className="text-sm text-gray-500">
            Admin • Cashier • Kitchen Login
          </p>
        </div>

        <div className="flex justify-between mb-6 text-sm text-gray-600">
          <div className="flex flex-col items-center">
            <span className="text-xl">👤</span>
            <span>Admin</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl">🧾</span>
            <span>Cashier</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl">👨‍🍳</span>
            <span>Kitchen</span>
          </div>
        </div>


        {/* {form} */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>

            <input

              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >


            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          Role will be detected automatically after login
        </p>

      </div>
    </div>
  );
};








export default Login;




