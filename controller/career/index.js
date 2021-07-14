const getHandler = require('./getTeachCards');
const postCardHandler = require('./postTeachCards');

const careerCardController = {
  getAllCard: getHandler,
  postCard: postCardHandler
};

module.exports = careerCardController;
