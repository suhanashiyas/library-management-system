const mongoose = require("mongoose");
const Book = require("../models/book");
const Borrow = require("../models/borrow");
const Category = require("../models/category");
const { uploadImage, deleteImage } = require("../services/spacesService");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Categories must come from the managed list, not arbitrary client text
const findCategoryByName = (name) =>
  Category.findOne({ name: new RegExp(`^${escapeRegex(name.trim())}$`, "i") });

// CREATE BOOK
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      quantity,
    } = req.body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !isbn?.trim() ||
      !category?.trim()
    ) {
      return res.status(400).json({
        message: "Title, author, ISBN and category are required.",
      });
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a whole number of at least 1.",
      });
    }

    const matchedCategory = await findCategoryByName(category);

    if (!matchedCategory) {
      return res.status(400).json({
        message: "Please select a valid category.",
      });
    }

    const existingBook = await Book.findOne({ isbn: isbn.trim() });

    if (existingBook) {
      return res.status(400).json({
        message: "Book with this ISBN already exists",
      });
    }

    let coverImage = "";
    let coverImageKey = "";

    if (req.file) {
      try {
        const uploaded = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        coverImage = uploaded.url;
        coverImageKey = uploaded.key;
      } catch (uploadError) {
        console.error(uploadError);

        return res.status(500).json({
          message: "Failed to upload cover image. Please try again.",
        });
      }
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category: matchedCategory.name,
      quantity: parsedQuantity,
      availableQuantity: parsedQuantity,
      coverImage,
      coverImageKey,
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL BOOKS
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json({
      message: "Books fetched successfully",
      books,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE BOOK
const getBookById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book fetched successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Book
const updateBook = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    const { title, author, isbn, category, quantity } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Only validate/replace fields that were actually sent
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty." });
      }
      book.title = title.trim();
    }

    if (author !== undefined) {
      if (!author.trim()) {
        return res.status(400).json({ message: "Author cannot be empty." });
      }
      book.author = author.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({ message: "Category cannot be empty." });
      }

      const matchedCategory = await findCategoryByName(category);

      if (!matchedCategory) {
        return res.status(400).json({
          message: "Please select a valid category.",
        });
      }

      book.category = matchedCategory.name;
    }

    if (isbn !== undefined) {
      if (!isbn.trim()) {
        return res.status(400).json({ message: "ISBN cannot be empty." });
      }

      if (isbn.trim() !== book.isbn) {
        const duplicate = await Book.findOne({
          isbn: isbn.trim(),
          _id: { $ne: book._id },
        });

        if (duplicate) {
          return res.status(400).json({
            message: "A book with this ISBN already exists.",
          });
        }
      }

      book.isbn = isbn.trim();
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          message: "Quantity must be a whole number of 0 or more.",
        });
      }

      // Copies currently out on loan can't just disappear when the
      // total quantity is reduced.
      const currentlyBorrowed = book.quantity - book.availableQuantity;

      if (parsedQuantity < currentlyBorrowed) {
        return res.status(400).json({
          message: `Cannot set quantity below ${currentlyBorrowed} — ${currentlyBorrowed} ${
            currentlyBorrowed === 1 ? "copy is" : "copies are"
          } currently borrowed.`,
        });
      }

      book.quantity = parsedQuantity;
      book.availableQuantity = parsedQuantity - currentlyBorrowed;
    }

    let previousCoverImageKey = "";

    if (req.file) {
      try {
        const uploaded = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        previousCoverImageKey = book.coverImageKey;
        book.coverImage = uploaded.url;
        book.coverImageKey = uploaded.key;
      } catch (uploadError) {
        console.error(uploadError);

        return res.status(500).json({
          message: "Failed to upload cover image. Please try again.",
        });
      }
    }

    await book.save();

    // Only remove the old image once the new one is safely saved
    if (previousCoverImageKey) {
      deleteImage(previousCoverImageKey);
    }

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const activeBorrows = await Borrow.countDocuments({
      book: book._id,
      status: "borrowed",
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        message:
          "Cannot delete this book — it has copies currently borrowed.",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    if (book.coverImageKey) {
      deleteImage(book.coverImageKey);
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};