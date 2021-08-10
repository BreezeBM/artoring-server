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
      console.log(data);
      res.json(data);
    } else {
      const data = await careerTeachCardModel.find({}).limit(8);
      res.json(data);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
