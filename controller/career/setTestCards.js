const { careerTeachCardModel } = require('../../model');

module.exports = async (req, res) => {
  try {
    await careerTeachCardModel.insertMany([{
      thumb: '{ type: String, required: true }',
      title: '{ type: String, required: true }',
      startDate: new Date(),
      endDate: new Date(),
      moderatorId: '60d95a5bee1d0f7922fed9f9',
      category: 'String',
      subCategory: 'String',
      detailInfo: 'String',
      availableTime: '{ mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] }',
      likesCount: 0,
      maximumParticipants: 0,
      joinedParticipants: 0,
      price: 0,
      rate: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      thumb: '{ type: String, required: true }',
      title: '{ type: String, required: true }',
      startDate: new Date(),
      endDate: new Date(),
      moderatorId: '60d95a5bee1d0f7922fed9f9',
      category: 'String',
      subCategory: 'String',
      detailInfo: 'String',
      availableTime: '{ mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] }',
      likesCount: 0,
      maximumParticipants: 0,
      joinedParticipants: 0,
      price: 0,
      rate: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      thumb: '{ type: String, required: true }',
      title: '{ type: String, required: true }',
      startDate: new Date(),
      endDate: new Date(),
      moderatorId: '60d95a5bee1d0f7922fed9f9',
      category: 'String',
      subCategory: 'String',
      detailInfo: 'String',
      availableTime: '{ mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] }',
      likesCount: 0,
      maximumParticipants: 0,
      joinedParticipants: 0,
      price: 0,
      rate: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      thumb: '{ type: String, required: true }',
      title: '{ type: String, required: true }',
      startDate: new Date(),
      endDate: new Date(),
      moderatorId: '60d95a5bee1d0f7922fed9f9',
      category: 'String',
      subCategory: 'String',
      detailInfo: 'String',
      availableTime: '{ mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] }',
      likesCount: 0,
      maximumParticipants: 0,
      joinedParticipants: 0,
      price: 0,
      rate: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      thumb: '{ type: String, required: true }',
      title: '{ type: String, required: true }',
      startDate: new Date(),
      endDate: new Date(),
      moderatorId: '60d95a5bee1d0f7922fed9f9',
      category: 'String',
      subCategory: 'String',
      detailInfo: 'String',
      availableTime: '{ mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] }',
      likesCount: 0,
      maximumParticipants: 0,
      joinedParticipants: 0,
      price: 0,
      rate: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      thumb: '{ type: String, required: true }',
      title: '{ type: String, required: true }',
      startDate: new Date(),
      endDate: new Date(),
      moderatorId: '60d95a5bee1d0f7922fed9f9',
      category: 'String',
      subCategory: 'String',
      detailInfo: 'String',
      availableTime: '{ mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] }',
      likesCount: 0,
      maximumParticipants: 0,
      joinedParticipants: 0,
      price: 0,
      rate: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    res.send();
  } catch (e) {
    res.json(e.message);
  }
}
;
