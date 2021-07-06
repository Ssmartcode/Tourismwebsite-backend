const express = require("express");

const fileUpload = require("../config/multer-config");
const authCheck = require("../config/auth-check");

const router = express.Router();
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  getOffersByCategory,
  getUserOfffers,
} = require("../controllers/offers-controller");

// get offers
router.get("/", getOffers);

// get offer by id
router.get("/:id", getOfferById);

// post offers - create an offer
router.post("/", fileUpload.single("image"), authCheck, createOffer);

// get offers by category
router.get("/category/:category", getOffersByCategory);

// get user's offers
router.get("/user-offers/:userId", authCheck, getUserOfffers);

// update offer
router.patch("/:id", authCheck, updateOffer);

// delete offer
router.delete("/:id", authCheck, deleteOffer);

module.exports = router;
