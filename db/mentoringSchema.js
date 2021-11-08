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
  rate: { type: Number, default: 0 },
  rateCount: { type: Number, default: 0 },
  reviews: [Schema.ObjectId], // _id가 아닌 자동증가 id정보들이 담깁니다.
  createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) },
  updatedAt: { type: Date, default: new Date(date().add(9, 'hours').format()) }
});

export default mentoringSchema;
