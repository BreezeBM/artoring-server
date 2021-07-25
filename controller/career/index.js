const getHandler = require('./getTeachCards');
const postCardHandler = require('./postTeachCards');
const deleteCardHandler = require('./deleteTeachCard');
const putCardHandler = require('./putTeachCards');

const careerCardController = {
  getCard: getHandler,
  postCard: postCardHandler,
  deleteCard: deleteCardHandler,
  putCard: putCardHandler
};

module.exports = careerCardController;
