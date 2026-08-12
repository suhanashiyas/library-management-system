const { S3Client } = require("@aws-sdk/client-s3");

// DigitalOcean Spaces is S3-compatible — point the AWS SDK at the DO endpoint.
// Credentials are read from env only; never hardcode or log them.
const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: "us-east-1",
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

module.exports = spacesClient;
