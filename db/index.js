require('dotenv').config();

const mongoose = require('mongoose');
module.exports = () => {
  const pass = encodeURIComponent(process.env.MONGO_SEC_KEY);

  const uri = process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/artoring'
    : `mongodb+srv://${process.env.MONGO_ACC_KEY}:${pass}@cluster0.pij1x.mongodb.net/artoring?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;

  function dbconnect () {
    mongoose.connect(uri, {
      dbName: 'artoring', useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false,
    }).then(function (err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
      console.log('mongodb connected');
    });
  }
  dbconnect();
  mongoose.connection.on('disconnected', () => {
    console.log('disconnected');
  });
};
