const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");

const fileUpload = require("../config/multer-config");
const authCheck = require("../config/auth-check");

const router = express.Router();

// models
const Offer = require("../models/offers");
const User = require("../models/users");

// get offers
router.get("/", async (req, res, next) => {
  let offers;
  try {
    offers = await Offer.find();
  } catch (err) {
    return next(err);
  }
  return res
    .status(200)
    .json({ offers: offers.map((offer) => offer.toObject({ getters: true })) });
});

// get offer by id
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  let offer;

  try {
    offer = await Offer.findById(id);
  } catch (err) {
    return next(err);
  }
  return res.json({ offer: offer.toObject({ getters: true }) });
});

// check if user is authenticated before posting, updating or deleting
router.use(authCheck);

// post offers - create an offer
router.post("/", fileUpload.single("image"), async (req, res, next) => {
  const imageFile = req.file;

  // get form data and create new offer
  const { category, title, period, price, author } = req.body;
  const offer = Offer({
    category,
    title,
    period,
    price,
    image: imageFile.path,
    author,
  });
  let user;

  // get the author from the data base
  try {
    user = await User.findById(author);
  } catch (err) {
    next(err);
  }

  // save the offer to the data base and add the place to the user
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await offer.save({ session: session });
    console.log(user);
    user.offers.push(offer);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    // const error = new Error("We could not save the offer. Try again later");
    return next(err);
  }

  // send the response to the client
  return res
    .status(201)
    .json({ message: "You have successfuly created a new offer" });
});

// update offer
router.patch("/:id", async (req, res, next) => {
  const id = req.params.id;
  const { title, category, price, period } = req.body;

  // find the offer by id provided
  let offer;
  try {
    offer = await Offer.findById(id);
  } catch (err) {
    next(err);
  }

  // check if the client that made the request owns the offer
  if (req.userData.userId !== offer.author.toString()) {
    const err = new Error("Authorization failed. Please try again");
    return next(err);
  }
  // update the offer
  try {
    await Offer.findByIdAndUpdate(id, { title, category, price, period });
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ message: "Successfuly updated the offer" });
});

// delete offer
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  let imagePath;

  // find the offer by id provided
  let offer;
  try {
    offer = await Offer.findById(id);
  } catch (err) {
    return next(err);
  }

  // check if the client that made the request owns the offer
  if (req.userData.userId !== offer.author.toString()) {
    const err = new Error("Authorization failed. Please try again");
    return next(err);
  } else {
    // delete the offer
    try {
      imagePath = offer.image;
      await offer.remove();
    } catch (err) {
      return next(err);
    }
  }

  // delete the image related to the offer
  fs.unlink(imagePath, (err) => console.log(err));
  return res.status(200).json({ message: "Offer has been deleted" });
});
module.exports = router;
