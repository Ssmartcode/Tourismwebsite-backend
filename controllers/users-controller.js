const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// user model for mongo db
const User = require("../models/users");

// SIGNUP CONTROLLER
exports.signup = async (req, res, next) => {
  const { userName, userPassword, isAdmin } = req.body;

  const errors = validationResult(req);
  // if credentials are not valid, throw an error
  if (!errors.isEmpty()) {
    const error = new Error("Your credentials are not valid");
    next(error);
  }

  // check if user with same name already exists in data base
  let userExists;
  try {
    userExists = await User.find({ userName });
  } catch (err) {
    return next(err);
  }
  if (userExists.length > 0) {
    const error = new Error("This user name is taken. Please choose another");
    return next(error);
  }

  // hash the password given by user
  const hashedUserPassword = await bcrypt.hash(userPassword, 12);

  // create the new user and save it in db
  const user = new User({
    userName,
    userPassword: hashedUserPassword,
    offers: [],
    isAdmin,
  });
  try {
    await user.save();
  } catch (err) {
    return next(err);
  }

  // create a token for the newly created user
  const token = jwt.sign({ userId: user.userId }, process.env.JWT_KEY, {
    expiresIn: "48h",
  });

  // send the response to the client
  return res.json({
    userId: user._id,
    userName: user.userName,
    token,
    message: "User has been successfuly created",
  });
};

// LOGIN CONTROLLER
exports.login = async (req, res, next) => {
  const { userName, userPassword } = req.body;

  const errors = validationResult(req);
  // if credentials are not valid, throw an error
  if (!errors.isEmpty()) {
    const error = new Error("Your credentials are not valid");
    return next(error);
  }

  let user;
  try {
    user = await User.findOne({ userName });
  } catch (err) {
    const error = new Error("We could not log you in");
    next(error);
  }
  // if the user has been found
  if (user) {
    // check if password matches
    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(userPassword, user.userPassword);
    } catch (err) {
      next(err);
    }

    // in case the password mathces
    if (passwordMatches) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_KEY, {
        expiresIn: "48h",
      });
      return res.status(200).json({
        userId: user._id,
        userName: user.userName,
        isAdmin: user.isAdmin,
        token,
        message: "Logged in",
      });
    }

    // in case the password doesn't match
    if (!passwordMatches) {
      const error = new Error("Could not find the user");
      return next(error);
    }
  }
  // if no user has been found
  if (!user) {
    const error = new Error("Could not find the user");
    return next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  const { title, email, message, related, reciever } = req.body;

  let recieverUser;
  let senderUser;
  try {
    recieverUser = await User.findById(reciever);
    senderUser = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  const newMessage = {
    id: v4(),
    from: senderUser.userName,
    to: recieverUser.userName,
    title,
    email,
    message,
    related,
    sentAt: new Date(),
  };

  recieverUser.messages.push(newMessage);
  senderUser.messages.push(newMessage);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await recieverUser.save({ session });
    await senderUser.save({ session });

    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  res.status(200).json({ messsage: "Successfuly sent the message!" });
};

exports.getMessages = async (req, res, next) => {
  const { userId } = req.params;

  if (userId !== req.userData.userId) {
    const error = new Error("You are not authorized!");
    error.code = 401;
    return next(error);
  }

  let messages;

  try {
    const user = await User.findById(userId);
    messages = user.messages;
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  res.status(200).json({ messages });
};

exports.deleteMessage = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.userData;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  const newMessages = user.messages.filter((message) => {
    return message.id !== id;
  });
  user.messages = newMessages;

  try {
    await user.save();
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    message: "Message has been successfuly deleted",
    messages: newMessages,
  });
};

exports.getFavorites = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userId).populate("favorites");
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  const favorites = user.favorites;

  res.status(200).json({ favorites });
};

exports.postFavorites = async (req, res, next) => {
  const { offerId } = req.params;

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  const alreadyFavorite = user.favorites.find(
    (fav) => offerId === fav.toString()
  );
  if (alreadyFavorite) {
    const error = new Error("You can't add this to your favorites' list");
    error.code = 400;
    return next(error);
  }

  user.favorites.push(offerId);
  try {
    await user.save();
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  res.status(201).json({ meessage: "Offer has been added" });
};

exports.deleteFavorites = async (req, res, next) => {
  const favId = req.params.id;

  let user;
  try {
    user = await User.findById(req.userData.userId).populate("favorites");
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  const newFavorties = user.favorites.filter(
    (fav) => favId.toString() !== fav._id.toString()
  );
  user.favorites = newFavorties;

  try {
    await user.save();
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    return next(error);
  }

  res.status(200).json({
    message: "Favorite item has been deleted",
    favorites: newFavorties,
  });
};
