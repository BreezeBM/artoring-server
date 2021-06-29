const express = require('express');
const cors = require('cors');
const port = 80;

const app = express();

app.use(express.json({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
  res.send();
});
module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
