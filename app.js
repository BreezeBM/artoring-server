const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
const helmet = require('helmet');

require('moment-timezone');
require('dotenv').config();

moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = process.env.PORT ? process.env.PORT : 8081;

const app = express();
const env = process.env;

db();

app.use(express.json({ extended: false }));
app.use(cors({
  origin: env.NODE_ENV === 'production' ? '*' : 'https://artoring.com',
  methods: env.NODE_ENV === 'production' ? '*' : 'GET,POST,PUT,DELETE,OPTION'
}));

// X-powered-by제외하는 간단한 보안 모듈
app.use(helmet());

app.get('/', (req, res) => {
  res.send('ok?');
});
app.use('/', router);
module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
