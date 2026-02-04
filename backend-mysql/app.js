require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

/* ================== CORS (FINAL FIX) ================== */
const allowedOrigins = [
  "http://localhost:5173",                     // local frontend
  "http://localhost:3000",
  "https://restaurant-pos-beige.vercel.app"    // vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman / mobile apps ke liye
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
/* ====================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("./middlewares/responseLogger"));

/* ================= ROUTES ================= */
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
/* ========================================== */

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
