import schedule from 'node-schedule';

import { purchaseHistoryModel, userModel } from '../../model/index.js';

// 1시간마다 종료된 멘토의 프로그램을 찾아서 멘토의 정산금액을 추가해주는 크론탭
const addSettlementMentoring = schedule.scheduleJob({ minute: 0, tz: 'Asia/Seoul' },
  () => {
    // 현재시각과 한시간 이전 사이에 종료된 프로그램 리스트를 불러와 이를 멘토 정산금액에 집어넣어야 한다.
    // 멘토링 클래스의 경우에는 여러 유저가 같은 프로그램을 동시에 듣기에 구매내역을 기반으로 동작하면 아니된다.
    purchaseHistoryModel.aggregate([
      { $match: { isSettled: false, originType: 'mentor', progress: 'completed' } },
      { $set: { isSettled: true } },
      {
        $lookup: {
          from: 'mentoringmodels',
          as: 'program',
          let: { targetId: '$targetId' },
          // 파이프라인을 이용해서 targetId 변수와 멘터링 문서의 _id가 일치하며 isGroup이 purchasedType과 일치하는 문서들만 추출
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$targetId']
                }
              }
            },
            {
              $project: {
                isGroup: '$isGroup',
                moderatorId: '$moderatorId'
              }
            }
          ]

        }
      },
      {
        $unwind: '$program'
      },
      {
        $project: {
          price: 1,
          program: 1,
          originType: 1
        }
      }

    ])
      .then(list => {
        return list.length > 0
          ? Promise.all(list.map(ele => {
          // 파이프라인 특성상 0번째 요소에 데이터가 있음.

            return purchaseHistoryModel.findByIdAndUpdate(ele._id, { $set: { isSettled: true } })
              .then(() => userModel.findByIdAndUpdate(ele.program.moderatorId, { $inc: { 'mentor.settledAmount': ele.price * 0.25 } }));
          }))
          : 0;
      });
  }
);

// 매일 서버시간 자정에 커리어 클래스 정산
const addSettlementClass = schedule.scheduleJob({ hour: 0, minute: 0, second: 0, tz: 'Asia/Seoul' }, () => {
  purchaseHistoryModel.aggregate([
    { $match: { isSettled: false, originType: 'teach', progress: 'completed' } },
    { $set: { isSettled: true } },
    {
      $lookup: {
        from: 'mentoringmodels',
        as: 'program',
        let: { targetId: '$targetId' },
        // 파이프라인을 이용해서 targetId 변수와 멘터링 문서의 _id가 일치하며 isGroup이 purchasedType과 일치하는 문서들만 추출
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$targetId']
              }
            }
          },
          {
            $project: {
              isGroup: '$isGroup',
              moderatorId: '$moderatorId',
              fee: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$program'
    },
    // 프로그램의 _id를 기준으로 중복되지 않는 데이터로 그룹핑하여 처리.
    // $project처럼 일부 필드만 볼수 있다.
    {
      $group: {
        _id: '$program._id',
        purchaseId: { $push: '$_id' },
        program: { $first: '$program' }
      }
    }

  ])
    .then(list => {
      return list.length > 0
        ? Promise.all(list.map(ele => {
        // 사전에 정해진 강사료 만큼 정산금액을 증가시킨다.
        // 각 문서의 purchaseId에 해당되는 문서의 _id목록이 있음. 이를 바탕으로 구매내역문서 업데이트
          return ele.purchaseId.forEach(id => purchaseHistoryModel.findByIdAndUpdate(id, { $set: { isSettled: true } }))
            .then(() => userModel.findByIdAndUpdate(ele.program.moderatorId, { $inc: { 'mentor.settledAmount': ele.fee || 0 } }));
        }))
        : 0;
    });
});

export { addSettlementMentoring, addSettlementClass };
