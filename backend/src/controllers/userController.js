const mongoose = require("mongoose");
const User = require("../models/user");
const Borrow = require("../models/borrow");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET ALL USERS (with borrowing activity summary)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    // One aggregate query for borrow counts, instead of one query per user
    const borrowStats = await Borrow.aggregate([
      {
        $group: {
          _id: "$user",
          totalBorrows: { $sum: 1 },
          activeBorrows: {
            $sum: {
              $cond: [{ $eq: ["$status", "borrowed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsByUserId = new Map(
      borrowStats.map((stat) => [stat._id.toString(), stat])
    );

    const usersWithStats = users.map((user) => {
      const stats = statsByUserId.get(user._id.toString());

      return {
        ...user.toObject(),
        totalBorrows: stats ? stats.totalBorrows : 0,
        activeBorrows: stats ? stats.activeBorrows : 0,
      };
    });

    res.status(200).json({
      message: "Users fetched successfully",
      users: usersWithStats,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE USER (with borrow history)
const getUserById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const borrows = await Borrow.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("book", "title author");

    res.status(200).json({
      message: "User fetched successfully",
      user,
      borrows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'user' or 'admin'.",
      });
    }

    // Admins cannot promote/demote themselves — avoids accidental
    // self-lockout and keeps role changes auditable to a second admin.
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Admins cannot delete their own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const activeBorrows = await Borrow.countDocuments({
      user: user._id,
      status: "borrowed",
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        message:
          "Cannot delete this user — they have books currently borrowed.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
