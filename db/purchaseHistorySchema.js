import mongoose from 'mongoose';
import { date } from '../controller/tools/index.js';

// const { date } = require('../controller/tools');
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
  // 멘토에게 정산이 되었는지 여부
  isSettled: { type: Boolean, default: false },
  progress: { type: String, default: 'inprogress' },
  zoom: {
    startUrl: String, // 호스트에게 제공될 시작 링크
    joinUrl: String, // 참가자들에게 제공될 참여 링크
    id: Number, // 회의 id
    recordUrl: [String] // 녹화 url
  },
  zoomLink: String,
  questions: [{ type: String }],
  createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) },
  // 아임포트 결제 상태 저장
  paymentData: { type: Object },
  hopeTime: { type: String },
  // 멘토가 직접 관리자에게 정산 요청을 한경우
  settlementInfo: {
    progress: { type: Number, default: -1 },
    createdAt: Date,
    detailInfo: String
  }
});

export default purchaseHistorySchema
;
