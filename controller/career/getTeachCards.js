const { careerTeachCardModel } = require('../../model');

module.exports = async (req, res) => {
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

      res.json(data);
    } else {
      const data = await careerTeachCardModel.find({}).limit(8);
      res.json(data);
    }
  } catch (e) {
    res.status(500).json(e.message);
  }
}
;
