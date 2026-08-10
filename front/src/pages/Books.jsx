import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { API_BASE_URL } from "../config";

const Books = () => {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
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

  const getToken = () => localStorage.getItem("token");

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(`${API_BASE_URL}/api/books`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.message || "Failed to fetch books");
        return;
      }

      setBooks(data.books || []);
    } catch (error) {
      console.error(error);
      setLoadError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Form change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Failed to add book");
        return;
      }

      setMessage("Book added successfully!");
      setMessageType("success");
      setShowAddModal(false);

      setForm({
        title: "",
        author: "",
        isbn: "",
        category: "",
        quantity: "",
      });

      fetchBooks();
    } catch (error) {
      console.error(error);
      setFormError("Unable to connect to server");
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

      const response = await fetch(
        `${API_BASE_URL}/api/books/${editingBook._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Failed to update book");
        return;
      }

      setMessage("Book updated successfully!");
      setMessageType("success");
      setEditingBook(null);

      setForm({
        title: "",
        author: "",
        isbn: "",
        category: "",
        quantity: "",
      });

      fetchBooks();
    } catch (error) {
      console.error(error);
      setFormError("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // Delete book
  const handleDeleteBook = async () => {
    try {
      setDeleting(true);
      setDeleteError("");

      const response = await fetch(
        `${API_BASE_URL}/api/books/${deleteBook._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.message || "Failed to delete book");
        return;
      }

      setMessage("Book deleted successfully!");
      setMessageType("success");
      setDeleteBook(null);

      fetchBooks();
    } catch (error) {
      console.error(error);
      setDeleteError("Unable to connect to server");
    } finally {
      setDeleting(false);
    }
  };

  // Borrow book
  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowingId(bookId);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/api/borrows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          bookId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to borrow book");
        setMessageType("error");
        return;
      }

      setMessage("Book borrowed successfully!");
      setMessageType("success");

      // Refresh availability
      fetchBooks();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
      setMessageType("error");
    } finally {
      setBorrowingId(null);
    }
  };

  // Available categories, derived from the full book list (not the filtered one)
  const categories = [...new Set(books.map((book) => book.category))].sort();

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
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Books
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Browse and manage your library collection
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Add Book
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          role={messageType === "success" ? "status" : "alert"}
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="books-search" className="sr-only">
            Search books
          </label>

          <span
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            🔍
          </span>

          <input
            id="books-search"
            type="text"
            placeholder="Search by title, author, category or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <label htmlFor="books-category-filter" className="sr-only">
          Filter by category
        </label>

        <select
          id="books-category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-56"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {(search || categoryFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
            }}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Books */}
      {loadError ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-12 text-center">
          <div className="mb-3 text-4xl">⚠️</div>

          <h2 className="font-semibold text-red-700">
            Failed to load books
          </h2>

          <p className="mt-1 text-sm text-red-600">{loadError}</p>

          <button
            onClick={fetchBooks}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div
          aria-busy="true"
          aria-label="Loading books"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-6 py-5">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mb-3 text-5xl">📚</div>

          <h2 className="font-semibold text-slate-900">
            {books.length === 0 ? "No books yet" : "No books found"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
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
              className="mt-4 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Book
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ISBN
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Availability
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {book.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {book.author}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                        {book.category}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {book.isbn}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {book.quantity}
                    </td>

                    <td className="px-6 py-5">
                      {book.availableQuantity > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          {book.availableQuantity} Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Out of stock
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setViewBook(book)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          View
                        </button>

                        {book.availableQuantity > 0 && (
                          <button
                            onClick={() => handleBorrowBook(book._id)}
                            disabled={borrowingId === book._id}
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteBook(book)}
                              className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
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
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="book-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
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
                }}
                aria-label="Close"
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <form
              onSubmit={
                editingBook ? handleUpdateBook : handleAddBook
              }
              className="space-y-4"
              noValidate
            >
              {formError && (
                <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="book-title"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-author"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-isbn"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <input
                  id="book-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Category"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="book-quantity"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Quantity
                </label>

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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBook(null);
                    setFormError("");
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl">
              🗑️
            </div>

            <h2
              id="delete-book-title"
              className="text-xl font-bold text-slate-900"
            >
              Delete this book?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>{deleteBook.title}</strong>? This action cannot
              be undone.
            </p>

            {deleteError && (
              <div role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteBook(null);
                  setDeleteError("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteBook}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="view-book-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {viewBook.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {viewBook.author}
                </p>
              </div>

              <button
                onClick={() => setViewBook(null)}
                aria-label="Close"
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {viewBook.category}
              </span>

              {viewBook.availableQuantity > 0 ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {viewBook.availableQuantity} Available
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  Out of stock
                </span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">ISBN</p>

                <p className="mt-1 truncate text-sm font-medium text-slate-900">
                  {viewBook.isbn}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total Copies</p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {viewBook.quantity}
                </p>
              </div>
            </div>

            {(viewBook.publisher || viewBook.publishedYear) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {viewBook.publisher && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Publisher</p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {viewBook.publisher}
                    </p>
                  </div>
                )}

                {viewBook.publishedYear && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Published Year
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {viewBook.publishedYear}
                    </p>
                  </div>
                )}
              </div>
            )}

            {viewBook.description && (
              <div className="mt-4">
                <p className="text-xs text-slate-500">Description</p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {viewBook.description}
                </p>
              </div>
            )}

            {viewBook.createdAt && (
              <p className="mt-5 text-xs text-slate-400">
                Added on {formatDate(viewBook.createdAt)}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setViewBook(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    startEdit(viewBook);
                    setViewBook(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
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