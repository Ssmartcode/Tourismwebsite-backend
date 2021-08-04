const Hotel = require("../models/hotels");
const { validationResult } = require("express-validator");

exports.addHotel = async (req, res, next) => {
  const { description, hotelName, address, stars, facilities } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Please check your inputs. Don't forget to upload an image"
    );
    return next(error);
  }

  const newHotel = new Hotel({
    description,
    hotelName,
    address,
    stars,
    facilities: JSON.parse(facilities).map((fac) => fac.value),
    image: req.file.path,
  });

  try {
    await newHotel.save();
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    next(error);
  }

  res.status(201).json({ message: "Successfuly created", id: newHotel._id });
};
