const mongoose = require("mongoose");
const fs = require("fs");
const { validationResult } = require("express-validator");

// models
const Offer = require("../models/offers");
const User = require("../models/users");

// get all offers
exports.getOffers = async (req, res, next) => {
  const { count = 9 } = req.query;
  const { sort = "asc" } = req.query;
  const { discounted = "no" } = req.query;
  const { transportation, location, category, begins, ends } = req.query;

  if (req.query.random === "yes") {
    const { category = "trip" } = req.query;
    const count = await Offer.countDocuments({ category });
    const rand = Math.floor(Math.random() * count);
    const offer = await Offer.findOne({ category }).skip(rand);
    return res.status(200).json({ offer });
  }
  console.log(req.query);

  let query = {};
  if (discounted === "yes") query = { newPrice: { $ne: null } };
  if (transportation) query.transportation = transportation;
  if (category) query.category = category;
  if (location) {
    const locationReg = new RegExp(".*" + location + ".*", "i");
    query = {
      ...query,
      $or: [
        { location: { $regex: locationReg } },
        { country: { $regex: locationReg } },
      ],
    };
  }
  if (begins && ends) {
    query.begins = { $gte: begins };
    query.ends = { $lte: ends };
  }
  let offers;

  try {
    offers = await Offer.find(query)
      .limit(+count)
      .sort({ createdAt: sort })
      .populate("period");
    console.log(offers);
  } catch (err) {
    return next(err);
  }
  return res
    .status(200)
    .json({ offers: offers.map((offer) => offer.toObject({ getters: true })) });
};

// get one offer by offer's id
exports.getOfferById = async (req, res, next) => {
  const id = req.params.id;
  let offer;

  try {
    offer = await Offer.findById(id).populate("hotelId");
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ offer: offer.toObject({ getters: true }) });
};

// get offer of certain category
exports.getOffersByCategory = async (req, res, next) => {
  const category = req.params.category;
  const currPage = req.query.page || 1;
  const {
    priceasc,
    pricedesc,
    soon,
    later,
    discounted,
    transportationProvided,
  } = req.query;

  // sorting
  let sortingQuery = {};
  if (priceasc) sortingQuery.sort = { price: 1 };
  if (pricedesc) sortingQuery.sort = { price: -1 };
  if (soon) sortingQuery.sort = { begins: 1 };
  if (later) sortingQuery.sort = { begins: -1 };

  // filters
  let filterQuery = {};
  filterQuery.category = category;
  if (discounted) filterQuery.newPrice = { $ne: null };
  if (transportationProvided)
    filterQuery.transportation = { $ne: "No transportation provided" };

  let offers;
  let offersCount;
  try {
    offersCount = await Offer.countDocuments(filterQuery, null, sortingQuery);
    offers = await Offer.find(filterQuery, null, sortingQuery)
      .limit(2)
      .skip(2 * (currPage - 1));
  } catch (err) {
    return next(err);
  }
  res.status(200).json({ offers, pages: Math.ceil(offersCount / 2) });
};

// get all the offer created by the user that made the request
exports.getUserOfffers = async (req, res, next) => {
  const userId = req.params.userId;

  if (userId !== req.userData.userId) {
    const error = new Error("You are not authorized!");
    error.code = 401;
    next(error);
  }

  let offers;
  try {
    offers = await Offer.find({ author: userId }).sort({ ends: 1 });
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    next(error);
  }

  res.status(200).json({ offers });
};

// create an offer
exports.createOffer = async (req, res, next) => {
  const imageFile = req.file;

  const errors = validationResult(req);
  // if credentials are not valid, throw an error
  if (!errors.isEmpty()) {
    const error = new Error(
      "Your inputs are not valid. Please check them and try agian!"
    );
    console.log(errors.array());
    return next(error);
  }

  // get form data and create new offer
  const {
    category,
    title,
    description,
    begins,
    ends,
    location,
    transportation,
    country,
    price,
    hotelId,
    author,
  } = req.body;

  //create new offer
  const offer = Offer({
    category,
    title,
    description,
    begins,
    ends,
    location,
    transportation,
    country,
    price,
    hotelId,
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

// update an offer
exports.updateOffer = async (req, res, next) => {
  const id = req.params.id;

  const errors = validationResult(req);
  // if credentials are not valid, throw an error
  if (!errors.isEmpty()) {
    const error = new Error(
      "Your inputs are not valid. Please check them and try agian!"
    );
    console.log(errors.array());
    return next(error);
  }

  const {
    title,
    category,
    price,
    country,
    location,
    transportation,
    begins,
    ends,
  } = req.body;

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
  const updatedOffer = {
    title,
    category,
    price,
    country,
    location,
    transportation,
    begins,
    ends,
  };
  if (req.body.newPrice) updatedOffer.newPrice = req.body.newPrice;
  try {
    await Offer.findByIdAndUpdate(id, updatedOffer);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ message: "Successfuly updated the offer" });
};

// delete an offer
exports.deleteOffer = async (req, res, next) => {
  const id = req.params.id;
  let imagePath;

  // find the offer by id provided
  let offer;
  try {
    offer = await Offer.findById(id).populate("author").populate("hotelId");
  } catch (err) {
    return next(err);
  }
  imagePath = offer.image;

  // check if the client that made the request owns the offer
  if (req.userData.userId !== offer.author._id.toString()) {
    const err = new Error("Authorization failed. Please try again");
    return next(err);
  } else {
    // delete the offer
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const author = offer.author;
      author.offers.pull(offer._id);
      const hotel = offer.hotelId;

      await author.save({ session });
      await hotel.remove({ session });
      await offer.remove({ session });

      session.commitTransaction();
    } catch (err) {
      return next(err);
    }
  }

  // delete the image related to the offer
  fs.unlink(imagePath, (err) => console.log(err));
  return res.status(200).json({ message: "Offer has been deleted" });
};
