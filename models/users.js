const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userName: { type: String, required: true },
  userPassword: { type: String, required: true },
  offers: [{ type: mongoose.Types.ObjectId, ref: "Offer" }], //for admin users
  favorites: [{ type: mongoose.Types.ObjectId, ref: "Offer" }], //for simple users
  isAdmin: { type: Boolean, required: true },
  messages: { type: Array },
});

module.exports = mongoose.model("User", userSchema);
