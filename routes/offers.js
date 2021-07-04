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
} = require("../controllers/offers-controller");

// get offers
router.get("/", getOffers);

// get offers by category
router.get("/category/:category", getOffersByCategory);

// get offer by id
router.get("/:id", getOfferById);

// check if user is authenticated before posting, updating or deleting
router.use(authCheck);

// post offers - create an offer
router.post("/", fileUpload.single("image"), createOffer);

// update offer
router.patch("/:id", updateOffer);

// delete offer
router.delete("/:id", deleteOffer);

module.exports = router;
