const { careerTeachCardModel } = require('../../model');

module.exports = async (req, res) => {
  try {
    const data = await careerTeachCardModel.find({}).limit(8);
    res.json(data);
  } catch (e) {
    res.status(500).json(e.message);
  }
}
;
