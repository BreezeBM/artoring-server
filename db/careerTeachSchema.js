const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const careerTeachSchema = new Schema({
  thumb: { type: String },
  title: { type: String },
  startDate: { type: Number },
  endDate: { type: Number },
  moderatorId: { type: Schema.ObjectId },
  category: String,
  subCategory: String,
  detailInfo: String,
  availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] },
  likesCount: { type: Number, default: 0 },
  maximumParticipants: Number,
  joinedParticipants: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  reviews: [Schema.ObjectId],
  createdAt: { type: Number },
  updatedAt: { type: Number }
})
;

module.exports = careerTeachSchema
;