const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pwd: { type: String, requried: true },
  accessKey: { type: String, required: true, unique: true },
  authorityLevel: { type: Number, required: true }
});

module.exports = adminSchema;
