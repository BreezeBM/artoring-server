
const mongoose = require('mongoose');

mongoose.set('returnOriginal', false);

const mentoringSchema = require('../db/mentoringSchema');
const careerInfoSchema = require('../db/careerInfoSchema');
const userSchema = require('../db/userSchema');
const mentorSchema = require('../db/mentorSchema');
const purchaseHistorySchema = require('../db/purchaseHistorySchema');
const reviewSchema = require('../db/reviewSchema');
const adminSchema = require('../db/adminSchema');

const mentoringModel = mongoose.model('mentoringModel', mentoringSchema);
const careerInfoModel = mongoose.model('careerInfoModel', careerInfoSchema);
const userModel = mongoose.model('userModel', userSchema);
const mentorModel = mongoose.model('mentorModel', mentorSchema);
const purchaseHistoryModel = mongoose.model('purchaseHistoryModel', purchaseHistorySchema);
const reviewModel = mongoose.model('reviewModel', reviewSchema);
const adminModel = mongoose.model('adminModel', adminSchema);

module.exports = { careerInfoModel, mentoringModel, userModel, mentorModel, purchaseHistoryModel, reviewModel, adminModel, mongoose }
;
