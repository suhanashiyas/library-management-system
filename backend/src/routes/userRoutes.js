const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Every user management route is admin-only
router.get("/", authMiddleware, adminMiddleware, getUsers);

router.get("/:id", authMiddleware, adminMiddleware, getUserById);

router.patch(
  "/:id/role",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
