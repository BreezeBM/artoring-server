const { reviewModel } = require('../../model');

module.exports = async (req, res) => {
  const ids = JSON.parse(decodeURIComponent(req.params.cardids));

  const reviews = await reviewModel.find({ id: { $in: ids } });

  res.json(reviews);
}
;
