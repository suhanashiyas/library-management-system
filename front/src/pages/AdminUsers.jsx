import { useEffect, useState } from "react";
import {
  FiSearch,
  FiAlertTriangle,
  FiUsers,
  FiX,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { getUsers, getUserDetail, updateUserRole, deleteUser } from "../services/userService";

const RoleBadge = ({ role }) =>
  role === "admin" ? (
    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
      Admin
    </span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      User
    </span>
  );

const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [viewUser, setViewUser] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  const [roleTarget, setRoleTarget] = useState(null);
  const [changingRole, setChangingRole] = useState(false);
  const [roleError, setRoleError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setLoadError("");

      setUsers(await getUsers());
    } catch (error) {
      console.error(error);
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  // View user details + borrow history
  const openView = async (user) => {
    setViewUser(user);
    setViewDetail(null);
    setViewError("");
    setViewLoading(true);

    try {
      setViewDetail(await getUserDetail(user._id));
    } catch (error) {
      console.error(error);
      setViewError(error.message);
    } finally {
      setViewLoading(false);
    }
  };

  // Change role
  const handleConfirmRoleChange = async () => {
    const nextRole = roleTarget.role === "admin" ? "user" : "admin";

    try {
      setChangingRole(true);
      setRoleError("");

      await updateUserRole(roleTarget._id, nextRole);

      setMessage(`${roleTarget.name}'s role was changed to ${nextRole}.`);
      setMessageType("success");
      setRoleTarget(null);

      fetchUsers();
    } catch (error) {
      console.error(error);
      setRoleError(error.message);
    } finally {
      setChangingRole(false);
    }
  };

  // Delete user
  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError("");

      await deleteUser(deleteTarget._id);

      setMessage("User deleted successfully!");
      setMessageType("success");
      setDeleteTarget(null);

      fetchUsers();
    } catch (error) {
      console.error(error);
      setDeleteError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Search + role filter
  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText);

    const matchesRole = roleFilter === "" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          User Management
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          View registered users and manage their roles.
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

      {/* Search + Filter */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="users-search" className="sr-only">
            Search users
          </label>

          <span
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <FiSearch size={15} />
          </span>

          <input
            id="users-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <label htmlFor="users-role-filter" className="sr-only">
          Filter by role
        </label>

        <select
          id="users-role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-40"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {(search || roleFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("");
            }}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Users */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <FiAlertTriangle className="mx-auto text-red-500" size={26} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-red-700 sm:text-sm">
            Failed to load users
          </h2>

          <p className="mt-0.5 text-xs text-red-600">{loadError}</p>

          <button
            onClick={fetchUsers}
            className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div
          aria-busy="true"
          aria-label="Loading users"
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-3.5 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="hidden h-5 w-14 sm:block" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <FiUsers className="mx-auto text-slate-300" size={32} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">
            {users.length === 0 ? "No users yet" : "No users found"}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {users.length === 0
              ? "Registered users will appear here."
              : "Try adjusting your search or role filter."}
          </p>

          {users.length > 0 && (search || roleFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
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
            {filteredUsers.map((user) => {
              const isSelf = user._id === currentUser?.id;

              return (
                <div
                  key={user._id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-200"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-900 sm:text-sm">
                          <span className="truncate">{user.name}</span>
                          {isSelf && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                              You
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <RoleBadge role={user.role} />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Joined {formatDate(user.createdAt)}</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600">
                      {user.activeBorrows} active · {user.totalBorrows} total
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openView(user)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      View
                    </button>

                    <button
                      onClick={() => setRoleTarget(user)}
                      disabled={isSelf}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.role === "admin" ? "Demote" : "Promote"}
                    </button>

                    <button
                      onClick={() => setDeleteTarget(user)}
                      disabled={isSelf}
                      className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Borrows
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isSelf = user._id === currentUser?.id;

                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                              {user.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <span className="truncate">{user.name}</span>

                                {isSelf && (
                                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                    You
                                  </span>
                                )}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <RoleBadge role={user.role} />
                        </td>

                        <td className="px-4 py-3.5 text-sm text-slate-500">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                            {user.activeBorrows} active · {user.totalBorrows}{" "}
                            total
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => openView(user)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              View
                            </button>

                            <button
                              onClick={() => setRoleTarget(user)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "You cannot change your own role"
                                  : undefined
                              }
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {user.role === "admin"
                                ? "Demote"
                                : "Promote"}
                            </button>

                            <button
                              onClick={() => setDeleteTarget(user)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "You cannot delete your own account"
                                  : undefined
                              }
                              className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* View User */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-user-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-600">
                  {viewUser.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2
                    id="view-user-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    {viewUser.name}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {viewUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewUser(null)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>

            <RoleBadge role={viewUser.role} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Joined</p>

                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {formatDate(viewUser.createdAt)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Borrows</p>

                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {viewUser.activeBorrows} active · {viewUser.totalBorrows}{" "}
                  total
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Borrow History
              </p>

              <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
                {viewLoading ? (
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : viewError ? (
                  <p role="alert" className="p-4 text-sm text-red-600">
                    {viewError}
                  </p>
                ) : !viewDetail || viewDetail.borrows.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No borrowing history yet.
                  </p>
                ) : (
                  viewDetail.borrows.map((borrow) => (
                    <div
                      key={borrow._id}
                      className="flex items-center justify-between gap-4 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {borrow.book?.title || "Unknown book"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(borrow.borrowDate)}
                        </p>
                      </div>

                      {borrow.status === "borrowed" ? (
                        <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                          Borrowed
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          Returned
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-change-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiShield size={18} aria-hidden="true" />
            </div>

            <h2
              id="role-change-title"
              className="text-lg font-bold text-slate-900"
            >
              {roleTarget.role === "admin"
                ? "Demote to User?"
                : "Promote to Admin?"}
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              {roleTarget.role === "admin" ? (
                <>
                  <strong>{roleTarget.name}</strong> will lose admin
                  privileges and become a regular user.
                </>
              ) : (
                <>
                  <strong>{roleTarget.name}</strong> will gain full admin
                  privileges, including managing books and users.
                </>
              )}
            </p>

            {roleError && (
              <div role="alert" className="mt-3.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {roleError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setRoleTarget(null);
                  setRoleError("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmRoleChange}
                disabled={changingRole}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingRole
                  ? "Updating..."
                  : roleTarget.role === "admin"
                  ? "Demote"
                  : "Promote"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FiTrash2 size={18} aria-hidden="true" />
            </div>

            <h2
              id="delete-user-title"
              className="text-lg font-bold text-slate-900"
            >
              Delete this user?
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
              This action cannot be undone.
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
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
