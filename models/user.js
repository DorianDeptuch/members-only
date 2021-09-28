let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
