const getHandler = require('./getMentor');
const modifiMentor = require('./postMentor');

const getProject = require('./getProject');
const mentorController = {
  getMentor: getHandler,
  modifiMentor,
  getProject
};

module.exports = mentorController;
