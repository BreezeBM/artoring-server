import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pwd: { type: String, requried: true },
  accessKey: { type: String, required: true, unique: true },
  authorityLevel: { type: Number, required: true },
  attempts: { type: Number, default: 5 }
});

export default adminSchema;
