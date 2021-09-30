const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  thumb: {
    type: String,
    default: "https://artoring.com/image/1626851218536.png",
  },
  name: { type: String },
  appId: String, // 소셜로그인시 탈퇴를 위해 appId를 저장해둠
  snsType: String,
  nickName: { type: String },
  email: { type: String, required: true, unique: true },
  verifiedEmail: { type: Boolean, default: false },
  verifiedPhone: { type: Boolean, default: false },
  gender: { type: String },
  birth: { type: String },
  phone: { type: String },
  address: { type: String },
  pwd: { type: String, required: true },
  isMentor: { type: Boolean, default: false },
  major: { type: String },
  current: {
    jobTitle: { type: String },
    belongs: { type: String },
    howLong: { type: String },
    dept: String,
  },
  interestedIn: [{
    name: String,
    val: Boolean,
  }],

  likedCareerEdu: [Schema.ObjectId],
  likedMentor: [Schema.ObjectId],
  likedInfo: [Schema.ObjectId],
  outdoorAct: String,
  workHistory: String,
  createdAt: { type: Date, default: new Date() },
  refOrLongTimeToken: String,
  active: { type: Boolean, default: true },
  loginedAt: Date,
});

module.exports = userSchema;
