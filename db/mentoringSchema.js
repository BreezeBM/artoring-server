import mongoose from 'mongoose';
import { date } from '../controller/tools/index.js';

// const { date } = require('../controller/tools');
const Schema = mongoose.Schema;

// 디자인을 확인한 결과, 커리어 교육과 개인 멘토링은 스키마의 차이가 매우 적음
const mentoringSchema = new Schema({
  thumb: { type: String },
  title: { type: String },
  seq: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  moderatorId: { type: Schema.ObjectId, required: true },
  zoom: {
    startUrl: String, // 호스트에게 제공될 시작 링크
    joinUrl: String, // 참가자들에게 제공될 참여 링크
    id: Number, // 회의 id
    recordUrl: [String] // 녹화 url
  },
  category: [String],
  subCategory: [String],
  tags: Schema.Types.Mixed,
  detailInfo: String,
  textDetailInfo: String,
  isGroup: Boolean,
  availableTime: {
    mon: [String],
    tue: [String],
    wed: [String],
    thu: [String],
    fri: [String],
    sat: [String],
    sun: [String]
  },
  likesCount: { type: Number, default: 0 },
  maximumParticipants: Number,
  joinedParticipants: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  // 커리어 클래스에서만 사용되는 연사료
  fee: Number,
  rate: { type: Number, default: 0 },
  rateCount: { type: Number, default: 0 },
  reviews: [Schema.ObjectId], // _id가 아닌 자동증가 id정보들이 담깁니다.
  createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) },
  updatedAt: { type: Date, default: new Date(date().add(9, 'hours').format()) },
  // 멘토가 직접 관리자에게 정산 요청을 한경우
  settlementInfo: {
    progress: Number,
    createdAt: Date,
    detailInfo: String
  }
});

export default mentoringSchema;
