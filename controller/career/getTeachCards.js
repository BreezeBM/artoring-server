const { careerTeachCardModel } = require('../../model');

module.exports = async (req, res) => {
  // params에 id가 담겨있으면 id에 해당하는 상세정보 리턴. 아니면 최신의 데이터 8개를 리턴

  try {
    if (req.params.id) {
      const data = await careerTeachCardModel.aggregate([
        { $match: { id: Number(req.params.id) } },
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
      const query = {};
      const option = {};

      if (req.query.category) query.tags = { $in: [req.query.category] };
      if (req.query.size) option.limit = req.query.size;
      else option.limit = 8;
      if (req.query.page) {
        option.skip = (req.query.page - 1) * 16;
        option.limit = 16;
      }
      console.log(query, option);
      const data = await careerTeachCardModel.find(query, null, option);

      res.status(200).json(data);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
