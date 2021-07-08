const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  thumb: { type: String },
  name: { type: String, required: true },
  nickName: { type: String },
  email: { type: String, required: true, unique: true },
  gender: { type: String },
  birth: { type: String },
  phone: { type: String },
  address: { type: String },
  pwd: { type: String, required: true },
  isMentor: Boolean,
  major: { type: String },
  current: {
    title: { type: String },
    belongs: { type: String },
    howLong: { type: String }
  },
  interestedIn: [String],
  likedCareerEdu: [Schema.ObjectId],
  likedMentor: [Schema.ObjectId],
  outdoorAct: [{
    name: { type: String, required: true },
    date: { type: Date },
    text: { type: String }
  }],
  workHistory: [{
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    detailInfo: String,
    createdAt: { type: Date, required: true, default: new Date() },
    updatedAt: { type: Date, required: true, default: new Date() }
  }]
})
;
module.exports = userSchema;
