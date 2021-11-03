import getHandler from './getMentoringCards.js';
import deleteMentoring from './deleteMentoringCard.js';
import deleteInfo from './deleteInfoCard.js';
import postCareerCard from './postCareerCard.js';
import getInfo from './getCareerInfo.js';

const careerCardController = {
  getCard: getHandler,
  postCard: postCareerCard,
  deleteCard: deleteMentoring,
  deleteInfo,
  putCard: postCareerCard,
  postCareerCard: postCareerCard,
  getInfo
};

export default careerCardController;
