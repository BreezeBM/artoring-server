const express = require('express');
const cors = require('cors');
const router = require('./routes');

const helmet = require('helmet');
const fs = require('fs');
const https = require('https');
const cookieParser = require('cookie-parser');
const inactiveAccount = require('./controller/tools/inactiveAccount');

require('moment-timezone');
require('dotenv').config();
const db = require('./db');

const port = process.env.PORT || 4000;

const app = express();

db();

app.use(express.json({ extended: false }));
app.use(cookieParser());

app.use(helmet());

const whitelist = [
  'https://insideart-dev.artoring.com',
  'https://artoring.com',
  'https://www.gstatic.com',
  undefined,
  process.env.ADMIN_URL
]; // undefined == EBS health check or 다른서버

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? function (origin, callback) {
        callback(null, true);
      }
    : function (origin, callback) {
      if (whitelist.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
  // function (origin, callback) {
  //   callback(null, true);
  // },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true
}));

app.get('/', (req, res, next) => {
  process.env.NODE_ENV === 'development'
    ? next(null, true)
    : (() => {
        if (req.headers.host.includes(process.env.EC2_IP)) next();
        else res.status(401).send();
      })();
}, (req, res) => {
  res.send();
});

app.use('/', router);

module.exports = process.env.NODE_ENV === 'development'
  ? https.createServer({
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem')
    }, app).listen(
      port,
      () => console.log(`🚀 https Server is starting on ${port}`)
    )
  : app.listen(port, () => {
    console.log(`🚀 Server is starting on ${port}`);
  });

// module.exports = https.createServer({ key: fs.readFileSync('./key.pem'), cert: fs.readFileSync('./cert.pem') }, app).listen(port, () => console.log(`🚀 https Server is starting on ${port}`));
