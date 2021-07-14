const express = require('express');
const router = express.Router();
const { uploaderController } = require('../../controller');

const multer = require('multer');
const multers3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/../../config/s3.json');

const s3 = new aws.S3();
const upload = multer({
  storage:
  multers3({
    s3: s3,
    bucket: 'artoring-container',
    key: function (req, file, cb) {
      cb(null, 'img/' + Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
    }
  })
}, 'NONE');

router.post('/img', upload.any(), uploaderController.handler);

module.exports = router
;