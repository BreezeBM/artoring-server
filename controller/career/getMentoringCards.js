const { mentoringModel } = require('../../model');

module.exports = async (req, res) => {
  // params에 id가 담겨있으면 id에 해당하는 상세정보 리턴. 아니면 최신의 데이터 8개를 리턴

  try {
    if (req.params.id) {
      const data = await mentoringModel.aggregate([
        { $match: { _id: Number(req.params._id), isGroup: true } },
        { $lookup: { from: 'mentormodels', localField: 'moderatorId', foreignField: 'userId', as: 'mentor' } },
        {
          $project: {
            availableTime: '$availableTime',
            likesCount: '$likesCount',
            joinedParticipants: '$joinedParticipants',
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
      res.json(data);
    } else {
      const query = { isGroup: true };
      const option = {};

      Object.keys(req.query);
      let data;

      if (Object.keys(req.query).length >= 1) {
        if (req.query.category) query.tags = { $in: [req.query.category] };
        if (req.query.orderby) {
          const order = req.query.orderby;
          if (order === 'new') option.sort = { startDate: -1 };
          else if (order === 'high') option.sort = { price: -1, startDate: -1 };
          else if (order === 'low') option.sort = { price: 1, startDate: -1 };
          else option.sort = { likesCount: 1 };
        }
        if (req.query.page) {
          option.skip = (req.query.page - 1) * 16;
          option.limit = 16;
        }
        if (req.query.size) option.limit = Number(req.query.size);

        data = await mentoringModel.find(query, null, option);
        res.status(200).json({ cardList: data });
      } else {
        const basic = await mentoringModel.countDocuments();
        const edu = await mentoringModel.countDocuments({ tags: { $in: ['교육'] } });
        const lecture = await mentoringModel.countDocuments({ tags: { $in: ['특강'] } });
        const gether = await mentoringModel.countDocuments({ tags: { $in: ['모임'] } });

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
