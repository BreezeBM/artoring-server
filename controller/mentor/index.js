import getHandler from './getMentor.js';
import modifiMentor from './postMentor.js';

import getProject from './getProject.js';
const mentorController = {
  getMentor: getHandler,
  modifiMentor,
  getProject
};

export default mentorController