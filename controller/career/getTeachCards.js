const { careerTeachCardModel } = require('../../model');

module.exports = async (req, res) => {
  try {
    console.log('test');

    const data = await careerTeachCardModel.find({}).limit(8);
    console.log('done?');
    res.json(data);
  } catch (e) {
    res.status(500).json(e.message);
  }
}
;
