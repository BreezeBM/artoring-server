const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  thumb: { type: String, default: 'https://artoring.com/image/1626851218536.png' },
  name: { type: String, required: true },
  nickName: { type: String },
  email: { type: String, required: true, unique: true },
  verifiedEmail: { type: Boolean, default: false },
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
    dept: String
  },
  interestedIn: [{
    name: String,
    val: Boolean
  }],
  likedCareerEdu: [Schema.ObjectId],
  likedMentor: [Schema.ObjectId],
  outdoorAct: String,
  workHistory: String,
  createdAt: { type: Date, default: new Date() },
  refOrLongTimeToken: String
});

module.exports = userSchema;
