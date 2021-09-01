const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mentorSchema = new Schema({
  userId: { type: Schema.ObjectId, required: true, unique: true },
  name: { type: String, required: true }, // 엘라스틱서치 검색용
  thumb: { type: String, required: true }, // 어드민 관리용
  settledAmount: Number,
  tags: [String],
  descriptionForMentor: { type: String, required: true },
  descriptionText: { type: String, required: true }, // 한글만 존재하는 텍스트. 역시 엘라스틱 서치 검색용
  availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] },
  paymentInfo: { bank: String, address: String, owner: String },
  likesCount: { type: Number, default: 0 },
  price: { type: Number, required: true }
});

module.exports = mentorSchema;
