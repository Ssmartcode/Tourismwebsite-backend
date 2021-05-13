const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userName: { type: String, required: true },
  userPassword: { type: String, required: true },
  offers: [{ type: mongoose.Types.ObjectId, ref: "Offer" }],
});

module.exports = mongoose.model("User", userSchema);
