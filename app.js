const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = 3000;

const app = express();

db();

app.use(express.json({ extended: false }));
app.use(cors({
  origin: '*',
  methods: '*'
}));

app.use('/', router);
app.disable('X-Powered-By');

module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
