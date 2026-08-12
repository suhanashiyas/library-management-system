const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 50,
    },
  },
  {
    timestamps: true,
  }
);

// Case-insensitive uniqueness ("Fiction" and "fiction" are the same category)
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
