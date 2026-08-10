import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Books", path: "/books", icon: "📚" },
    { name: "My Borrowings", path: "/my-borrows", icon: "📖" },
    ...(isAdmin
      ? [
          { name: "Admin Dashboard", path: "/admin/dashboard", icon: "🛠️" },
          { name: "User Management", path: "/admin/users", icon: "👥" },
          { name: "Borrowing Records", path: "/admin/borrows", icon: "📋" },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
            📚
          </div>

          <div>
            <h1 className="font-bold text-slate-900">
              LibraryHub
            </h1>

            <p className="text-xs text-slate-400">
              Management System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}

        </nav>

        {/* User section */}
        <div className="border-t border-slate-100 p-4">

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "Library Member"}
              </p>
            </div>

          </div>

          <button
            onClick={() => setShowLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            📚
          </div>

          <span className="font-bold text-slate-900">
            LibraryHub
          </span>

        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="rounded-lg px-3 py-2 text-xl text-slate-600 hover:bg-slate-100"
        >
          <span aria-hidden="true">{mobileOpen ? "✕" : "☰"}</span>
        </button>

      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden">

          <nav className="space-y-2">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-sm font-medium ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border-transparent text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}

            <button
              onClick={() => {
                setMobileOpen(false);
                setShowLogout(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              🚪 Logout
            </button>

          </nav>

        </div>
      )}

      {/* Main */}
      <main className="min-h-screen md:ml-64">

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

      </main>

      {/* Logout Confirmation */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl">
              🚪
            </div>

            <h2
              id="logout-dialog-title"
              className="text-xl font-bold text-slate-900"
            >
              Logout?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to logout from your
              LibraryHub account?
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setShowLogout(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Layout;