const getHandler = require('./getTeachCards');
const setTestData = require('./setTestCards');

const careerCardController = {
  getAllCard: getHandler,
  setTestData
};

module.exports = careerCardController
;
