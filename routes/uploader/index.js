import express from 'express';

import { uploaderController } from '../../controller/index.js';
// const { uploaderController } = require("../../controller");

import multer from 'multer';
import multers3 from 'multer-s3';
// const multer = require("multer");
// const multers3 = require("multer-s3");
import dotenv from 'dotenv';

import aws from 'aws-sdk';
// const fs = require("fs");
// const aws = require("aws-sdk");
import path from 'path';

const router = express.Router();
dotenv.config();
const __dirname = path.resolve();

// aws.config.loadFromPath(__dirname + "/../../config/s3.json");
aws.config.loadFromPath(__dirname + '/config/s3.json');
aws.config.update({ accessKeyId: process.env.S3_KEY_ID });
aws.config.update({ secretAccessKey: process.env.S3_ACC_KEY });

const s3 = new aws.S3();
const upload = multer({
  storage: multers3({
    s3: s3,
    bucket: 'artoring-container',
    contentType: multers3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, 'image/' + Date.now() + '_' + file.originalname); // 이름 설정
    }
  })
});

router.post('/img', upload.single('file'), uploaderController.default.handler);

router.use('/*', (req, res) => res.status(404).send());

export default router;
// ;
