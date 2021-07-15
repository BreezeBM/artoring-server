const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');
const Schema = mongoose.Schema;

const careerInfoSchema = new Schema({
  thumb: { type: String, required: true },
  title: { type: String, required: true },
  issuedDate: { type: Date, required: true },
  createrName: { type: String, required: true },
  category: String,
  subCategory: String,
  detailInfo: String,
  createdAt: { type: Date, required: true, default: new Date() },
  updatedAt: { type: Date, required: true, default: new Date() },
  likesCount: { type: Number, default: 0 }
});

const AutoIncrement = AutoIncrementFactory(mongoose);
const option = { id: 'careerInfo_id', inc_field: 'id' };
careerInfoSchema.plugin(AutoIncrement, option);

module.exports = careerInfoSchema
;
