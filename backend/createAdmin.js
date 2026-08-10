require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./src/models/user");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "admin@library.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = await User.create({
      name: "Library Admin",
      email: "admin@library.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully!");
    console.log("Email: admin@library.com");
    console.log("Password: Admin@123");
    console.log("Role:", admin.role);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();