const express = require('express');
const cors = require('cors');
const router = require('./routes');
const db = require('./db');

const port = 3000;

const app = express();

db();

app.use(express.json({ extended: false }));
app.use(cors());

app.use('/', router);

module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
