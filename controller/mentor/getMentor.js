const { mentorModel, mongoose } = require('../../model');

module.exports = async (req, res) => {
  // params에 id가 담겨있으면 id에 해당하는 상세정보 리턴. 아니면 최신의 데이터 8개를 리턴
  try {
    // 특정 멘토의 상세 데이터 요청시

    if (req.params.id) {
      const data = await mentorModel.aggregate([
        {
          $match: {
            $or: [
              { userId: mongoose.Types.ObjectId(req.params.id) },
              { _id: mongoose.Types.ObjectId(req.params.id) }
            ]
          }
        },
        { $lookup: { from: 'usermodels', as: 'user', localField: 'userId', foreignField: '_id' } },
        { $unwind: '$user' },
        {
          $project: {
            avaliableTime: '$avaliableTime',
            descriptionForMentor: '$descriptionForMentor',
            category: '$category',
            userName: '$user.name',
            thumb: '$thumb',
            id: '$_id'
          }
        }
      ]);
      res.json(data[0]);
      // 카드 리스트들을 요청시
    } else {
      // // 몽고디비 쿼리 옵션
      // const option = {};
      // const query = {};
      // // 쿼리스트링으로 세부 필터링 요청 정보가 넘어올 경우
      // // 카테고리가 넘어온 경우 쿼리에 명시
      // if (req.query.category) query.tags = { $in: [req.query.category] };

      // // 정렬순서가 넘어온 경우
      // if (req.query.orderby) {
      //   const order = req.query.orderby;

      //   // 최신순 - 내림차순
      //   if (order === 'new') option.sort = { createdAt: -1 };

      //   // 인기순 - 내림차순
      //   else option.sort = { likesCount: 1 };
      // }
      // // 페이지네이션에 필요한 페이지 요청시
      // if (req.query.page) {
      //   // (req.query.page - 1) * 16 개를 뛰어넘고
      //   option.skip = (req.query.page - 1) * (req.query.size || 16);

      //   // 이후 16개를 쿼리한다.
      //   option.limit = 16;
      // }
      // // 리턴되는 문서의 크기정보가 있다면, 그만큼의 데이터를 전송한다.
      // if (req.query.size) option.limit = Number(req.query.size);

      // const data = await mentorModel.find({}, null, option);

      // res.status(200).json({ cardList: data });
      // 쿼리스트링에 아무것도 없음 == 최신순으로 8개 요청
      // 커리어 교육 페이지 메인에서 사용됨
      // } else {
      //   // 각 특성에 맞는 문서들의 수를 리턴.
      //   const basic = await mentorModel.countDocuments({ isGroup: req.query.isGroup });
      //   const edu = await mentorModel.countDocuments({ isGroup: req.query.isGroup, tags: { $in: ['교육'] } });
      //   const lecture = await mentorModel.countDocuments({ isGroup: req.query.isGroup, tags: { $in: ['특강'] } });
      //   const gether = await mentorModel.countDocuments({ isGroup: req.query.isGroup, tags: { $in: ['모임'] } });

      //   const total = { basic, edu, lecture, gether };

      //   res.status(200).json({ total });
      mentorModel.aggregate([
        { $lookup: { from: 'usermodels', as: 'user', localField: 'userId', foreignField: '_id' } },
        { $unwind: '$user' },
        {
          $project: {
            avaliableTime: '$avaliableTime',
            current: '$user.current',
            descriptionForMentor: '$descriptionForMentor',
            category: '$category',
            userName: '$user.name',
            thumb: '$thumb',
            id: '$_id'
          }
        }, {
          $facet: {
            cardList: [{ $skip: (req.query.page - 1) * (req.query.size || 8) }, { $limit: Number(req.query.size) || 8 }],
            totalCount: [
              {
                $count: 'count'
              }
            ]
          }
        }
      ])
        .then(data => {
          res.json(data[0]);
        })
        .catch(e => { throw e; });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
