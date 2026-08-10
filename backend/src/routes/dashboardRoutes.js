const express = require("express");

const router = express.Router();

const {
  getAdminStats,
  getUserStats,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Only admins can view system-wide dashboard statistics
router.get("/admin", authMiddleware, adminMiddleware, getAdminStats);

// Any logged-in user can view their own dashboard statistics
router.get("/user", authMiddleware, getUserStats);

module.exports = router;
