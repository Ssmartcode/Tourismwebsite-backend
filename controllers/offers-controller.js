const mongoose = require("mongoose");
const fs = require("fs");

// models
const Offer = require("../models/offers");
const User = require("../models/users");

exports.getOffers = async (req, res, next) => {
  const { count = 9 } = req.query;
  const { sort = "asc" } = req.query;
  let offers;
  try {
    offers = await Offer.find()
      .limit(+count)
      .sort({ createdAt: sort });
  } catch (err) {
    return next(err);
  }
  return res
    .status(200)
    .json({ offers: offers.map((offer) => offer.toObject({ getters: true })) });
};

exports.getOfferById = async (req, res, next) => {
  const id = req.params.id;
  let offer;

  try {
    offer = await Offer.findById(id);
  } catch (err) {
    return next(err);
  }
  return res.json({ offer: offer.toObject({ getters: true }) });
};

exports.getOffersByCategory = async (req, res, next) => {
  const category = req.params.category;
  const currPage = req.query.page || 1;

  let offers;
  let offersCount;
  try {
    offersCount = await Offer.countDocuments();
    offers = await Offer.find({ category })
      .limit(2)
      .skip(2 * (currPage - 1));
  } catch (err) {
    return next(err);
  }
  console.log(offers);
  res.status(200).json({ offers, pages: Math.ceil(offersCount / 2) });
};

exports.createOffer = async (req, res, next) => {
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
};

exports.updateOffer = async (req, res, next) => {
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
};

exports.deleteOffer = async (req, res, next) => {
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
};
