const express = require("express");

const fileUpload = require("../config/multer-config");
const authCheck = require("../config/auth-check");

const router = express.Router();
const { addHotel } = require("../controllers/hotels-controller");
const { hotelValidator } = require("../utilites/validators");

// create hotel
router.post(
  "/create-hotel",
  fileUpload.single("image"),
  hotelValidator,
  authCheck,
  addHotel
);

module.exports = router;
