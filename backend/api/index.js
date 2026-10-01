// Vercel serverless entry point. Wraps the existing Express app without
// calling app.listen(); local development still uses server.js.
const mongoose = require("mongoose");
const app = require("../src/app");

// Cache the connection promise across warm invocations so each request
// doesn't open a new MongoDB connection.
let connection = null;

const connectOnce = () => {
  if (!connection) {
    connection = mongoose.connect(process.env.MONGO_URI).catch((err) => {
      connection = null; // allow retry on the next request
      throw err;
    });
  }
  return connection;
};

module.exports = async (req, res) => {
  try {
    await connectOnce();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed." });
  }
  return app(req, res);
};
