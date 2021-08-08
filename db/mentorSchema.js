const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mentorSchema = new Schema({
  userId: { type: Schema.ObjectId, required: true, unique: true },
  settledAmount: Number,
  category: [String],
  descriptionForMentor: { type: String, required: true },
  availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] },
  paymentInfo: { bank: String, address: String, owner: String },
  likesCount: { type: Number, default: 0 },
  price: { type: Number, required: true }
});

module.exports = mentorSchema;
