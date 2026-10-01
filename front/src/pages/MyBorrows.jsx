import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiBook, FiBookOpen } from "react-icons/fi";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { getMyBorrows, returnBook } from "../services/borrowService";

const MyBorrows = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setLoadError("");

      setBorrows(await getMyBorrows());
    } catch (error) {
      console.error(error);
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBorrows();
  }, []);

  const handleConfirmReturn = async () => {
    try {
      setReturning(true);
      setReturnError("");

      await returnBook(returnTarget._id);

      setMessage("Book returned successfully!");
      setMessageType("success");
      setReturnTarget(null);

      fetchBorrows();
    } catch (error) {
      console.error(error);
      setReturnError(error.message);
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          My Borrowings
        </h1>

        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          Track the books you have borrowed.
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

      {/* Borrowings */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <FiAlertTriangle className="mx-auto text-red-500" size={26} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-red-700 sm:text-sm">
            Failed to load borrowings
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
          aria-label="Loading your borrowings"
          className="grid gap-3 sm:grid-cols-2"
        >
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : borrows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <FiBookOpen className="mx-auto text-slate-300" size={32} aria-hidden="true" />

          <h2 className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">
            No borrowing history
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            You haven't borrowed any books yet.
          </p>

          <Link
            to="/books"
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {borrows.map((borrow) => {
            const book = borrow.book;

            return (
              <div
                key={borrow._id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <Link to="/books" className="group flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:h-9 sm:w-9">
                      <FiBook size={15} aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-xs font-bold text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-sm">
                        {book?.title || "Book"}
                      </h2>

                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {book?.author || "Unknown author"}
                      </p>
                    </div>
                  </Link>

                  {borrow.status === "borrowed" ? (
                    <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                      Borrowed
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                      Returned
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-500">Borrow Date</p>

                    <p className="mt-0.5 text-xs font-medium text-slate-900">
                      {formatDate(borrow.borrowDate)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-500">Return Date</p>

                    <p className="mt-0.5 text-xs font-medium text-slate-900">
                      {borrow.returnDate
                        ? formatDate(borrow.returnDate)
                        : "Not returned"}
                    </p>
                  </div>
                </div>

                {borrow.status === "borrowed" && (
                  <button
                    onClick={() => setReturnTarget(borrow)}
                    className="mt-3 w-full rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
                  >
                    Return Book
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Return Confirmation */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-book-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiBookOpen size={18} aria-hidden="true" />
            </div>

            <h2
              id="return-book-title"
              className="text-lg font-bold text-slate-900"
            >
              Return this book?
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Are you sure you want to return{" "}
              <strong>{returnTarget.book?.title || "this book"}</strong>?
            </p>

            {returnError && (
              <div role="alert" className="mt-3.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {returnError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setReturnTarget(null);
                  setReturnError("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReturn}
                disabled={returning}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {returning ? "Returning..." : "Return Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBorrows;
