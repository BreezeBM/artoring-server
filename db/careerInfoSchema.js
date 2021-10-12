const mongoose = require('mongoose');
const { date } = require('../controller/tools');
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
  createdAt: { type: Date, required: true, default: new Date(date().add(9, 'hours').format()) },
  updatedAt: { type: Date, required: true, default: new Date(date().add(9, 'hours').format()) },
  likesCount: { type: Number, default: 0 }
});

module.exports = careerInfoSchema
;
