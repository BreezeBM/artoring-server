const getHandler = require('./getMentor');
const modifiMentor = require('./postMentor');

const mentorController = {
  getMentor: getHandler,
  modifiMentor
};

module.exports = mentorController;
