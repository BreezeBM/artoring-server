const express = require('express');
const cors = require('cors');
const port = 8080;

const app = express();

app.use(express.json({ extended: false }));
app.use(cors());


app.get("/", (req, res) => {
  res.send("Hello World")
})


module.exports = app.listen(port, () => {
  console.log(`🚀 Server is starting on ${port}`);
});
