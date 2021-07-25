const express = require('express');
const cors = require('cors');
const router = require('./routes');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const db = require('./db');

const port = 4000;

const app = express();

db();

app.use(express.json({ extended: false }));
app.use(cors({
  origin: '*',
  methods: '*'
}));

app.use('/', router);
app.disable('X-Powered-By');


app.get("/", (req, res) => {
  res.send("Hello World")
})


app.get('/', (req, res) => {
  res.send('ok?');
});
module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
