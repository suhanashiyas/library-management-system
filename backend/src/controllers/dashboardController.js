const Book = require("../models/book");
const Borrow = require("../models/borrow");
const User = require("../models/user");

// Get Admin Dashboard Stats
const getAdminStats = async (req, res) => {
  try {
    const books = await Book.find();

    const totalTitles = books.length;

    const totalCopies = books.reduce(
      (total, book) => total + Number(book.quantity || 0),
      0
    );

    const availableCopies = books.reduce(
      (total, book) => total + Number(book.availableQuantity || 0),
      0
    );

    const borrowedCopies = totalCopies - availableCopies;

    const totalUsers = await User.countDocuments();

    const activeBorrowings = await Borrow.countDocuments({
      status: "borrowed",
    });

    const returnedBorrowings = await Borrow.countDocuments({
      status: "returned",
    });

    // Latest 5 borrow records, most recent first
    const recentBorrows = await Borrow.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("book", "title author");

    // Latest 5 books added to the library
    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Latest 5 registered users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Admin dashboard stats fetched successfully",
      stats: {
        totalTitles,
        totalCopies,
        availableCopies,
        borrowedCopies,
        totalUsers,
        activeBorrowings,
        returnedBorrowings,
      },
      recentBorrows,
      recentBooks,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get User Dashboard Stats (the logged-in user's own activity only)
const getUserStats = async (req, res) => {
  try {
    const totalBookTitles = await Book.countDocuments();

    const myActiveBorrows = await Borrow.countDocuments({
      user: req.user.id,
      status: "borrowed",
    });

    const myReturnedBorrows = await Borrow.countDocuments({
      user: req.user.id,
      status: "returned",
    });

    // Latest 5 of this user's own borrow records
    const recentActivity = await Borrow.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("book", "title author");

    res.status(200).json({
      message: "User dashboard stats fetched successfully",
      stats: {
        totalBookTitles,
        myActiveBorrows,
        myReturnedBorrows,
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAdminStats,
  getUserStats,
};
