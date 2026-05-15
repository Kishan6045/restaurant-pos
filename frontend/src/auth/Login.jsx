import { useState, useEffect } from "react";
import api from "../utils/axios"; // Axios instance (baseURL + interceptors configured)
import { useNavigate } from "react-router-dom";  // React Router hooks for navigation & current route
import { toast } from "react-toastify";  // Toast notifications (success / error)
import { FiEye, FiEyeOff } from "react-icons/fi"; // Icons for show / hide password

import Loader from "../components/Loader";  // Reusable loader component

const Login = () => {
  const navigate = useNavigate(); // page reload kiye bina admin ya koi bhi page me redirect 

  // Form state (controlled inputs)
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Login API call loading state
  const [loading, setLoading] = useState(false);

  // Initial session check loader (page load)
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ===============================
  // AUTO REDIRECT IF USER IS LOGGED IN
  // ===============================
  // useEffect(() => {
  //   // Check tokens & role from localStorage
  //   // const accessToken = localStorage.getItem("accessToken");
  //   const role = localStorage.getItem("role");

  //   // Role-based dashboard mapping
  //   const roleRouteMap = {
  //     admin: "/admin",
  //     cashier: "/cashier",
  //     kitchen: "/kitchen",
  //   };

  //   // If user already logged in and on login/root page
  //   if (
  //     accessToken &&
  //     role &&
  //     roleRouteMap[role] &&
  //     (location.pathname === "/login" || location.pathname === "/")
  //   ) {
  //     // Redirect directly to role dashboard
  //     navigate(roleRouteMap[role], { replace: true });
  //   }

  //   // Stop session-check loader in all cases
  //   setCheckingAuth(false);
  // }, [navigate, location.pathname]);
  useEffect(() => {
  const role = localStorage.getItem("role");

  const roleRouteMap = {
    admin: "/admin",
    cashier: "/cashier",
    kitchen: "/kitchen",
  };

  const refreshToken = localStorage.getItem("refreshToken");

  // 1️⃣ Try silent refresh FIRST (backend expects refreshToken in body)
  api
    .post(
      "/api/auth/refresh",
      refreshToken ? { refreshToken } : {},
      { skipAuthRefresh: true }
    )
    .then((res) => {
      // 2️⃣ New access token mil gaya
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }

      if (role && roleRouteMap[role]) {
        navigate(roleRouteMap[role], { replace: true });
      }
    })
    .catch(() => {
      // 3️⃣ Refresh bhi fail → real logout
      localStorage.clear();
    })
    .finally(() => {
      setCheckingAuth(false);
    });
}, [navigate]);


  // ===============================
  // FULL SCREEN LOADER WHILE CHECKING SESSION
  // ===============================
  if (checkingAuth) {
    return (
      <Loader
        label="Checking session..."
        containerClassName="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50"
        spinnerClassName="text-indigo-600"
      />
    );
  }

  // ===============================
  // INPUT CHANGE HANDLER (EMAIL / PASSWORD)
  // ===============================
  const handleChange = (e) => {
    // Update specific field using input name
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================
  // LOGIN FORM SUBMIT HANDLER
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Enable button loader

    try {
      // Login API call
      const res = await api.post("/api/auth/login", form, {
        skipAuthRefresh: true, // Prevent interceptor refresh loop
      });

      // Save tokens & role for session handling
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      localStorage.setItem("role", res.data.role);
      if (res.data.role === "cashier") {
        localStorage.setItem("assignedFloor", res.data.assignedFloor || "");
      } else {
        localStorage.removeItem("assignedFloor");
      }

      // Success notification
      toast.success("Login successful");

      // Role-based redirect after login
      const roleRouteMap = {
        admin: "/admin",
        cashier: "/cashier",
        kitchen: "/kitchen",
      };

      navigate(roleRouteMap[res.data.role] || "/login");
    } catch (error) {
      // Extract backend error message safely
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";

      toast.error(msg);
    } finally {
      // Disable loader in both success & error
      setLoading(false);
    }
  };

  // ===============================
  // UI START
  // ===============================
  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/70">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 shadow-card-lg ring-1 ring-slate-900/5 md:grid-cols-2">

          {/* LEFT PANEL – Branding & Roles (Desktop only) */}
          <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 text-white md:flex">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-base font-semibold ring-1 ring-white/20">
                  RS
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                    Hotel
                  </p>
                  <p className="text-xl font-semibold">Royal Shiv</p>
                </div>
              </div>
            </div>

            {/* Role descriptions */}
            <div className="space-y-4">
              {/* Admin */}
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-200">
                  AD
                </div>
                <div>
                  <p className="text-sm font-semibold">Admin</p>
                  <p className="text-xs text-slate-300">
                    Control staff access and reports
                  </p>
                </div>
              </div>

              {/* Cashier */}
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/25 text-xs font-semibold text-indigo-200">
                  CA
                </div>
                <div>
                  <p className="text-sm font-semibold">Cashier</p>
                  <p className="text-xs text-slate-300">
                    Faster billing and table management
                  </p>
                </div>
              </div>

              {/* Kitchen */}
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-200">
                  KT
                </div>
                <div>
                  <p className="text-sm font-semibold">Kitchen</p>
                  <p className="text-xs text-slate-300">
                    Live order updates in one place
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Role-based access - Secure session handling
            </p>
          </div>

          {/* RIGHT PANEL – LOGIN FORM */}
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white text-lg font-semibold shadow-lg shadow-indigo-900/25">
                RS
              </div>
              <span className="mt-5 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-800 ring-1 ring-indigo-100">
                Welcome back
              </span>
              <h1 className="mt-4 text-3xl font-bold text-slate-800">
                RS Hotel POS
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Admin / Cashier / Kitchen Login
              </p>
            </div>

            {/* Login Form */}
            <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email Field */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600">
                      @
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-600">
                      KEY
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="********"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-16 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                      required
                    />

                    {/* Show / Hide Password Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800"
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-800 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:from-indigo-700 hover:via-indigo-700 hover:to-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
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

            <p className="mt-6 text-center text-xs text-slate-400">
              Role will be detected automatically after login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
