import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { API_BASE_URL } from "../config";

const AdminDashboard = () => {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load dashboard statistics");
        return;
      }

      setStats(data.stats);
      setRecentBorrows(data.recentBorrows || []);
      setRecentBooks(data.recentBooks || []);
      setRecentUsers(data.recentUsers || []);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Titles",
          value: stats.totalTitles,
          icon: "📚",
          color: "bg-indigo-50 text-indigo-600",
        },
        {
          label: "Total Copies",
          value: stats.totalCopies,
          icon: "📦",
          color: "bg-blue-50 text-blue-600",
        },
        {
          label: "Available Copies",
          value: stats.availableCopies,
          icon: "✓",
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Borrowed Copies",
          value: stats.borrowedCopies,
          icon: "📖",
          color: "bg-orange-50 text-orange-600",
        },
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: "👥",
          color: "bg-purple-50 text-purple-600",
        },
        {
          label: "Active Borrowings",
          value: stats.activeBorrowings,
          icon: "⏳",
          color: "bg-amber-50 text-amber-600",
        },
        {
          label: "Returned Borrowings",
          value: stats.returnedBorrowings,
          icon: "✅",
          color: "bg-teal-50 text-teal-600",
        },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Real-time overview of your library system.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            onClick={fetchStats}
            className="shrink-0 font-semibold text-red-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div aria-busy="true" aria-label="Loading dashboard statistics">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(7)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-16" />
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-4 w-48" />
              <div className="mt-5 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-4 w-32" />
              <div className="mt-5 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : !stats ? (
        !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">
              No dashboard data available.
            </p>
          </div>
        )
      ) : (
        <>
          {/* Statistics */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                      {card.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Recent Borrowing Activity */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Recent Borrowing Activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest borrow and return records
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {recentBorrows.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="text-4xl">📖</div>

                    <p className="mt-3 font-medium text-slate-900">
                      No borrowing activity yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Borrow records will appear here once users start
                      borrowing books.
                    </p>
                  </div>
                ) : (
                  recentBorrows.map((borrow) => (
                    <div
                      key={borrow._id}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                          {borrow.status === "borrowed" ? "📖" : "✅"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {borrow.book?.title || "Unknown book"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {borrow.user?.name || "Unknown user"} ·{" "}
                            {formatDate(borrow.borrowDate)}
                          </p>
                        </div>
                      </div>

                      {borrow.status === "borrowed" ? (
                        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                          Borrowed
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Returned
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Books */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Recent Books
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Newest additions to the catalog
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {recentBooks.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="text-4xl">📚</div>

                    <p className="mt-3 font-medium text-slate-900">
                      No books yet
                    </p>
                  </div>
                ) : (
                  recentBooks.map((book) => (
                    <div key={book._id} className="px-6 py-4">
                      <p className="truncate font-medium text-slate-900">
                        {book.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {book.author}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-semibold text-slate-900">
                Recent Users
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Newest registered accounts
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {recentUsers.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-4xl">👥</div>

                  <p className="mt-3 font-medium text-slate-900">
                    No users yet
                  </p>
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {user.role === "admin" ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                          Admin
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          User
                        </span>
                      )}

                      <span className="text-xs text-slate-400">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/books"
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="text-2xl">📚</span>

                <div>
                  <p className="font-medium text-slate-900">
                    Manage Books
                  </p>

                  <p className="text-xs text-slate-500">
                    Add, edit or delete books
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="text-2xl">👥</span>

                <div>
                  <p className="font-medium text-slate-900">
                    User Management
                  </p>

                  <p className="text-xs text-slate-500">
                    View users and manage roles
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/borrows"
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="text-2xl">📋</span>

                <div>
                  <p className="font-medium text-slate-900">
                    Borrowing Records
                  </p>

                  <p className="text-xs text-slate-500">
                    View all borrowing activity
                  </p>
                </div>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="text-2xl">📊</span>

                <div>
                  <p className="font-medium text-slate-900">
                    My Dashboard
                  </p>

                  <p className="text-xs text-slate-500">
                    Switch to your personal view
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
