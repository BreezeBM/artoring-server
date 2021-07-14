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
    jobTitle: { type: String },
    belongs: { type: String },
    howLong: { type: String },
    dept: String
  },
  interestedIn: [{ name: String, val: Boolean }],
  likedCareerEdu: [Schema.ObjectId],
  likedMentor: [Schema.ObjectId],
  outdoorAct: String,
  workHistory: String
})
;
module.exports = userSchema;
