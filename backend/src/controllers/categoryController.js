const mongoose = require("mongoose");
const Category = require("../models/category");
const Book = require("../models/book");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Escape user input before dropping it into a RegExp
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Category name is required.",
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 50) {
      return res.status(400).json({
        message: "Category name must be 50 characters or fewer.",
      });
    }

    const existing = await Category.findOne({
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    });

    if (existing) {
      return res.status(400).json({
        message: "A category with this name already exists.",
      });
    }

    const category = await Category.create({ name: trimmedName });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A category with this name already exists.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }

    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Category name is required.",
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 50) {
      return res.status(400).json({
        message: "Category name must be 50 characters or fewer.",
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (trimmedName.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
      });

      if (duplicate) {
        return res.status(400).json({
          message: "A category with this name already exists.",
        });
      }
    }

    const previousName = category.name;
    category.name = trimmedName;
    await category.save();

    // Keep existing books pointed at the renamed category
    if (previousName !== trimmedName) {
      await Book.updateMany(
        { category: previousName },
        { category: trimmedName }
      );
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A category with this name already exists.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const booksUsingCategory = await Book.countDocuments({
      category: category.name,
    });

    if (booksUsingCategory > 0) {
      return res.status(400).json({
        message: `Cannot delete this category — ${booksUsingCategory} ${
          booksUsingCategory === 1 ? "book uses" : "books use"
        } it.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
