const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const careerInfoSchema = new Schema({
  thumb: { type: String, required: true },
  title: { type: String, required: true },
  issuedDate: { type: Date, required: true },
  createrName: { type: String, required: true },
  category: String,
  subCategory: String,
  detailInfo: String,
  textDetailInfo: String,
  createdAt: { type: Date, required: true, default: new Date() },
  updatedAt: { type: Date, required: true, default: new Date() },
  likesCount: { type: Number, default: 0 }
});

module.exports = careerInfoSchema
;
