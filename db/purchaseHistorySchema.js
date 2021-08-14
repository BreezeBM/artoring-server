const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const purchaseHistorySchema = new Schema({
  userId: { type: Schema.ObjectId, required: true }, // 유저의 ID
  targetId: { type: Schema.ObjectId, required: true }, // 멘토 혹은 커리어 교육의 ID
  originType: { type: String, required: true }, // 구매한 대상의 타입. 멘토 || 커리어 || ...
  price: { type: Number, required: true },
  bookedStartTime: { type: Date },
  bookedEndTime: { type: Date },
  inprogress: { type: String, default: 'inprogress' },
  zoomLink: String,
  createdAt: { type: Date, default: new Date() }
});

module.exports = purchaseHistorySchema
;
