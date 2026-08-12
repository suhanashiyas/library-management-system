import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBook,
  FiBookOpen,
  FiUsers,
  FiClipboard,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const navItems = isAdmin
    ? [
        { name: "Dashboard", shortName: "Dashboard", path: "/dashboard", icon: FiGrid },
        { name: "Books", shortName: "Books", path: "/books", icon: FiBook },
        { name: "Users", shortName: "Users", path: "/admin/users", icon: FiUsers },
        { name: "Borrowings", shortName: "Borrows", path: "/admin/borrows", icon: FiClipboard },
        { name: "Settings", shortName: "Settings", path: "/admin/settings", icon: FiSettings },
      ]
    : [
        { name: "Dashboard", shortName: "Dashboard", path: "/dashboard", icon: FiGrid },
        { name: "Books", shortName: "Books", path: "/books", icon: FiBook },
        { name: "My Borrowings", shortName: "My Borrows", path: "/my-borrows", icon: FiBookOpen },
      ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-slate-200 bg-white md:flex md:flex-col">

        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <FiBook size={16} aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-sm font-bold leading-tight text-slate-900">
              LibraryHub
            </h1>

            <p className="text-[11px] leading-tight text-slate-400">
              Management System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="shrink-0" size={16} aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}

        </nav>

        {/* User section */}
        <div className="border-t border-slate-100 p-3">

          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
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
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut size={16} aria-hidden="true" />
            Logout
          </button>

        </div>

      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-slate-200 bg-white/95 px-3.5 backdrop-blur-md md:hidden">

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <FiBook size={14} aria-hidden="true" />
          </div>

          <span className="text-sm font-bold text-slate-900">
            LibraryHub
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2.5 text-xs text-slate-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
            <span className="max-w-[100px] truncate font-medium text-[11px]">
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </div>

          <button
            onClick={() => setShowLogout(true)}
            aria-label="Logout"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <FiLogOut size={16} aria-hidden="true" />
          </button>
        </div>

      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-slate-200 bg-white/95 px-1 shadow-lg backdrop-blur-md md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all ${
                isActive
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center rounded-full px-3 py-0.5 transition-all ${isActive ? "bg-indigo-50 text-indigo-600" : ""}`}>
                  <item.icon size={18} aria-hidden="true" />
                </div>
                <span className="mt-0.5 truncate leading-none text-[10px]">{item.shortName}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Main Content View */}
      <main className="min-h-screen pb-20 md:ml-56 md:pb-6">

        <div className="mx-auto max-w-7xl p-3 sm:p-5 lg:p-6">
          <Outlet />
        </div>

      </main>

      {/* Logout Confirmation Dialog */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            className="w-full max-w-sm rounded-xl bg-white p-4 sm:p-5 shadow-2xl"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FiLogOut size={18} aria-hidden="true" />
            </div>

            <h2
              id="logout-dialog-title"
              className="text-base font-bold text-slate-900 sm:text-lg"
            >
              Logout?
            </h2>

            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">
              Are you sure you want to logout from your LibraryHub account?
            </p>

            <div className="mt-4 flex justify-end gap-2">

              <button
                onClick={() => setShowLogout(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-red-700"
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

