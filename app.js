import express from "express";
import cors from "cors";
import router from "./routes/index.js";

import helmet from "helmet";
import fs from "fs";
import https from "https";
import cookieParser from "cookie-parser";
import inactiveAccount from "./controller/tools/inactiveAccount.js";
// const fs = require("fs");
// const https = require("https");
// const cookieParser = require("cookie-parser");
// const inactiveAccount = require("./controller/tools/inactiveAccount");

require("moment-timezone");
require("dotenv").config();
import * as db from "./db/index.js";

const port = process.env.PORT || 4000;

const app = express();

db();

app.use(express.json({ extended: false }));
app.use(cookieParser());

app.use(helmet());

const whitelist = [
  "https://insideart-dev.artoring.com",
  "https://artoring.com",
  "https://www.gstatic.com",
  undefined,
  process.env.ADMIN_URL,
]; // undefined == EBS health check or 다른서버

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === "development"
    ? function (origin, callback) {
      callback(null, true);
    }
    : function (origin, callback) {
      if (whitelist.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  // function (origin, callback) {
  //   callback(null, true);
  // },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  credentials: true,
}));

app.get("/", (req, res, next) => {
  process.env.NODE_ENV === "development" ? next(null, true) : (() => {
    if (req.headers.host.includes(process.env.EC2_IP)) next();
    else res.status(401).send();
  })();
}, (req, res) => {
  res.send();
});

app.use("/", router);

module.exports = process.env.NODE_ENV === "development"
  ? https.createServer({
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
  }, app).listen(
    port,
    () => console.log(`🚀 https Server is starting on ${port}`),
  )
  : app.listen(port, () => {
    console.log(`🚀 Server is starting on ${port}`);
  });

// module.exports = https.createServer({ key: fs.readFileSync('./key.pem'), cert: fs.readFileSync('./cert.pem') }, app).listen(port, () => console.log(`🚀 https Server is starting on ${port}`));
