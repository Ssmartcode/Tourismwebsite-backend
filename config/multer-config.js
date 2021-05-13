const multer = require("multer");
const { v4 } = require("uuid");

// multer middleware
const fileMimTypes = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const fileUpload = multer({
  limit: 5000,
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/images");
    },
    filename: function (req, file, cb) {
      cb(null, v4() + "." + fileMimTypes[file.mimetype]);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!fileMimTypes[file.mimetype];
    let error = isValid ? null : new Error("Invalid file type");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
