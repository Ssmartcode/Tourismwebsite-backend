const express = require("express");

const fileUpload = require("../config/multer-config");
const authCheck = require("../config/auth-check");

const router = express.Router();
const {
  getHotel,
  addHotel,
  deleteHotel,
} = require("../controllers/hotels-controller");

// get hotel
router.get("/", getHotel);

// create hotel
router.post("/create-hotel", fileUpload.single("image"), authCheck, addHotel);

// delete hotel
router.delete("/:id", deleteHotel);

module.exports = router;
