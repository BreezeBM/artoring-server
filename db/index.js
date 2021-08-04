const dotenv = require('dotenv');
const fs = require('fs');

let path = '.env';

// .env 파일을 찾거나 없으면 env 파일을 찾아서 환경변수를 등록함
// 근데 빈즈토크에선 필요가 없다.
try {
  if (fs.existsSync(path)) {
    // file exists

    path = '.env';
  } else path = 'env';
} catch (err) {
  path = 'env';
}

dotenv.config({ path });

const mongoose = require('mongoose');
module.exports = () => {
  const pass = encodeURIComponent(process.env.MONGO_SEC_KEY);

  const uri = process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/artoring'
    : `mongodb+srv://${process.env.MONGO_ACC_KEY}:${pass}@cluster0.pij1x.mongodb.net/artoring?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;

  function dbconnect () {
    try {
      mongoose.connect(uri, {
        dbName: 'artoring', useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
      });
      console.log('mongodb connected');
    } catch (err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
    }
  }
  dbconnect();
};
