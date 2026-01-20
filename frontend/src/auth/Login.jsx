import { useState, useEffect } from "react";
import api from "../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="flex flex-col items-center rounded-2xl bg-white/80 px-8 py-6 shadow-xl ring-1 ring-black/5">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            Checking session...
          </p>
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-black/5 md:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white md:flex">
            <div>
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span className="text-2xl">🍽️</span>
                <span>Restaurant POS</span>
              </div>
              <p className="mt-3 text-sm text-blue-100">
                Secure access for every role in your restaurant.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm font-semibold">Admin</p>
                  <p className="text-xs text-blue-100">
                    Monitor staff, reports, and products
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="text-2xl">🧾</span>
                <div>
                  <p className="text-sm font-semibold">Cashier</p>
                  <p className="text-xs text-blue-100">
                    Quick billing and table management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="text-2xl">👨‍🍳</span>
                <div>
                  <p className="text-sm font-semibold">Kitchen</p>
                  <p className="text-xs text-blue-100">
                    Live order updates in one place
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-blue-100">
              Role-based access • Secure session handling
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Welcome back
              </span>
              <h1 className="mt-4 text-3xl font-bold text-gray-800">
                Restaurant POS System
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Admin • Cashier • Kitchen Login
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {/* {form} */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                      📧
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                      🔒
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-16 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              Role will be detected automatically after login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};








export default Login;




