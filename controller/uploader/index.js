
module.exports = {
  middle: (req, res, next) => {
    next();
  },
  handler: (req, res) => {
    console.log(req);
    req.files.msg = [];
    res.json(req.files);
  }
}
;
