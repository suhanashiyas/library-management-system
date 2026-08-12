const crypto = require("crypto");
const path = require("path");
const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const spacesClient = require("../config/spaces");

const BUCKET = process.env.DO_SPACES_BUCKET;
const FOLDER = process.env.DO_SPACES_FOLDER || "Library";
const CDN_ENDPOINT = process.env.DO_SPACES_CDN_ENDPOINT;

// Uploads a book cover image and returns its public CDN URL + Spaces key
const uploadImage = async (buffer, originalName, mimetype) => {
  const extension = path.extname(originalName) || "";
  const key = `${FOLDER}/books/${crypto.randomUUID()}${extension}`;

  await spacesClient.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read",
    })
  );

  return {
    url: `${CDN_ENDPOINT}/${key}`,
    key,
  };
};

// Removes an image from Spaces. Failures are logged, not thrown — a missing
// or already-deleted object should never block a book create/update/delete.
const deleteImage = async (key) => {
  if (!key) return;

  try {
    await spacesClient.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error(`Failed to delete Spaces object "${key}":`, error.message);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
