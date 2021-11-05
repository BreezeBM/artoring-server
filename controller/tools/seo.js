// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import aws from 'aws-sdk';
import path from 'path';
const __dirname = path.resolve();
// const aws = require('aws-sdk');
// aws.config.loadFromPath(__dirname + '/../../config/s3.json');
aws.config.loadFromPath(__dirname + '/config/s3.json');
aws.config.update({ accessKeyId: process.env.S3_KEY_ID });
aws.config.update({ secretAccessKey: process.env.S3_ACC_KEY });

const s3 = new aws.S3({ params: { Bucket: 'artoring.com' } });

// todo: index.html 업로드
/**
 *
 * @param {*} path String, 객체가 업로드 될 위치
 * @param {*} data Array, 테그에 저장될 데이터
    data {
      key: 메타 태그 네임 혹은 프로퍼티에 저장될 데이터 식별값
      value: 메타 태그 네임 혹은 프로퍼티에 저장될 데이터
      isProperty: name 혹은 프로퍼티 지정
    }
 */
const createSeo = (path, data) => {
  const params = {
    Key: path,
    Body: '',
    ContentType: 'text/html'
  };

  const html =
  `<html><head><meta charset="utf-8" /><title>아토링</title>${data.map(ele => { if (ele.isProperty) { return (`<meta property=${ele.key} content=${ele.value} />`); } else { return (`<meta name=${ele.key} content=${ele.value} />`); } }).join('')}</head><body></body></html>`;

  params.Body = html;

  return s3.upload(params).promise();
};

// 문서 삭제시 seo 제거
const deleteSeo = (path) => {
  return s3.deleteObject({ Key: path }).promise();
};

export { createSeo, deleteSeo };
