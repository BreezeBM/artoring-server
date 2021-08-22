const getHandler = require('./getMentoringCards');
const postCardHandler = require('./postMentoringCards');
const deleteCardHandler = require('./deleteMentoringCard');
const getInfo = require('./getCareerInfo');

const careerCardController = {
  getCard: getHandler,
  postCard: postCardHandler,
  deleteCard: deleteCardHandler,
  putCard: postCardHandler,
  getInfo
};

module.exports = careerCardController;
