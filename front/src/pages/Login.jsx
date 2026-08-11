import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBook, FiBookOpen, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      login(data.user, data.token);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">

      {/* Left branding section */}
      <div className="hidden bg-indigo-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <FiBook size={20} aria-hidden="true" />
            </div>

            <div>
              <h1 className="text-lg font-bold">LibraryHub</h1>
              <p className="text-xs text-indigo-200">
                Management System
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-lg">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <FiBookOpen size={28} aria-hidden="true" />
          </div>

          <h2 className="text-3xl font-bold leading-tight">
            Manage your library,
            <br />
            effortlessly.
          </h2>

          <p className="mt-4 text-base leading-7 text-indigo-100">
            Keep track of books, borrowing activity and your
            entire library collection from one simple dashboard.
          </p>
        </div>

        <p className="text-sm text-indigo-200">
          © 2026 LibraryHub
        </p>
      </div>

      {/* Login section */}
      <div className="flex items-center justify-center px-4 py-6 sm:px-8 sm:py-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-5 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FiBook size={18} aria-hidden="true" />
            </div>

            <div>
              <h1 className="text-xs font-bold text-slate-900 sm:text-sm">
                LibraryHub
              </h1>

              <p className="text-[11px] text-slate-400">
                Management System
              </p>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Welcome back 👋
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Sign in to access your library dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2 text-xs sm:text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm"
              >
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPassword ? <FiEyeOff size={15} aria-hidden="true" /> : <FiEye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register */}
          <p className="mt-5 text-center text-xs sm:text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;