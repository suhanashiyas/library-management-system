import { useEffect, useState } from "react";
import {
  FiSearch,
  FiAlertTriangle,
  FiClipboard,
  FiBookOpen,
  FiCheck,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { API_BASE_URL } from "../config";

const StatusBadge = ({ status }) =>
  status === "borrowed" ? (
    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
      Borrowed
    </span>
  ) : (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
      Returned
    </span>
  );

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBorrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      icon: FiClipboard,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active Borrowings",
      value: activeBorrows,
      icon: FiBookOpen,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Returned",
      value: returnedBorrows,
      icon: FiCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Unique Borrowers",
      value: uniqueBorrowers,
      icon: FiUsers,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          Borrowing Records
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          View and track every borrowing activity in the library.
        </p>
      </div>

      {/* Statistics */}
      {!loadError && !loading && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">
                    {card.label}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.color} sm:h-9 sm:w-9`}
                >
                  <card.icon size={16} aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="borrows-search" className="sr-only">
            Search borrowing records
          </label>

          <span
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <FiSearch size={15} />
          </span>

          <input
            id="borrows-search"
            type="text"
            placeholder="Search by user, email, book or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <label htmlFor="borrows-status-filter" className="sr-only">
          Filter by status
        </label>

        <select
          id="borrows-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-40"
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
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Records */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <FiAlertTriangle className="mx-auto text-red-500" size={26} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-red-700 sm:text-sm">
            Failed to load borrowing records
          </h2>

          <p className="mt-0.5 text-xs text-red-600">{loadError}</p>

          <button
            onClick={fetchBorrows}
            className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div
          aria-busy="true"
          aria-label="Loading borrowing records"
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-3.5 py-3">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="hidden h-5 w-16 sm:block" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredBorrows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <FiClipboard className="mx-auto text-slate-300" size={32} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">
            {borrows.length === 0
              ? "No borrowing activity yet"
              : "No records found"}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
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
            {filteredBorrows.map((borrow) => (
              <div
                key={borrow._id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                      {borrow.book?.title || "Unknown book"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {borrow.book?.author || "-"}
                    </p>
                  </div>

                  <StatusBadge status={borrow.status} />
                </div>

                <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                  <p className="truncate text-xs font-medium text-slate-900">
                    User: {borrow.user?.name || "Unknown user"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {borrow.user?.email || "-"}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                  <span>Borrowed {formatDate(borrow.borrowDate)}</span>
                  <span>
                    {borrow.returnDate
                      ? `Returned ${formatDate(borrow.returnDate)}`
                      : "Not returned"}
                  </span>
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
                      User
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Book
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Borrow Date
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Return Date
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-slate-900">
                          {borrow.user?.name || "Unknown user"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {borrow.user?.email || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-slate-900">
                          {borrow.book?.title || "Unknown book"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {borrow.book?.author || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {formatDate(borrow.borrowDate)}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {borrow.returnDate
                          ? formatDate(borrow.returnDate)
                          : "Not returned"}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={borrow.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBorrows;
