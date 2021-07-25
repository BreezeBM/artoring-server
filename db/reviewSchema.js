const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  userId: { type: Schema.ObjectId, required: true }, // 유저의 ID
  targetId: { type: Schema.ObjectId, required: true }, // 멘토 혹은 커리어 교육의 ID
  originType: { type: Boolean, required: true }, // 리뷰대상 구문용 (멘토 || 커리어교육 || ...)
  text: { type: String, required: true },
  rate: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() },
  modifiedAt: { type: Date, default: new Date() }
});

const AutoIncrement = AutoIncrementFactory(mongoose);
const option = { id: 'review_id', inc_field: 'id' };
reviewSchema.plugin(AutoIncrement, option);

module.exports = reviewSchema
;
