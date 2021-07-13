const Hotel = require("../models/hotels");

exports.addHotel = async (req, res, next) => {
  const { description, hotelName, address, stars, facilities } = req.body;
  if (!req.file) {
    const error = new Error("No image provided");
    error.code = 400;
    next(error);
  }
  const newHotel = new Hotel({
    description,
    hotelName,
    address,
    stars,
    facilities: JSON.parse(facilities).map((fac) => fac.value),
    image: req.file.path,
  });
  console.log(newHotel);

  try {
    await newHotel.save();
  } catch (err) {
    const error = new Error("Something went wrong. Please try again later");
    error.code = 500;
    next(error);
  }

  res.status(201).json({ message: "Successfuly created", id: newHotel._id });
};

exports.getHotel = (req, res, next) => {
  res.status(201).json({});
};

exports.deleteHotel = (req, res, next) => {
  res.status(201).json({});
};
