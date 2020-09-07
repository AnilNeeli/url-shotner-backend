const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UrlSchema = new Schema({
  fullurl: {
    type: String,
    required: true
  },
  shotrurl: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    default: new Date().toISOString()
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  
});

const Url = model("Url", UrlSchema);

module.exports = Url;
