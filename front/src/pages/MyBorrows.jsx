import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import { API_BASE_URL } from "../config";

const MyBorrows = () => {
  const { token } = useAuth();

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

      const response = await fetch(
        `${API_BASE_URL}/api/borrows/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.message || "Failed to load borrowings");
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

  const handleConfirmReturn = async () => {
    try {
      setReturning(true);
      setReturnError("");

      const response = await fetch(
        `${API_BASE_URL}/api/borrows/return`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            borrowId: returnTarget._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setReturnError(data.message || "Failed to return book");
        return;
      }

      setMessage("Book returned successfully!");
      setMessageType("success");
      setReturnTarget(null);

      fetchBorrows();
    } catch (error) {
      console.error(error);
      setReturnError("Unable to connect to server");
    } finally {
      setReturning(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Borrowings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the books you have borrowed.
        </p>
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

      {/* Borrowings */}
      {loadError ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-12 text-center">
          <div className="mb-3 text-4xl">⚠️</div>

          <h2 className="font-semibold text-red-700">
            Failed to load borrowings
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
          aria-label="Loading your borrowings"
          className="grid gap-5 lg:grid-cols-2"
        >
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : borrows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="text-5xl">📖</div>

          <h2 className="mt-4 font-semibold text-slate-900">
            No borrowing history
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            You haven't borrowed any books yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {borrows.map((borrow) => {
            const book = borrow.book;

            return (
              <div
                key={borrow._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                      📕
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {book?.title || "Book"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {book?.author || "Unknown author"}
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

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Borrow Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {formatDate(borrow.borrowDate)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Return Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {borrow.returnDate
                        ? formatDate(borrow.returnDate)
                        : "Not returned"}
                    </p>
                  </div>
                </div>

                {borrow.status === "borrowed" && (
                  <button
                    onClick={() => setReturnTarget(borrow)}
                    className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
              📖
            </div>

            <h2
              id="return-book-title"
              className="text-xl font-bold text-slate-900"
            >
              Return this book?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to return{" "}
              <strong>{returnTarget.book?.title || "this book"}</strong>?
            </p>

            {returnError && (
              <div role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {returnError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setReturnTarget(null);
                  setReturnError("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReturn}
                disabled={returning}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
