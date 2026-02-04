require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ============ CORS (LOCAL + PROD WORKING) ============ */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://restaurant-pos-beige.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / curl / server-side requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 VERY IMPORTANT: preflight fix
app.options("*", cors());
/* ==================================================== */

/* ----------- PARSERS ----------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------- LOGGER ----------- */
app.use(require("./middlewares/responseLogger"));

/* ----------- ROUTES ----------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/cashier", require("./routes/cashierRoutes"));
app.use("/api/kitchen", require("./routes/kitchenRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/permissions", require("./routes/permissionRoutes"));
/* ------------------------------- */

/* ----------- HEALTH CHECK ----------- */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend Running" });
});

module.exports = app;
