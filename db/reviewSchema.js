const mongoose = require('mongoose');
const { date } = require('../controller/tools');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  userThumb: { type: String, required: true },
  userName: { type: String, required: true },
  userId: { type: Schema.ObjectId, required: true },
  targetId: { type: Schema.ObjectId, required: true },
  originType: { type: String, required: true }, // 리뷰대상 구문용 (멘토 || 커리어교육 || ...)
  text: { type: String, required: true },
  rate: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) },
  modifiedAt: { type: Date, default: new Date(date().add(9, 'hours').format()) }
});

module.exports = reviewSchema
;
