const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');
const cookieParser = require('cookie-parser');

require('moment-timezone');
require('dotenv').config();

moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = 4000;

const app = express();

db();

app.use(cookieParser());
app.use(express.json({ extended: false }));
app.use(helmet());
const whitelist = ['https://insideart-dev.artoring.com', 'https://artoring.com', undefined]; // undefined == EBS health check

app.use(express.json({ extended: false }));
app.use(cors({
  origin: process.env.NODE_ENV !== 'production' ? '*' : function (origin, callback) {
    console.log('Origin : ', origin);
    if (whitelist.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  methods: process.env.NODE_ENV !== 'production' ? '*' : 'GET,POST,PUT,DELETE,OPTIONS'
}));

// X-powered-by제외하는 간단한 보안 모듈
app.use(helmet());

app.get('/', (req, res) => {
  res.cookie('test', true, {
    secure: true
  });
  console.log(req.cookies);
  res.send();
});

app.use('/', router);

module.exports = process.env.NODE_ENV === 'development'
  ? https.createServer({ key: fs.readFileSync('./key.pem'), cert: fs.readFileSync('./cert.pem') }, app).listen(port, () => console.log(`🚀 https Server is starting on ${port}`))
  : app.listen(port, () => {
    console.log(`🚀 Server is starting on ${port}`);
  });
