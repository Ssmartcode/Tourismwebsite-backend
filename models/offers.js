const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({
  category: { type: String, require: true },
  title: { type: String, require: true },
  period: { type: String, require: true },
  price: { type: Number, require: true },
  image: { type: String, require: true },
  author: { type: mongoose.Types.ObjectId, ref: "User", require: true },
});

module.exports = mongoose.model("Offer", offerSchema);
