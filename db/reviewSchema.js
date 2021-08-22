const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  userThumb: { type: String, required: true },
  userName: { type: String, required: true },
  targetId: { type: Schema.ObjectId, required: true },
  originType: { type: String, required: true }, // 리뷰대상 구문용 (멘토 || 커리어교육 || ...)
  text: { type: String, required: true },
  rate: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() },
  modifiedAt: { type: Date, default: new Date() }
});

module.exports = reviewSchema
;
