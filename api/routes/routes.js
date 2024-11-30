const express = require("express");
const multer = require("multer");
const { register, login } = require("../controllers/authController");
const { getCategories, addCategory, updateCategory, deleteCategory, } = require("../controllers/categoryController");
const { getUserById, updateProfilePicture, getMe, getAddress, addAddress } = require("../controllers/userController");
const { getAllProducts, getProduct, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { addToCart, getCart, updateCartItem, removeCartItem, mergeCart, clearCart  } = require("../controllers/cartController")
const { createOrder, getOrders, getAllOrdersWithDetails } = require("../controllers/orderController"); // Import order controller
// const { manageProducts, addProduct, editProduct, deleteProduct } = require("../controllers/adminController");

const { verifyToken, verifyAdmin } = require("../middleware/middleware"); // Import middleware correctly


const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

// Auth Routes
router.post("/auth/register", register);
router.post("/auth/login", login);

// User Routes
router.get("/users/me", verifyToken, getMe); // Prioritize this route
router.get("/users/:id", getUserById); // This route must come after /users/me

// Product Routes
// router.post("/products", upload.single("image"), addProduct);
router.get("/products", getAllProducts);
router.get("/products/:id", getProduct)


// Profile Picture Route
router.post("/users/:id/profile-picture", upload.single("profilePicture"), updateProfilePicture);

// Address Routes
router.get("/addresses", verifyToken, getAddress);
router.post("/addresses", verifyToken, addAddress);

//Categories Routes
router.get("/categories", getCategories);

// Cart Routes
router.post("/cart/add", verifyToken, addToCart); // Add item to cart
router.get("/cart", verifyToken, getCart); // Get cart items
router.patch("/cart/update", verifyToken, updateCartItem); // Update cart item quantity
router.delete("/cart/remove", verifyToken, removeCartItem); // Remove cart item
router.post("/cart/merge", verifyToken, mergeCart);
router.delete("/cart/clear", verifyToken, clearCart);

// Orders Routes
router.post("/orders", verifyToken, createOrder); // Create a new order
router.get("/orders", verifyToken, getOrders);

// Admin-specific product routes
router.post("/admin/products", verifyToken, verifyAdmin, upload.single("image"), addProduct);
router.patch("/admin/products/:id", verifyToken, verifyAdmin, upload.single("image"), updateProduct);
router.put("/admin/products/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/admin/products/:id", verifyToken, verifyAdmin, deleteProduct);

router.get("/admin/categories", verifyToken, verifyAdmin, getCategories);
router.post("/admin/categories", verifyToken, verifyAdmin, addCategory);
router.put("/admin/categories/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/admin/categories/:id", verifyToken, verifyAdmin, deleteCategory);

router.get("/admin/orders", verifyToken, verifyAdmin, getAllOrdersWithDetails);

module.exports = router;
