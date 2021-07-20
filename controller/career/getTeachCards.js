const { careerTeachCardModel } = require('../../model');

module.exports = async (req, res) => {
  console.log(req.params);
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
            intro: '$mentor.intro'
          }
        }
      ]);
      // console.log('here?');
      // // 유저 리뷰 렌더링에 필요한 썸네일, 이름를 가져오는 부분.
      // const ids = [];
      // for (const index of data[0].reviews) {
      //   ids.push(index.userId);
      // }
      // console.log(ids);
      // const reviews = await reviewModel.aggregate([{
      //   $match: {
      //     userId: { $in: ids }
      //   }
      // }, {
      //   $lookup: { from: 'usermodels', localField: 'userId', foreignField: '_id', as: 'users' }
      // }, {
      //   $project: {
      //     text: '$text',
      //     reat: '$rate',
      //     modifiedAt: '$modifiedAt',
      //     thumb: '$users.thumb',
      //     name: '$users.name'
      //   }
      // }]);

      // data[0].reviews = reviews;
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
