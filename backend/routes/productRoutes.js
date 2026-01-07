const express = require("express");
const router = express.Router();


const auth = require("../middlewares/authMiddleware");
// const role = require("../middlewares/roleMiddleware");
const upload = require("../config/multer");
const permit = require("../middlewares/permissionMiddleware");

const { createProduct,
    getProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");


// Create Product Admin only
router.post(
    "/",
    auth,
    permit("products.create"), // role("admin"),
    upload.single("image"),
    createProduct
);

// Get Products (Admin / Cashier / Kitchen)
router.get(
    "/",
    auth,
    permit("products.read"), // role("admin", "kitchen", "cashier"),
    getProducts
);


// UPDATE PRODUCT (Admin only )
router.put(
    "/:id",
    auth,
    permit("products.update"), // role("admin"),
    upload.single("image"),
    updateProduct
);


// DELETE PRODUCT (Admin only )
router.delete(
    "/:id",
    auth,
    permit("products.delete"), //role("admin"),
    deleteProduct
);

module.exports = router;
