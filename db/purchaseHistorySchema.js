const mongoose = require('mongoose');
const { date } = require('../controller/tools');
const Schema = mongoose.Schema;

const purchaseHistorySchema = new Schema({
  userId: { type: Schema.ObjectId, required: true }, // 유저의 ID
  targetId: { type: Schema.ObjectId, required: true }, // 멘토 혹은 커리어 교육의 ID
  originType: { type: String, required: true }, // 구매한 대상의 타입. 멘토 || 커리어 || ...
  price: { type: Number, required: true },
  bookedStartTime: { type: Date },
  bookedEndTime: { type: Date },
  // PG 결제 검증용 데이터
  merchantUid: { type: String, required: true },
  isReviewed: { type: Boolean, default: false },
  isRefund: { type: Boolean, default: false },
  progress: { type: String, default: 'inprogress' },
  zoomLink: String,
  questions: [{ type: String }],
  createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) },
  // 아임포트 결제 상태 저장
  paymentData: { type: Object }
});

module.exports = purchaseHistorySchema
;
