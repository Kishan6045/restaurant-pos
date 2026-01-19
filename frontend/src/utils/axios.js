import axios from "axios";
import { log, logError } from "./logger"; // console print karava mate

const { VITE_API_URL, VITE_LOCAL, PROD, DEV } = import.meta.env;
const FALLBACK_DEV_URL = "http://localhost:5000";

const BASE_URL = PROD
    ? VITE_API_URL // production
    : VITE_LOCAL || VITE_API_URL || (DEV ? FALLBACK_DEV_URL : undefined); // local

if (!BASE_URL) {
    logError("API BASE_URL missing", { VITE_API_URL, VITE_LOCAL, PROD });
}

const api = axios.create({
    baseURL: BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// (Interceptor ka matlab) -- Har request backend pe jaane se pehle yahan se guzregi
api.interceptors.request.use(
    (config) => {
        log("API REQUEST", {
            method: config.method?.toUpperCase(),
            url: config.url,
        });

        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// AUto refresh token
api.interceptors.response.use(
    (response) => {
        log("API RESPONSE", {
            url: response.config.url,
            status: response.status,
            message: response.data?.message,
        });
        return response;
    },
    async (error) => {
        logError("API ERROR", {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message,
            data: error.response?.data,
        });

        const originalRequest = error.config;

        // Agar access token expire ho gaya ho
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            // refresh token hi nahi hai → force logout
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            /*  Already refreshing → queue request */
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
                //refresh API call
                const res = await axios.post(
                    `${BASE_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                // new token save
                localStorage.setItem("accessToken", res.data.accessToken);
                localStorage.setItem("refreshToken", res.data.refreshToken);

                processQueue(null, res.data.accessToken);

                // retry original request
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return api(originalRequest);

            } catch (err) {
                processQueue(err, null);
                // refresh token bhi expire → logout
                // ❗ Sirf tab logout jab refresh token hi invalid ho
                if (err.response?.status === 401 && !isRefreshing) {
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