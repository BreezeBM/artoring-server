import mongoose from "mongoose";
import {date} from "../controller/tools/index.js"

import mentorSchema from "./mentorSchema.js";
// const { date } = require("../controller/tools");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  thumb: {
    type: String,
    default: "https://artoring.com/image/1626851218536.png",
  },
  name: { type: String },

  sns: [],
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
  mentor: mentorSchema,
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
  createdAt: { type: Date, default: new Date(date().add(9, "hours").format()) },
  refOrLongTimeToken: String,
  drop: {
    name: String,
    reason: {},
    date: { type: Date, default: new Date(date().add(9, "hours").format()) },
  },
});

export default userSchema;
