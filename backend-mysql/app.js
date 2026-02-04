require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ============ CORS (FIXED) ============ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//IMPORTANT: OPTIONS handler
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
/* ===================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("./middlewares/responseLogger"));

/* ============ ROUTES ============ */
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
/* ================================ */

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend Running" });
});

module.exports = app;
