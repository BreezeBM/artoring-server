
const mongoose = require('mongoose');

mongoose.set('returnOriginal', false);

import mentoringSchema from '../db/mentoringSchema.js'
import careerInfoSchema from '../db/careerInfoSchema.js'
import userSchema from '../db/userSchema.js'
import purchaseHistorySchema from '../db/purchaseHistorySchema.js'
import reviewSchema from '../db/reviewSchema.js'
import adminSchema from '../db/adminSchema.js'
import tokenSchema from '../db/tokenSchema.js'

const mentoringModel = mongoose.model('mentoringModel', mentoringSchema);
const careerInfoModel = mongoose.model('careerInfoModel', careerInfoSchema);
const userModel = mongoose.model('userModel', userSchema);
const purchaseHistoryModel = mongoose.model('purchaseHistoryModel', purchaseHistorySchema);
const reviewModel = mongoose.model('reviewModel', reviewSchema);
const adminModel = mongoose.model('adminModel', adminSchema);
const tokenModel = mongoose.model('tokenModel', tokenSchema);

export { careerInfoModel, mentoringModel, userModel, purchaseHistoryModel, reviewModel, adminModel, tokenModel, mongoose }
;
