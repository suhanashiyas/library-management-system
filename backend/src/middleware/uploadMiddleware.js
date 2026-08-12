const multer = require("multer");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG or WEBP images are allowed for cover images.")
      );
    }

    cb(null, true);
  },
});

// Wraps multer's single-file upload so validation/size errors come back as
// clean 400 JSON responses instead of crashing through the default handler.
const uploadCoverImage = (req, res, next) => {
  upload.single("coverImage")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Cover image must be 5MB or smaller.",
      });
    }

    return res.status(400).json({
      message: err.message || "Failed to process the uploaded image.",
    });
  });
};

module.exports = uploadCoverImage;
