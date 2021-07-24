const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const Schema = mongoose.Schema;

const careerTeachSchema = new Schema({
  thumb: { type: String },
  title: { type: String },
  seq: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  moderatorId: { type: Schema.ObjectId },
  category: [String],
  subCategory: [String],
  tags: [String],
  detailInfo: String,
  availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] },
  likesCount: { type: Number, default: 0 },
  maximumParticipants: Number,
  joinedParticipants: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  reviews: [Number], // _id가 아닌 자동증가 id정보들이 담깁니다.
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
});

const AutoIncrement = AutoIncrementFactory(mongoose);
const option = { id: 'careerTeach_id', inc_field: 'id' };
careerTeachSchema.plugin(AutoIncrement, option);

module.exports = careerTeachSchema
;
