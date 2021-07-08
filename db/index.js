require('dotenv').config();

const mongoose = require('mongoose');
module.exports = () => {
  if (process.env.NODE_ENV === 'production') {
    const pass = encodeURIComponent(process.env.MONGO_SEC_KEY);

    const uri = `mongodb+srv://${process.env.MONGO_ACC_KEY}:${pass}@cluster0.pij1x.mongodb.net/artoring?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;

    function connect () {
      mongoose.connect(uri, {
        dbName: 'artoring', useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, autoReconnect: true
      }).then(function (err) {
        if (err) {
          console.error('mongodb connection error', err);
        }
        console.log('mongodb connected');
      });
    }
    connect();
    mongoose.connection.on('disconnected', () => {
      console.log('disconnected');
    });
  } else if (process.env.NODE_ENV === 'development') {
    const uri = 'mongodb://localhost/artoring';

    function connect () {
      mongoose.connect(uri, {
        dbName: 'artoring', useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, autoReconnect: true
      }).then(function (err) {
        if (err) {
          console.error('mongodb connection error', err);
        }
        console.log('mongodb connected');
      });
    }
    connect();
    mongoose.connection.on('disconnected', () => {
      console.log('disconnected');
    });
  }
}
;
