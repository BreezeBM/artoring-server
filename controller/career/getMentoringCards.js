const { mentoringModel, mongoose } = require('../../model');

module.exports = async (req, res) => {
  // params에 id가 담겨있으면 id에 해당하는 상세정보 리턴. 아니면 최신의 데이터 8개를 리턴
  try {
    // 특정 카드의 상세 데이터 요청시

    if (req.params.id) {
      const data = await mentoringModel.aggregate([
        // 모델에서 _id가 일치한것
        { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
        // 관계형 DB의 Join과 같이 다른 콜렉션(mentor 콜렉션)에서 특정 조건에 해당되는 도큐먼트들을 임포트. === inner join
        { $lookup: { from: 'mentormodels', localField: 'moderatorId', foreignField: 'userId', as: 'mentor' } },
        {
          // match와 lookup으로 가져온 데이터중 어떤것들을 결과물에 나타나게 할것인가
          $project: {
            availableTime: '$availableTime',
            likesCount: '$likesCount',
            joinedParticipants: '$joinedParticipants',
            moderatorId: '$moderatorId',
            price: '$price',
            rate: '$rate',
            reviews: '$reviews',
            thumb: '$thumb',
            tags: '$tags',
            title: '$title',
            startDate: '$startDate',
            endDate: '$endDate',
            detailInfo: '$detailInfo',
            maximumParticipants: '$maximumParticipants',
            category: '$category',
            subCategory: '$subCategory',
            descriptionForMentor: '$mentor.descriptionForMentor',
            intro: '$mentor.intro',
            _id: '$_id'
          }
        }
      ]);

      res.json(data[0]);
      // 카드 리스트들을 요청시
    } else {
      // 몽고디비 쿼리
      const query = { isGroup: req.query.isGroup };

      // 몽고디비 쿼리 옵션
      const option = {};
      let data;
      // 쿼리스트링으로 세부 필터링 요청 정보가 넘어올 경우
      if (Object.keys(req.query).length >= 2) {
        // 카테고리가 넘어온 경우 쿼리에 명시
        if (req.query.category) query.tags = { $in: [req.query.category] };

        // 정렬순서가 넘어온 경우
        if (req.query.orderby) {
          const order = req.query.orderby;

          // 최신순 - 내림차순
          if (order === 'new') option.sort = { startDate: -1 };

          // 가격 높은순 - 내림차순
          else if (order === 'high') option.sort = { price: -1, startDate: -1 };

          // 가격 높은순 - 올림차순
          else if (order === 'low') option.sort = { price: 1, startDate: -1 };

          // 인기순 - 내림차순
          else option.sort = { likesCount: 1 };
        }
        // 페이지네이션에 필요한 페이지 요청시
        if (req.query.page) {
          // (req.query.page - 1) * 16 개를 뛰어넘고
          option.skip = (Number(req.query.page) - 1) * 16;
          if (req.query.limit) option.skip = (Number(req.query.page) - 1) * req.query.limit;

          // 이후 16개를 쿼리한다.
          option.limit = 16;
        }
        // 리턴되는 문서의 크기정보가 있다면, 그만큼의 데이터를 전송한다.
        if (req.query.size) option.limit = Number(req.query.size);

        data = await mentoringModel.find(query, null, option);

        res.status(200).json({ cardList: data });
      // 쿼리스트링에 아무것도 없음 == 최신순으로 8개 요청
      // 커리어 교육 페이지 메인에서 사용됨
      } else {
        // 각 특성에 맞는 문서들의 수를 리턴.

        const basic = await mentoringModel.countDocuments({ isGroup: req.query.isGroup });
        const edu = await mentoringModel.countDocuments({ isGroup: req.query.isGroup, tags: { $in: ['교육'] } });
        const lecture = await mentoringModel.countDocuments({ isGroup: req.query.isGroup, tags: { $in: ['특강'] } });
        const gether = await mentoringModel.countDocuments({ isGroup: req.query.isGroup, tags: { $in: ['모임'] } });

        const total = { basic, edu, lecture, gether };

        res.status(200).json({ total });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
