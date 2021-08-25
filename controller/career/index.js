const getHandler = require("./getMentoringCards");
const postCardHandler = require("./postMentoringCards");
const deleteCardHandler = require("./deleteMentoringCard");
const postCareerCard = require("./postCareerCard");
const getInfo = require("./getCareerInfo");

const careerCardController = {
  getCard: getHandler,
  postCard: postCardHandler,
  deleteCard: deleteCardHandler,
  putCard: postCardHandler,
  postCareerCard: postCard,
  getInfo,
};

module.exports = careerCardController;
