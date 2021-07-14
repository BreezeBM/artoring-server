const getHandler = require('./getTeachCards');
const postCardHandler = require('./postTeachCards');
const deleteCardHandler = require('./deleteTeachCard');
const putCardHandler = require('./putTeachCards');

const careerCardController = {
  getAllCard: getHandler,
  postCard: postCardHandler,
  deleteCard: deleteCardHandler,
  putCard: putCardHandler
};

module.exports = careerCardController;
