const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
const helmet = require('helmet');

require('moment-timezone');
const dotenv = require('dotenv');

moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = process.env.PORT ? process.env.PORT : 4000;

const app = express();
const env = process.env;

db();

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

app.use(express.json({ extended: false }));
app.use(cors({
  origin: env.NODE_ENV !== 'production' ? '*' : 'https://artoring.com',
  methods: env.NODE_ENV !== 'production' ? '*' : 'GET,POST,PUT,DELETE,OPTION'
}));

// X-powered-by제외하는 간단한 보안 모듈
app.use(helmet());

app.get('/', (req, res) => {
  res.send('ok?');
});
app.use('/', router);

app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});

module.exports = app;
