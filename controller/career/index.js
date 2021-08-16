const getHandler = require('./getMentoringCards');
const postCardHandler = require('./postMentoringCards');
const deleteCardHandler = require('./deleteMentoringCard');

const careerCardController = {
  getCard: getHandler,
  postCard: postCardHandler,
  deleteCard: deleteCardHandler,
  putCard: postCardHandler
};

module.exports = careerCardController;
