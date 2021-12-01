import schedule from 'node-schedule';

import * as models from '../../model/index.js';
import mongoose from 'mongoose';

import mentoringSchema from '../../db/mentoringSchema.js';
import careerInfoSchema from '../../db/careerInfoSchema.js';
import userSchema from '../../db/userSchema.js';
import purchaseHistorySchema from '../../db/purchaseHistorySchema.js';
import reviewSchema from '../../db/reviewSchema.js';
import adminSchema from '../../db/adminSchema.js';

// 1시간마다 종료된 멘토의 프로그램을 찾아서 멘토의 정산금액을 추가해주는 크론탭
const writeToReplica = schedule.scheduleJob({ hour: 3, minute: 0, tz: 'Asia/Seoul' }, () => {
  // const writeToReplica = async () => {
  const pass = encodeURIComponent(process.env.MONGO_SEC_KEY);
  const uri = process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/artoring-replica'
    : `mongodb+srv://${process.env.MONGO_ACC_KEY}:${pass}@cluster0.pij1x.mongodb.net/artoring-replica?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;

  let replica;
  try {
    replica = mongoose.createConnection(uri, {
      dbName: 'artoring-replica',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('mongodb replica connected');
  } catch (err) {
    if (err) {
      console.error('mongodb replica connection error', err);
    }
  }

  const replicaMentoringModel = replica.model('mentoringModel', mentoringSchema);
  const replicaCareerInfoModel = replica.model('careerInfoModel', careerInfoSchema);
  const replicaUserModel = replica.model('userModel', userSchema);
  const replicaPurchaseHistoryModel = replica.model('purchaseHistoryModel', purchaseHistorySchema);
  const replicaReviewModel = replica.model('reviewModel', reviewSchema);
  const replicaAdminModel = replica.model('adminModel', adminSchema);

  const originModels = [models.mentoringModel, models.careerInfoModel, models.userModel, models.purchaseHistoryModel, models.adminModel, models.reviewModel, models.adminModel];
  const replicaModels = [replicaMentoringModel, replicaCareerInfoModel, replicaUserModel, replicaPurchaseHistoryModel, replicaAdminModel, replicaReviewModel, replicaAdminModel];

  // 몽고디비 흐름제어용
  const stopwatch = () => {
    return new Promise((resolve, reject) => {
    // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
    // In this example, we use setTimeout(...) to simulate async code.
    // In reality, you will probably be using something like XHR or an HTML5 API.
      setTimeout(() =>
        resolve(), 5000);
    });
  };

  for (const n in originModels) {
    // await stopwatch();
    originModels[n].find()
      .then(async (docs) => {
        let count = 0;
        for (let i = 0; i < docs.length; i++) {
          replicaModels[n].findByIdAndUpdate(docs[i]._id, { $set: docs[i] }, { upsert: true });
          if (count === 2000) {
            await stopwatch();
            count = 0;
          } else count++;
        }
      });
  }
});

export default writeToReplica;
