import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const mentorSchema = new Schema({
  thumb: { type: String, required: true }, // 어드민 관리용
  settledAmount: Number,
  tags: [String],
  // 멘토링 가능한 영역, 연차정보
  category: {
    // 값이 -1 === 해당사항 없음 4 === 모든 년차 멘토링 가능 이하 내림차순

    // 교육
    employment: { type: Number, default: -1 },

    // 창업
    founded: { type: Number, default: -1 },

    // 전문교육
    professional: { type: Number, default: -1 },

    // 프리랜서
    free: { type: Number, default: -1 },

    // 진학
    edu: { type: Number, default: -1 }
  },
  descriptionForMentor: { type: String, required: true },
  descriptionText: { type: String, required: true }, // 한글만 존재하는 텍스트. 역시 엘라스틱 서치 검색용
  availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] },
  paymentInfo: { bank: String, address: String, owner: String },
  likesCount: { type: Number, default: 0 },
  price: { type: Number, required: true }
});

export default mentorSchema;
