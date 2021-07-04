const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/users-controller");

const { body } = require("express-validator");

// signup validation
const singupValidation = [
  body("userName").not().isEmpty().withMessage("User name field is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

router.get("/", (req, res, next) => {
  res.status(200).json({ message: "hello there" });
});

router.post("/signup", singupValidation, signup);
router.post("/login", login);

module.exports = router;
