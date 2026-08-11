import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBook,
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiPackage,
  FiUsers,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const { token, user, isAdmin } = useAuth();

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
        `${API_BASE_URL}/api/dashboard/${isAdmin ? "admin" : "user"}`,
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
      setRecentBorrows((isAdmin ? data.recentBorrows : data.recentActivity) || []);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const statCards = stats
    ? isAdmin
      ? [
          {
            label: "Total Titles",
            value: stats.totalTitles,
            icon: FiBook,
            color: "bg-indigo-50 text-indigo-600",
            to: "/books",
          },
          {
            label: "Total Copies",
            value: stats.totalCopies,
            icon: FiPackage,
            color: "bg-blue-50 text-blue-600",
            to: "/books",
          },
          {
            label: "Available Copies",
            value: stats.availableCopies,
            icon: FiCheckCircle,
            color: "bg-emerald-50 text-emerald-600",
            to: "/books",
          },
          {
            label: "Borrowed Copies",
            value: stats.borrowedCopies,
            icon: FiBookOpen,
            color: "bg-orange-50 text-orange-600",
            to: "/admin/borrows",
          },
          {
            label: "Total Users",
            value: stats.totalUsers,
            icon: FiUsers,
            color: "bg-purple-50 text-purple-600",
            to: "/admin/users",
          },
          {
            label: "Active Borrowings",
            value: stats.activeBorrowings,
            icon: FiClock,
            color: "bg-amber-50 text-amber-600",
            to: "/admin/borrows",
          },
          {
            label: "Returned Borrowings",
            value: stats.returnedBorrowings,
            icon: FiCheck,
            color: "bg-teal-50 text-teal-600",
            to: "/admin/borrows",
          },
        ]
      : [
          {
            label: "Books to Browse",
            value: stats.totalBookTitles,
            icon: FiBook,
            color: "bg-indigo-50 text-indigo-600",
            to: "/books",
          },
          {
            label: "My Active Borrowings",
            value: stats.myActiveBorrows,
            icon: FiBookOpen,
            color: "bg-orange-50 text-orange-600",
            to: "/my-borrows",
          },
          {
            label: "My Returned Books",
            value: stats.myReturnedBorrows,
            icon: FiCheckCircle,
            color: "bg-emerald-50 text-emerald-600",
            to: "/my-borrows",
          },
          {
            label: "Total Borrowing Records",
            value: stats.myActiveBorrows + stats.myReturnedBorrows,
            icon: FiClipboard,
            color: "bg-purple-50 text-purple-600",
            to: "/my-borrows",
          },
        ]
    : [];

  const quickActions = isAdmin
    ? [
        {
          to: "/books",
          icon: FiBook,
          title: "Manage Books",
          subtitle: "Add, edit or delete books",
        },
        {
          to: "/admin/users",
          icon: FiUsers,
          title: "Manage Users",
          subtitle: "View users and manage roles",
        },
        {
          to: "/admin/borrows",
          icon: FiClipboard,
          title: "Manage Borrowings",
          subtitle: "View all borrowing activity",
        },
      ]
    : [
        {
          to: "/books",
          icon: FiBook,
          title: "Browse Books",
          subtitle: "Explore the library catalog",
        },
        {
          to: "/my-borrows",
          icon: FiBookOpen,
          title: "My Borrowings",
          subtitle: "View and return your books",
        },
      ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          Welcome back{user?.name ? `, ${user.name}` : ""} 👋
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {isAdmin
            ? "Real-time overview of your library system."
            : "Here's a quick look at your library activity."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 p-3 text-xs sm:text-sm text-red-600">
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
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {[...Array(isAdmin ? 7 : 4)].map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-6 w-12" />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm lg:col-span-2">
              <Skeleton className="h-4 w-40" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <Skeleton className="h-4 w-28" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : !stats ? (
        !error && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              No dashboard data available.
            </p>
          </div>
        )
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="group block rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-all duration-150 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium leading-tight text-slate-500 transition-colors group-hover:text-indigo-600 sm:text-xs">
                      {card.label}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                      {card.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.color} transition-transform group-hover:scale-105 sm:h-9 sm:w-9`}
                  >
                    <card.icon size={16} aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Borrowing Activity + side column */}
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-3 sm:px-4">
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
                    Recent Borrowing Activity
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    {isAdmin
                      ? "Latest borrow and return records"
                      : "Your latest borrow and return activity"}
                  </p>
                </div>

                <Link
                  to={isAdmin ? "/admin/borrows" : "/my-borrows"}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {recentBorrows.length === 0 ? (
                  <div className="p-6 text-center">
                    <FiBookOpen className="mx-auto text-slate-300" size={28} aria-hidden="true" />

                    <p className="mt-2 text-xs font-medium text-slate-900 sm:text-sm">
                      No borrowing activity yet
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {isAdmin
                        ? "Borrow records will appear here once users start borrowing books."
                        : "Browse the catalog and borrow your first book."}
                    </p>
                  </div>
                ) : (
                  recentBorrows.slice(0, 5).map((borrow) => (
                    <Link
                      key={borrow._id}
                      to={isAdmin ? "/admin/borrows" : "/my-borrows"}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:h-9 sm:w-9">
                          {borrow.status === "borrowed" ? (
                            <FiBookOpen size={15} aria-hidden="true" />
                          ) : (
                            <FiCheckCircle size={15} aria-hidden="true" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                            {borrow.book?.title || "Unknown book"}
                          </p>

                          <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {isAdmin
                              ? borrow.user?.name || "Unknown user"
                              : borrow.book?.author || "Unknown author"}{" "}
                            · {formatDate(borrow.borrowDate)}
                          </p>
                        </div>
                      </div>

                      {borrow.status === "borrowed" ? (
                        <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                          Borrowed
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                          Returned
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {isAdmin ? (
              /* Recent Books */
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-3 sm:px-4">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
                      Recent Books
                    </h2>

                    <p className="text-[11px] text-slate-500">
                      Newest catalog additions
                    </p>
                  </div>

                  <Link
                    to="/books"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    All books →
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentBooks.length === 0 ? (
                    <div className="p-6 text-center">
                      <FiBook className="mx-auto text-slate-300" size={24} aria-hidden="true" />

                      <p className="mt-2 text-xs font-medium text-slate-900">
                        No books yet
                      </p>
                    </div>
                  ) : (
                    recentBooks.slice(0, 5).map((book) => (
                      <Link
                        key={book._id}
                        to="/books"
                        className="block px-3.5 py-2.5 sm:px-4 sm:py-3 transition hover:bg-slate-50"
                      >
                        <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                          {book.title}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {book.author}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Quick Actions */
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
                <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
                  Quick Actions
                </h2>

                <div className="mt-2.5 space-y-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/60 active:scale-[0.99]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <action.icon size={15} aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900">
                          {action.title}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {action.subtitle}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <>
              {/* Recent Users */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-3 sm:px-4">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
                      Recent Users
                    </h2>

                    <p className="text-[11px] text-slate-500">
                      Newest registered accounts
                    </p>
                  </div>

                  <Link
                    to="/admin/users"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    All users →
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentUsers.length === 0 ? (
                    <div className="p-6 text-center">
                      <FiUsers className="mx-auto text-slate-300" size={24} aria-hidden="true" />

                      <p className="mt-2 text-xs font-medium text-slate-900">
                        No users yet
                      </p>
                    </div>
                  ) : (
                    recentUsers.slice(0, 5).map((recentUser) => (
                      <Link
                        key={recentUser._id}
                        to="/admin/users"
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 transition hover:bg-slate-50"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                            {recentUser.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                              {recentUser.name}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                              {recentUser.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {recentUser.role === "admin" ? (
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                              Admin
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              User
                            </span>
                          )}

                          <span className="hidden text-[11px] text-slate-400 sm:inline">
                            {formatDate(recentUser.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions (Admin) */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
                <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">Quick Actions</h2>

                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/60 active:scale-[0.99]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <action.icon size={15} aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900">
                          {action.title}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {action.subtitle}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
