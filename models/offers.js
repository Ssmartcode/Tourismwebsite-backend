const mongoose = require("mongoose");

const offerSchema = mongoose.Schema(
  {
    category: { type: String, require: true },
    title: { type: String, require: true },
    description: { type: String, require: true },
    begins: { type: Date },
    ends: { type: Date },
    country: { type: String, require: true },
    location: { type: String, require: true },
    transportation: { type: String, require: true },
    price: { type: Number, require: true },
    newPrice: { type: Number },
    hotelId: { type: mongoose.Types.ObjectId, ref: "Hotel", require: true },
    image: { type: String, require: true },
    author: { type: mongoose.Types.ObjectId, ref: "User", require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
