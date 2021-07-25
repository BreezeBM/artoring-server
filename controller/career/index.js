const getHandler = require('./getTeachCards');
const postCardHandler = require('./postTeachCards');
const deleteCardHandler = require('./deleteTeachCard');

const careerCardController = {
  getCard: getHandler,
  postCard: postCardHandler,
  deleteCard: deleteCardHandler,
  putCard: postCardHandler
};

module.exports = careerCardController;
