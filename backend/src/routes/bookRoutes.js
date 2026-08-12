const express = require("express");

const router = express.Router();

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const uploadCoverImage = require("../middleware/uploadMiddleware");

// Anyone logged in can view books
router.get("/", authMiddleware, getBooks);

router.get("/:id", authMiddleware, getBookById);

// Only admins can create books
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadCoverImage,
  createBook
);

// Only admins can update books
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadCoverImage,
  updateBook
);

// Only admins can delete books
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteBook
);

module.exports = router;