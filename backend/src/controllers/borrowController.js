const mongoose = require("mongoose");
const Borrow = require("../models/borrow");
const Book = require("../models/book");

// Borrow / Issue Book
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "A valid bookId is required.",
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Check if user already has this book (checked before availability so
    // the message stays accurate even when they hold the last copy)
    const existingBorrow = await Borrow.findOne({
      user: req.user.id,
      book: bookId,
      status: "borrowed",
    });

    if (existingBorrow) {
      return res.status(400).json({
        message: "You have already borrowed this book",
      });
    }

    // Check book availability
    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        message: "Book is not available",
      });
    }

    // Create borrowing record
    const borrow = await Borrow.create({
      user: req.user.id,
      book: bookId,
    });

    // Decrease available quantity
    book.availableQuantity -= 1;

    await book.save();

    res.status(201).json({
      message: "Book borrowed successfully",
      borrow,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Return Book
const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.body;

    if (!borrowId || !mongoose.Types.ObjectId.isValid(borrowId)) {
      return res.status(400).json({
        message: "A valid borrowId is required.",
      });
    }

    // Find borrow record
    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        message: "Borrow record not found",
      });
    }

    // Only the person who borrowed the book can return it
    if (borrow.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to return this borrowing.",
      });
    }

    // Check if already returned
    if (borrow.status === "returned") {
      return res.status(400).json({
        message: "Book has already been returned",
      });
    }

    // Find the book
    const book = await Book.findById(borrow.book);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Update borrow record
    borrow.status = "returned";
    borrow.returnDate = new Date();

    await borrow.save();

    // Increase available quantity, never above the book's total quantity
    book.availableQuantity = Math.min(
      book.availableQuantity + 1,
      book.quantity
    );

    await book.save();

    res.status(200).json({
      message: "Book returned successfully",
      borrow,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Borrow History
const getMyBorrowHistory = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      user: req.user.id,
    }).populate("book");

    res.status(200).json({
      message: "Borrow history fetched successfully",
      borrows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Borrow Records (admin only)
const getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("book", "title author");

    res.status(200).json({
      message: "Borrow records fetched successfully",
      borrows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getMyBorrowHistory,
  getAllBorrows,
};