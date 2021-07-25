const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const Schema = mongoose.Schema;

const mentorSchema = new Schema({
  userId: { type: Schema.ObjectId, required: true, unique: true },
  settledAmount: Number,
  category: [String],
  descriptionForMentor: { type: String, required: true },
  availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] },
  intro: { type: String, required: true },
  paymentInfo: { bank: String, address: String, owner: String },
  likesCount: { type: Number, default: 0 },
  price: { type: Number, required: true }
});

const AutoIncrement = AutoIncrementFactory(mongoose);
const option = { id: 'mentor_id', inc_field: 'id' };
mentorSchema.plugin(AutoIncrement, option);

module.exports = mentorSchema;
