/* semistandard-disable camelcase */
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';

import helmet from 'helmet';
import fs from 'fs';
import https from 'https';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import inactiveAccount from './controller/tools/inactiveAccount.js';
import { addSettlementMentoring, addSettlementClass } from './controller/crontab/addPayments1Hours.js';
import writeToReplica from './controller/crontab/replica.js';
import deletePurchase from './controller/tools/deletePurchase';

import apm from 'elastic-apm-node';
// const fs = require("fs");
// const https = require("https");
// const cookieParser = require("cookie-parser");
// const inactiveAccount = require("./controller/tools/inactiveAccount");

import connectDB from './db/index.js';

dotenv.config();

addSettlementClass.schedule();
addSettlementMentoring.schedule();
inactiveAccount.schedule();
deletePurchase.schedule();

writeToReplica.schedule();

if (process.env.NODE_ENV === 'production') {
  apm.start({
    serviceName: 'backend status',
    secretToken: process.env.APM_TOKEN,

    // Set the custom APM Server URL (default: http://localhost:8200)
    serverUrl: process.env.APM_URL,

    // Set the service environment
    environment: 'production'
  });
}

const port = process.env.PORT || 4000;

const app = express();

connectDB();

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

export default process.env.NODE_ENV === 'development'
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
