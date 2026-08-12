import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiTag,
  FiPlus,
  FiX,
  FiTrash2,
  FiEdit2,
  FiSettings,
} from "react-icons/fi";
import Skeleton from "../components/Skeleton";
import * as categoryService from "../services/categoryService";

// Section list is intentionally structured so a future config type (e.g.
// publishers) can be added here without reshaping the page.
const SECTIONS = [{ id: "categories", label: "Categories", icon: FiTag }];

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState("categories");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const fetched = await categoryService.getCategories();
      setCategories(fetched);
    } catch (error) {
      console.error(error);
      setLoadError(error.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const closeFormModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setNameInput("");
    setFormError("");
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setNameInput(category.name);
    setFormError("");
  };

  // Fast-fail duplicate check on the client; the server re-validates too
  const validateName = (name) => {
    if (!name.trim()) {
      return "Category name is required.";
    }

    if (name.trim().length > 50) {
      return "Category name must be 50 characters or fewer.";
    }

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === name.trim().toLowerCase() &&
        category._id !== editingCategory?._id
    );

    if (duplicate) {
      return "A category with this name already exists.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateName(nameInput);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingCategory) {
        await categoryService.updateCategory(
          editingCategory._id,
          nameInput.trim()
        );
        setMessage("Category updated successfully!");
      } else {
        await categoryService.createCategory(nameInput.trim());
        setMessage("Category added successfully!");
      }

      setMessageType("success");
      closeFormModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      setFormError(error.message || "Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError("");

      await categoryService.deleteCategory(deleteTarget._id);

      setMessage("Category deleted successfully!");
      setMessageType("success");
      setDeleteTarget(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      setDeleteError(error.message || "Unable to connect to server");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          Settings
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          Manage the dropdown values used across book forms.
        </p>
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

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Section list */}
        <nav className="flex gap-2 overflow-x-auto lg:w-48 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition sm:text-sm ${
                activeSection === section.id
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <section.icon size={15} aria-hidden="true" />
              {section.label}
            </button>
          ))}
        </nav>

        {/* Categories section */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:text-sm">
              <FiSettings size={14} aria-hidden="true" />
              Categories
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] sm:text-sm"
            >
              <FiPlus size={15} aria-hidden="true" />
              Add Category
            </button>
          </div>

          {loadError ? (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
              <FiAlertTriangle className="mx-auto text-red-500" size={26} aria-hidden="true" />

              <h2 className="mt-2 text-xs font-semibold text-red-700 sm:text-sm">
                Failed to load categories
              </h2>

              <p className="mt-0.5 text-xs text-red-600">{loadError}</p>

              <button
                onClick={fetchCategories}
                className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div
              aria-busy="true"
              aria-label="Loading categories"
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="divide-y divide-slate-100">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 px-3.5 py-3">
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <FiTag className="mx-auto text-slate-300" size={32} aria-hidden="true" />

              <h2 className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">
                No categories yet
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Add your first category so it appears in the Book form.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between gap-3 px-3.5 py-3"
                  >
                    <span className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                      {category.name}
                    </span>

                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => startEdit(category)}
                        aria-label={`Edit ${category.name}`}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <FiEdit2 size={13} aria-hidden="true" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(category)}
                        aria-label={`Delete ${category.name}`}
                        className="rounded-lg border border-red-100 p-1.5 text-red-600 transition hover:bg-red-50"
                      >
                        <FiTrash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="category-form-title"
                className="text-lg font-bold text-slate-900"
              >
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <button
                onClick={closeFormModal}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {formError && (
                <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="category-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="category-name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Fiction"
                  maxLength={50}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
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
                    ? editingCategory
                      ? "Saving..."
                      : "Adding..."
                    : editingCategory
                    ? "Save Changes"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FiTrash2 size={18} aria-hidden="true" />
            </div>

            <h2
              id="delete-category-title"
              className="text-lg font-bold text-slate-900"
            >
              Delete this category?
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot
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
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
