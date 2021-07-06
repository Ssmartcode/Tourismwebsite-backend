const express = require("express");
const router = express.Router();
const authCheck = require("../config/auth-check");

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

const { body } = require("express-validator");

// signup validation
const singupValidation = [
  body("userName").not().isEmpty().withMessage("User name field is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

router.post("/signup", singupValidation, signup);
router.post("/login", login);

router.get("/favorites", authCheck, getFavorites);
router.post("/favorites/add", authCheck, postFavorites);
router.delete("/favorites/delete/:id", authCheck, deleteFavorites);

router.post("/messages/send-message", authCheck, sendMessage);
router.get("/messages/get-messages/:userId", authCheck, getMessages);
router.delete("/messages/delete-message/:id", authCheck, deleteMessage);

module.exports = router;
