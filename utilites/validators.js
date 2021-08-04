const { body } = require("express-validator");
var ObjectId = require("mongoose").Types.ObjectId;

const loginValidator = [
  body("userName").isLength({ min: 4, max: 14 }),
  body("userPassword").custom((password) => {
    const passwordREGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordREGEX.test(password);
  }),
];

const signupValidator = [
  body("userName").isLength({ min: 4, max: 14 }),
  body("userPassword").custom((password) => {
    const passwordREGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordREGEX.test(password);
  }),
  body("userRole").custom((role) => {
    return role !== "user" || role !== "admin";
  }),
];

const sendMessageValidator = [
  body("messsage").isLength({ min: 4, max: 500 }),
  body("email").isEmail(),
  body("title").isLength({ min: 4, max: 100 }),
];

const hotelValidator = [
  body("hotelName").isLength({ min: 4, max: 50 }),
  body("description").isLength({ min: 4, max: 1000 }),
  body("address").isLength({ min: 4, max: 100 }),
  body("stars").custom((val) => val > 0 && val < 6),
  body("facilities").custom((val) => JSON.parse(val).length < 6),
  body("image").custom((val, { req }) => req.file), // check if a file has been uploaded
];

const createOfferValidator = [
  body("category").custom((val) =>
    ["city-break", "beach", "trip"].includes(val)
  ),
  body("title").isLength({ min: 4, max: 30 }),
  body("description").isLength({ min: 4, max: 1000 }),
  body("location").isLength({ min: 4, max: 30 }),
  body("price").custom((val) => val > 1 && val < 10000),
  body("image").custom((val, { req }) => req.file), // check if a file has been uploaded
  body("hotelId").custom((val) => ObjectId.isValid(val)),
];

const updateOfferValidator = [
  body("category").custom((val) =>
    ["city-break", "beach", "trip"].includes(val)
  ),
  body("title").isLength({ min: 4, max: 30 }),
  body("description").isLength({ min: 4, max: 1000 }),
  body("location").isLength({ min: 4, max: 30 }),
  body("price").custom((val) => val >= 1 && val < 10000),
  body("newPrice").custom((val) => {
    // if there is a new price check if the price is in range
    if (val) {
      return val > 1 && val < 10000;
    } else return true; //if no price, then go on and update without a new price
  }),
];
module.exports = {
  loginValidator,
  signupValidator,
  sendMessageValidator,
  hotelValidator,
  createOfferValidator,
  updateOfferValidator,
};
