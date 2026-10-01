import { useEffect, useState } from "react";
import {
  FiSearch,
  FiAlertTriangle,
  FiBook,
  FiPlus,
  FiX,
  FiTrash2,
  FiImage,
  FiMinus,
  FiUploadCloud,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import * as bookService from "../services/bookService";
import { getCategories } from "../services/categoryService";
import { borrowBook } from "../services/borrowService";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, mirrors backend limit
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AvailabilityBadge = ({ book }) =>
  book.availableQuantity > 0 ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
      {book.availableQuantity} Available
    </span>
  ) : (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
      Out of stock
    </span>
  );

// Small reusable cover thumbnail — shows the book cover, or a placeholder
// icon (react-icons, never a hardcoded image) when none is set.
const BookCover = ({ src, alt, className = "" }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      className={`shrink-0 rounded-lg object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300 ${className}`}
    >
      <FiImage size={18} aria-hidden="true" />
    </div>
  );

const Books = () => {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [borrowingId, setBorrowingId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);
  const [viewBook, setViewBook] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      isbn: "",
      category: "",
      quantity: "",
    });
    setImageFile(null);
    setImagePreview("");
  };

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const fetchedBooks = await bookService.getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error(error);
      setLoadError(error.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch the admin-managed category list (drives the dropdowns below)
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooks();
    fetchCategories();
  }, []);

  // Form change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Nudge quantity up/down without breaking manual typing
  const adjustQuantity = (delta) => {
    const current = Number(form.quantity) || 0;
    const next = Math.max(1, current + delta);

    setForm({ ...form, quantity: String(next) });
  };

  // Cover image selection + client-side validation (backend re-validates too)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormError("Cover image must be a JPEG, PNG or WEBP file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError("Cover image must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Validate the add/edit form before sending it to the server
  const validateBookForm = () => {
    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.isbn.trim() ||
      !form.category.trim()
    ) {
      return "Please fill in all required fields.";
    }

    const quantityNumber = Number(form.quantity);

    if (
      form.quantity === "" ||
      !Number.isInteger(quantityNumber) ||
      quantityNumber < 1
    ) {
      return "Quantity must be a whole number of at least 1.";
    }

    return "";
  };

  // Add book
  const handleAddBook = async (e) => {
    e.preventDefault();

    const validationError = validateBookForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await bookService.createBook(
        {
          ...form,
          quantity: Number(form.quantity),
        },
        imageFile
      );

      setMessage("Book added successfully!");
      setMessageType("success");
      setShowAddModal(false);
      resetForm();

      fetchBooks();
    } catch (error) {
      console.error(error);
      setFormError(error.message || "Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // Start editing
  const startEdit = (book) => {
    setEditingBook(book);
    setFormError("");

    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: book.quantity,
    });
    setImageFile(null);
    setImagePreview(book.coverImage || "");
  };

  // Update book
  const handleUpdateBook = async (e) => {
    e.preventDefault();

    const validationError = validateBookForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await bookService.updateBook(
        editingBook._id,
        {
          ...form,
          quantity: Number(form.quantity),
        },
        imageFile
      );

      setMessage("Book updated successfully!");
      setMessageType("success");
      setEditingBook(null);
      resetForm();

      fetchBooks();
    } catch (error) {
      console.error(error);
      setFormError(error.message || "Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // Delete book
  const handleDeleteBook = async () => {
    try {
      setDeleting(true);
      setDeleteError("");

      await bookService.deleteBook(deleteBook._id);

      setMessage("Book deleted successfully!");
      setMessageType("success");
      setDeleteBook(null);

      fetchBooks();
    } catch (error) {
      console.error(error);
      setDeleteError(error.message || "Unable to connect to server");
    } finally {
      setDeleting(false);
    }
  };

  // Borrow book
  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowingId(bookId);
      setMessage("");

      await borrowBook(bookId);

      setMessage("Book borrowed successfully!");
      setMessageType("success");

      // Refresh availability
      fetchBooks();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setBorrowingId(null);
    }
  };

  // Search + category filter
  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      book.title.toLowerCase().includes(searchText) ||
      book.author.toLowerCase().includes(searchText) ||
      book.category.toLowerCase().includes(searchText) ||
      book.isbn.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "" || book.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
            Books
          </h1>

          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Browse and manage your library collection
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
          >
            <FiPlus size={15} aria-hidden="true" />
            Add Book
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          role={messageType === "success" ? "status" : "alert"}
          className={`rounded-lg border px-3.5 py-2 text-xs sm:text-sm ${
            messageType === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="books-search" className="sr-only">
            Search books
          </label>

          <span
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <FiSearch size={15} />
          </span>

          <input
            id="books-search"
            type="text"
            placeholder="Search by title, author, category or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <label htmlFor="books-category-filter" className="sr-only">
          Filter by category
        </label>

        <select
          id="books-category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-48"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        {(search || categoryFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
            }}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Books */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <FiAlertTriangle className="mx-auto text-red-500" size={26} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-red-700 sm:text-sm">
            Failed to load books
          </h2>

          <p className="mt-0.5 text-xs text-red-600">{loadError}</p>

          <button
            onClick={fetchBooks}
            className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div
          aria-busy="true"
          aria-label="Loading books"
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-3.5 py-3">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="hidden h-5 w-16 sm:block" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <FiBook className="mx-auto text-slate-300" size={32} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">
            {books.length === 0 ? "No books yet" : "No books found"}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {books.length === 0
              ? isAdmin
                ? "Add your first book to get started."
                : "There are no books in the library yet."
              : "Try adjusting your search or category filter."}
          </p>

          {books.length > 0 && (search || categoryFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("");
              }}
              className="mt-3 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile / tablet card list */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <BookCover
                      src={book.coverImage}
                      alt={book.title}
                      className="h-12 w-9 text-base"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                        {book.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {book.author}
                      </p>
                    </div>
                  </div>

                  <AvailabilityBadge book={book} />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600">
                    {book.category}
                  </span>

                  <span>ISBN: {book.isbn}</span>
                  <span>· Qty: {book.quantity}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setViewBook(book)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    View
                  </button>

                  {book.availableQuantity > 0 && (
                    <button
                      onClick={() => handleBorrowBook(book._id)}
                      disabled={borrowingId === book._id}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {borrowingId === book._id ? "Borrowing..." : "Borrow"}
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => startEdit(book)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteBook(book)}
                        className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Book
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      ISBN
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Availability
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => (
                    <tr
                      key={book._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <BookCover
                            src={book.coverImage}
                            alt={book.title}
                            className="h-11 w-8 text-sm"
                          />

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {book.title}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                          {book.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {book.isbn}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                        {book.quantity}
                      </td>

                      <td className="px-4 py-3.5">
                        <AvailabilityBadge book={book} />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setViewBook(book)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            View
                          </button>

                          {book.availableQuantity > 0 && (
                            <button
                              onClick={() => handleBorrowBook(book._id)}
                              disabled={borrowingId === book._id}
                              className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {borrowingId === book._id
                                ? "Borrowing..."
                                : "Borrow"}
                            </button>
                          )}

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => startEdit(book)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => setDeleteBook(book)}
                                className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-form-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="book-form-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {editingBook
                    ? "Update book information"
                    : "Add a new book to your library"}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBook(null);
                  setFormError("");
                  resetForm();
                }}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={
                editingBook ? handleUpdateBook : handleAddBook
              }
              className="space-y-3.5"
              noValidate
            >
              {formError && (
                <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="book-title"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Title
                </label>

                <input
                  id="book-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Book title"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-author"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Author
                </label>

                <input
                  id="book-author"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Author"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-isbn"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  ISBN
                </label>

                <input
                  id="book-isbn"
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  placeholder="ISBN"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-category"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="book-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="" disabled>
                    {categories.length === 0
                      ? "No categories available"
                      : "Select a category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {isAdmin && categories.length === 0 && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    No categories yet — add one from Settings first.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="book-quantity"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Quantity
                </label>

                <div className="flex items-stretch gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(-1)}
                    aria-label="Decrease quantity"
                    className="flex w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  >
                    <FiMinus size={14} aria-hidden="true" />
                  </button>

                  <input
                    id="book-quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Quantity"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-center text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() => adjustQuantity(1)}
                    aria-label="Increase quantity"
                    className="flex w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  >
                    <FiPlus size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="book-cover-image"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Cover Image
                </label>

                <div className="flex items-center gap-3">
                  <BookCover
                    src={imagePreview}
                    alt="Cover preview"
                    className="h-16 w-12 text-lg"
                  />

                  <label
                    htmlFor="book-cover-image"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 sm:text-sm"
                  >
                    <FiUploadCloud size={15} aria-hidden="true" />
                    {imageFile ? imageFile.name : "Upload image"}
                  </label>

                  <input
                    id="book-cover-image"
                    name="coverImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  JPEG, PNG or WEBP, up to 5MB. Optional.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBook(null);
                    setFormError("");
                    resetForm();
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? editingBook
                      ? "Saving..."
                      : "Adding..."
                    : editingBook
                    ? "Save Changes"
                    : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-book-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FiTrash2 size={18} aria-hidden="true" />
            </div>

            <h2
              id="delete-book-title"
              className="text-lg font-bold text-slate-900"
            >
              Delete this book?
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>{deleteBook.title}</strong>? This action cannot
              be undone.
            </p>

            {deleteError && (
              <div role="alert" className="mt-3.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {deleteError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setDeleteBook(null);
                  setDeleteError("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteBook}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Book */}
      {viewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-book-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <BookCover
                  src={viewBook.coverImage}
                  alt={viewBook.title}
                  className="h-20 w-14 text-2xl"
                />

                <div>
                  <h2
                    id="view-book-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    {viewBook.title}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {viewBook.author}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewBook(null)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                {viewBook.category}
              </span>

              <AvailabilityBadge book={viewBook} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">ISBN</p>

                <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                  {viewBook.isbn}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total Copies</p>

                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {viewBook.quantity}
                </p>
              </div>
            </div>

            {(viewBook.publisher || viewBook.publishedYear) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {viewBook.publisher && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Publisher</p>

                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                      {viewBook.publisher}
                    </p>
                  </div>
                )}

                {viewBook.publishedYear && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Published Year
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                      {viewBook.publishedYear}
                    </p>
                  </div>
                )}
              </div>
            )}

            {viewBook.description && (
              <div className="mt-3">
                <p className="text-xs text-slate-500">Description</p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {viewBook.description}
                </p>
              </div>
            )}

            {viewBook.createdAt && (
              <p className="mt-4 text-xs text-slate-400">
                Added on {formatDate(viewBook.createdAt)}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setViewBook(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    startEdit(viewBook);
                    setViewBook(null);
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Edit Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
