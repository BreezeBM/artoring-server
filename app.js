const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
const helmet = require('helmet');

require('moment-timezone');
require('dotenv').config();

moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = 4000;

const app = express();
const env = process.env;

db();

app.use(express.json({ extended: false }));
app.use(cors({
  origin: env.NODE_ENV === 'production' ? '*' : 'https://artoring.com',
  methods: env.NODE_ENV === 'production' ? '*' : 'GET,POST,PUT,DELETE,OPTION'
}));

app.use(helmet());
app.use('/', router);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/', (req, res) => {
  res.send('ok?');
});
module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
