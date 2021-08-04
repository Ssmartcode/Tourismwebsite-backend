const express = require("express");
const router = express.Router();
const authCheck = require("../config/auth-check");

// controllers
const {
  signup,
  login,
  sendMessage,
  getMessages,
  deleteMessage,
  getFavorites,
  postFavorites,
  deleteFavorites,
} = require("../controllers/users-controller");

// validators
const {
  loginValidator,
  signupValidator,
  sendMessageValidator,
} = require("../utilites/validators");

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

// get-add-delete favorite offers from user's list
router.get("/favorites", authCheck, getFavorites);
router.post("/favorites/add", authCheck, postFavorites);
router.delete("/favorites/delete/:id", authCheck, deleteFavorites);

// get-add-delete messages from user's list of messages (both sent and recieved)
router.post(
  "/messages/send-message",
  sendMessageValidator,
  authCheck,
  sendMessage
);
router.get("/messages/get-messages/:userId", authCheck, getMessages);
router.delete("/messages/delete-message/:id", authCheck, deleteMessage);

module.exports = router;
