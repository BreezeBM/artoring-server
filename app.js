const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');

require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = process.env.PORT ? process.env.PORT : 4000;

const app = express();

db();

app.use(express.json({ extended: false }));
app.use(cors({
  origin: '*',
  methods: '*'
}));
app.use(helmet());

app.use('/', router);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/', (req, res) => {
  res.send('ok?');
});
module.exports = process.env.NODE_ENV === 'development'
  ? https.createServer({ key: fs.readFileSync('./key.pem'), cert: fs.readFileSync('./cert.pem') }, app).listen(port, () => console.log(`🚀 Server is starting on ${port}`))
  : app.listen(port, () => {
    console.log(`🚀 Server is starting on ${port}`);
  });
