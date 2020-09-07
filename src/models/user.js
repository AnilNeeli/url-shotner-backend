const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },

  emailverified: {
    type: Boolean,
    required: true
  }
});

const Admin = model("Admin", AdminSchema);

module.exports = Admin;
