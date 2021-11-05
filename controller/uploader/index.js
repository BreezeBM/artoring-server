export default {
  middle: (req, res, next) => {
    next();
  },
  handler: (req, res) => {
    // multer 미들웨어를 거치면 req.files에 S3 주소가 담겨져 온다.
    // 하지만 S3 URL은 직접 접근이 불가능하다. 클라우드 프론트 주소로 우회접속해야 한다.
    // 서버에서 전송받은 주소를 그대로 사용하여 403 에러를 내뿐게 하는것을 방지하고자 URL을 수정했다.

    req.file.location = 'https://artoring.com/'.concat(req.file.key);
    res.json(req.file);
  }
};
