import axios from "axios";
import { log, logError } from "./logger"; // console logging utility

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------------------------------------------------
   Axios instance
--------------------------------------------------- */

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔐 IMPORTANT: cookies (refresh token) allow
});

/* ---------------------------------------------------
   Variables for refresh token queue handling
--------------------------------------------------- */

let isRefreshing = false; // refresh call already running or not
let failedQueue = [];    // failed requests queue

// Queue clear / resolve karva mate helper
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/* ---------------------------------------------------
   REQUEST INTERCEPTOR
   (Har request backend par jata pehle yahan aavse)
--------------------------------------------------- */

api.interceptors.request.use(
  (config) => {
    log("API REQUEST", {
      method: config.method?.toUpperCase(),
      url: config.url,
    });

    // Access token localStorage mathi laiye
    const accessToken = localStorage.getItem("accessToken");

    // Access token hoy to Authorization header ma mukiye
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------------------
   RESPONSE INTERCEPTOR
   (Response / Error handle karse)
--------------------------------------------------- */

api.interceptors.response.use(
  // ✅ Success response
  (response) => {
    log("API RESPONSE", {
      url: response.config.url,
      status: response.status,
      message: response.data?.message,
    });
    return response;
  },

  // ❌ Error response
  async (error) => {
    logError("API ERROR", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
    });

    const originalRequest = error.config;

    // Login / Refresh route par auto refresh skip karvo
    const shouldSkipAuthRefresh =
      originalRequest?.skipAuthRefresh ||
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/refresh");

    /* ---------------------------------------------------
       401 Unauthorized → Access token expired
    --------------------------------------------------- */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipAuthRefresh
    ) {
      originalRequest._retry = true;

      /* ---------------------------------------------
         Agar already refresh call chal rahi hoy
         → request queue ma muki do
      --------------------------------------------- */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        /* ---------------------------------------------
           REFRESH TOKEN API (token in JSON body)
        --------------------------------------------- */
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        // New access token save
        localStorage.setItem("accessToken", newAccessToken);
        if (res.data.refreshToken) {
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }

        // Queue ma badha failed requests retry
        processQueue(null, newAccessToken);

        // Original request retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (err) {
        // Refresh token invalid / expired
        processQueue(err, null);

        if (err.response?.status === 401) {
          // Force logout
          localStorage.clear();
          window.location.href = "/login";
        }

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
