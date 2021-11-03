import searchEngine from './index.js';

export default async (req, res) => {
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
