const express = require("express");

const router = express.Router();

const {
  borrowBook,
  returnBook,
  getMyBorrowHistory,
  getAllBorrows,
} = require("../controllers/borrowController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, borrowBook);

router.put("/return", authMiddleware, returnBook);

router.get("/my", authMiddleware, getMyBorrowHistory);

// Admin-only: view every borrow record in the system
router.get("/admin", authMiddleware, adminMiddleware, getAllBorrows);

module.exports = router;