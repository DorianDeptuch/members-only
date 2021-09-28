const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now() },
});

PostSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Post", PostSchema);
