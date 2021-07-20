const { reviewModel } = require('../../model');

module.exports = async (req, res) => {
  const ids = JSON.parse(decodeURIComponent(req.params.cardids));

  console.log(ids);
  const reviews = await reviewModel.find({ id: { $in: ids } });

  res.json(reviews);
}
;
