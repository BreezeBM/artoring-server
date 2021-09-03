const express = require('express');
const router = express.Router();
const { uploaderController } = require('../../controller');

const multer = require('multer');
const multers3 = require('multer-s3');
require('dotenv').config();
const fs = require('fs');
const aws = require('aws-sdk');

aws.config.loadFromPath(__dirname + '/../../config/s3.json');
aws.config.update({ accessKeyId: process.env.S3_KEY_ID });
aws.config.update({ secretAccessKey: process.env.S3_ACC_KEY });

const s3 = new aws.S3();
const upload = multer({
  storage:
  multers3({
    s3: s3,
    bucket: 'artoring-container',
    key: function (req, file, cb) {
      cb(null, 'image/' + Date.now() + '_' + file.originalname); // 이름 설정
    }
  })
});

router.post('/img', upload.single('file'), uploaderController.handler);

router.use('/*', (req, res) => res.status(404).send());

module.exports = router;
// ;
