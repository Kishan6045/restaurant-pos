require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

/* ================== CORS (FINAL & WORKING) ==================
   ✔ Localhost
   ✔ Vercel
   ✔ Postman
   ✔ Browser
============================================================== */
app.use(
  cors({
    origin: true,        // 🔥 jo origin request karega wahi allow
    credentials: true,
  })
);

/* ================== PARSERS ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================== LOGGER ================== */
app.use(require("./middlewares/responseLogger"));

/* ================== ROUTES ================== */
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

/* ================== HEALTH ================== */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend Running (CORS OK)",
  });
});

module.exports = app;
