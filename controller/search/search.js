const searchEngine = require('./index');

module.exports = (req, res) => {
  let { keyword, model, page } = req.query;
  keyword = decodeURIComponent(keyword).split(' ');

  searchEngine((error, data) => {
    if (error) {
      console.log(error);
      res.status(500).send();
    } else {
      res.json(data);
    }
  }, keyword, model, page);
}
;
