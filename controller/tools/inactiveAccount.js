import schedule from "node-schedule";

import * as models from "../../model/index.js"
// const { userModel } = require("../../model");
// const { startSession } = require("mongoose");

// 매일 10시에 User Table을 조회한다.
const inactiveAccount = schedule.scheduleJob(
  "00 00 10 * * 0-6",
  async function () {
    // transaction
    // const session = await MyModel.startSession();
    try {
      const lastYear = new Date();
      lastYear.setTime(lastYear.getTime() - (365 * 24 * 60 * 60 * 1000));

      // session.startTransaction();

      // User Table에서, active컬럼이 true인 사람중에, 마지막 접속이 현재 시간 기준으로 1년이 넘은 유저를 찾는다.
      const targets = await models.userModel.find({
        active: true,
        loginedAt: { $lte: lastYear },
      }).sort({ loginedAt: 1 });
      // 위의 조건에 맞는 모든 유저에게 휴면계정 이메일 전송 및 active컬럼 false로 변경
      targets.forEach((target) => {
        const userData = models.userModel.find({ _id: target._id }).select({
          _id: 0,
          email: 1,
        });
      });
      // 이메일 전송

      // active 변경
      await models.userModel.updateOne({ _id: target._id }, {
        $set: { active: false },
      });
      // await session.commitTransaction();
      // session.endSession();
    } catch (error) {
      // await session.abortTransaction();
      // session.endSession();
      console.error(error);
    }
  },
);

export default inactiveAccount;
