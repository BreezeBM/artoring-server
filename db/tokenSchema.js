// 한번만 사용되어야 할 토큰을 관리하는 스키마

import mongoose from 'mongoose';
import { date } from '../controller/tools/index.js';

// const { date } = require('../controller/tools');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({

  name: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, required: true, default: new Date(date().add(9, 'hours').format()) }
});

export default tokenSchema;
