const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// user model for mongo db
const User = require("../models/users");

// SIGNUP CONTROLLER
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  const { userName, userPassword } = req.body;

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
  });
  try {
    await user.save();
  } catch (err) {
    return next(err);
  }

  // create a token for the newly created user
  const token = jwt.sign({ userId: user.userId }, "super_secret_key_lol", {
    expiresIn: "1h",
  });

  // send the response to the client
  return res.json({
    userId: user.id,
    userName: user.userName,
    token,
    message: "User has been successfuly created",
  });
};

// LOGIN CONTROLLER
const login = async (req, res, next) => {
  const { userName, userPassword } = req.body;
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
      const token = jwt.sign({ userId: user.id }, "super_secret_key_lol", {
        expiresIn: "1h",
      });
      return res.status(200).json({
        userId: user.id,
        userName: user.userName,
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
module.exports = { signup, login };
