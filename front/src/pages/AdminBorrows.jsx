import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { API_BASE_URL } from "../config";

const AdminBorrows = () => {
  const { token } = useAuth();

  const [borrows, setBorrows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(
        `${API_BASE_URL}/api/borrows/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.message || "Failed to fetch borrow records");
        return;
      }

      setBorrows(data.borrows || []);
    } catch (error) {
      console.error(error);
      setLoadError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  // Statistics, derived from the already-fetched list
  const totalRecords = borrows.length;
  const activeBorrows = borrows.filter(
    (borrow) => borrow.status === "borrowed"
  ).length;
  const returnedBorrows = totalRecords - activeBorrows;
  const uniqueBorrowers = new Set(
    borrows.map((borrow) => borrow.user?._id).filter(Boolean)
  ).size;

  // Search + status filter
  const filteredBorrows = borrows.filter((borrow) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      borrow.user?.name?.toLowerCase().includes(searchText) ||
      borrow.user?.email?.toLowerCase().includes(searchText) ||
      borrow.book?.title?.toLowerCase().includes(searchText) ||
      borrow.book?.author?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "" || borrow.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statCards = [
    {
      label: "Total Records",
      value: totalRecords,
      icon: "📋",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active Borrowings",
      value: activeBorrows,
      icon: "📖",
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Returned",
      value: returnedBorrows,
      icon: "✓",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Unique Borrowers",
      value: uniqueBorrowers,
      icon: "👥",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Borrowing Records
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and track every borrowing activity in the library.
        </p>
      </div>

      {/* Statistics */}
      {!loadError && !loading && (
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      )}

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="borrows-search" className="sr-only">
            Search borrowing records
          </label>

          <span
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            🔍
          </span>

          <input
            id="borrows-search"
            type="text"
            placeholder="Search by user, email, book or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <label htmlFor="borrows-status-filter" className="sr-only">
          Filter by status
        </label>

        <select
          id="borrows-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-48"
        >
          <option value="">All statuses</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>

        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Records */}
      {loadError ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-12 text-center">
          <div className="mb-3 text-4xl">⚠️</div>

          <h2 className="font-semibold text-red-700">
            Failed to load borrowing records
          </h2>

          <p className="mt-1 text-sm text-red-600">{loadError}</p>

          <button
            onClick={fetchBorrows}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div
          aria-busy="true"
          aria-label="Loading borrowing records"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="divide-y divide-slate-100">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center gap-6 px-6 py-5">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredBorrows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mb-3 text-5xl">📋</div>

          <h2 className="font-semibold text-slate-900">
            {borrows.length === 0
              ? "No borrowing activity yet"
              : "No records found"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {borrows.length === 0
              ? "Borrow records will appear here once users start borrowing books."
              : "Try adjusting your search or status filter."}
          </p>

          {borrows.length > 0 && (search || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
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
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Book
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Borrow Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Return Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBorrows.map((borrow) => (
                  <tr
                    key={borrow._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <p className="font-medium text-slate-900">
                        {borrow.user?.name || "Unknown user"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {borrow.user?.email || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-medium text-slate-900">
                        {borrow.book?.title || "Unknown book"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {borrow.book?.author || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(borrow.borrowDate)}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {borrow.returnDate
                        ? formatDate(borrow.returnDate)
                        : "Not returned"}
                    </td>

                    <td className="px-6 py-5">
                      {borrow.status === "borrowed" ? (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                          Borrowed
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Returned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBorrows;
