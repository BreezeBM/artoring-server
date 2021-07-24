const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pwd: { type: String, requried: true },
  accessKey: { type: String, required: true, unique: true },
  authorityLevel: { type: Number, required: true }
});

const AutoIncrement = AutoIncrementFactory(mongoose);
const option = { id: 'admin_id', inc_field: 'id' };
adminSchema.plugin(AutoIncrement, option);

module.exports = adminSchema;
