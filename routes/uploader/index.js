const express = require('express');
const router = express.Router();
const { uploaderController } = require('../../controller');

const multer = require('multer');
const multers3 = require('multer-s3');
const dotenv = require('dotenv');

const aws = require('aws-sdk');

const fs = require('fs');

let path = '.env';

try {
  if (fs.existsSync(path)) {
    // file exists

    path = '.env';
  }
} catch (err) {
  path = '/etc/profile.d/sh.local';
}

dotenv.config(path);
aws.config.loadFromPath(__dirname + '/../../config/s3.json');
aws.config.update({ secretAccessKey: process.env.S3_ACC_KEY });

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

router.post('/img', upload.single('file'), uploaderController.handler);

router.use('/*', (req, res) => res.status(404).send());

module.exports = router;
// ;
