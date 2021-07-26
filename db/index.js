const dotenv = require('dotenv');
const fs = require('fs');

let path = '.env';

try {
  if (fs.existsSync(path)) {
    // file exists
    console.log('found');
    path = '.env';
  }
} catch (err) {
  console.log('not found');
  path = '/etc/profile.d/sh.local';
}

dotenv.config(path);
console.lgg(process.env);
const mongoose = require('mongoose');
module.exports = () => {
  const pass = encodeURIComponent(process.env.MONGO_SEC_KEY);

  const uri = process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/artoring'
    : `mongodb+srv://${process.env.MONGO_ACC_KEY}:${pass}@cluster0.pij1x.mongodb.net/artoring?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;

  function dbconnect () {
    mongoose.connect(uri, {
      dbName: 'artoring', useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
    }).catch(e => console.log(e));
    // If the connection throws an error
    mongoose.connection.on('connected', () => {
      console.log('connected');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('disconnected');
    });
  }
  dbconnect();
};
