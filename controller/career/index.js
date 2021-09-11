const getHandler = require('./getMentoringCards');
const deleteMentoring = require('./deleteMentoringCard');
const deleteInfo = require('./deleteInfoCard');
const postCareerCard = require('./postCareerCard');
const getInfo = require('./getCareerInfo');

const careerCardController = {
  getCard: getHandler,
  postCard: postCareerCard,
  deleteCard: deleteMentoring,
  deleteInfo,
  putCard: postCareerCard,
  postCareerCard: postCareerCard,
  getInfo
};

module.exports = careerCardController;
