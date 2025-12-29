require("dotenv").config();

const express = require("express");
const cors = require("cors");  // frontend and backend request kar ne ka allow kar ta hai

const app = express();


//middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes
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



// local page
app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Backend Running"
    });
});


// error ho to niche wala routes run
app.use((req, res) => {
    res.status(404).json({
        message: "API not found"
    });
});



module.exports = app;