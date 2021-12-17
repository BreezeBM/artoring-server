import * as models from '../../model/index.js';
import schedule from 'node-schedule';

const deletePurchase = schedule.scheduleJob('*/5 * * * *', async function () {
  try {
    const twentyMinutesAgo = new Date();
    twentyMinutesAgo.setTime(twentyMinutesAgo.getTime() - 20 * 60 * 1000);

    const targets = await models.purchaseHistoryModel.find({
      progress: 'inprogress',
      createdAt: { $lte: twentyMinutesAgo }
    });

    targets.forEach((target) => {
      models.mentoringModel.findOne({ _id: target.targetId }, { $inc: { joinedParticipants: -1 } });

      models.purchaseHistoryModel.deleteOne({ _id: target._id });
    });
  } catch (error) {
    console.error(error);
  }
});

export default deletePurchase;