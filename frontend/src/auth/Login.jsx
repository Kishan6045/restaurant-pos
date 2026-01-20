import { useState, useEffect } from "react";
import api from "../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";


const Login = () => {
  const navigate = useNavigate();
    const location = useLocation();   
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // page load check


  //  AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    const role = localStorage.getItem("role");

    const roleRouteMap = {
      admin: "/admin",
      cashier: "/cashier",
      kitchen: "/kitchen",
    };

    if (
      refreshToken &&
      role &&
      roleRouteMap[role] &&
      (location.pathname === "/login" || location.pathname === "/")
    ) {
      navigate(roleRouteMap[role], { replace: true });
    }

    // ✅ HAR CASE me loader band
    setCheckingAuth(false);
  }, [navigate, location.pathname]);

  // 🔄 Loader while checking session
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center rounded-2xl bg-white/80 px-8 py-6 shadow-lg ring-1 ring-black/5">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-white/95 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur sm:p-10">
          <div className="text-center mb-8">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Welcome back
            </span>
            <h1 className="mt-4 text-3xl font-bold text-gray-800">
              🍽️ Restaurant POS System
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Admin • Cashier • Kitchen Login
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8 text-xs text-gray-600">
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2">
              <span className="text-lg">👤</span>
              <span className="font-medium">Admin</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2">
              <span className="text-lg">🧾</span>
              <span className="font-medium">Cashier</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2">
              <span className="text-lg">👨‍🍳</span>
              <span className="font-medium">Kitchen</span>
            </div>
          </div>

          {/* {form} */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Role will be detected automatically after login
          </p>
        </div>
      </div>
    </div>
  );
};








export default Login;




