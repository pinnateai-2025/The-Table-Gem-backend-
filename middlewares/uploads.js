const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "the_table_gem",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov"],
  },
});

const upload = multer({ storage });

module.exports = upload;
