const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Behind a proxy (Vercel) — needed so rate limiting sees the real client IP
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Only allow the configured frontend origin to call this API
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Limit login/register attempts to slow down brute-force/credential-stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Import Routes
const authroutes = require("./routes/authroutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

// Test Route
app.get("/", (req, res) => {
  res.send("Library Management System Backend is Running 🚀");
});

// Routes
app.use("/api/auth", authLimiter, authroutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// Unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Catch-all error handler — ensures clients always get a clean JSON error
// (e.g. malformed JSON bodies) instead of Express's default HTML/stack trace page.
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.status ? err.message : "Something went wrong on the server.",
  });
});

module.exports = app;
