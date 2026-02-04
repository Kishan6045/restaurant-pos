require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

/* ------------------ CORS ------------------ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ------------------ PARSERS ------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------ LOGGER ------------------ */
app.use(require("./middlewares/responseLogger"));

/* ------------------ ROUTES ------------------ */
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

/* ------------------ HEALTH ------------------ */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SQL Backend Running" });
});

/* ------------------ START ------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
