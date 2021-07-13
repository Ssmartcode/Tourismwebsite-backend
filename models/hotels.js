const mongoose = require("mongoose");

const hotelSchema = mongoose.Schema(
  {
    hotelName: { type: String, require: true },
    description: { type: String, require: true },
    address: { type: String, require: true },
    stars: { type: Number, require: true },
    facilities: { type: Array, require: true },
    image: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
