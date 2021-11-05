
import dotenv from 'dotenv';

import mongoose from 'mongoose';
dotenv.config();
const connectDB = () => {
  const pass = encodeURIComponent(process.env.MONGO_SEC_KEY);

  // const uri = "mongodb://localhost:27017/artoring";
  const uri = process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/artoring'
    : `mongodb+srv://${process.env.MONGO_ACC_KEY}:${pass}@cluster0.pij1x.mongodb.net/artoring?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;

  function dbconnect () {
    try {
      mongoose.connect(uri, {
        dbName: 'artoring',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
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

export default connectDB;
