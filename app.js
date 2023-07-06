const express = require('express');
const dotenv = require('dotenv');
const connect = require('./schemas');
const indexRouter = require('./routes/index');

const app = express();
dotenv.config();

app.use(express.json());
connect();

app.use('/api', indexRouter);

app.listen(process.env.PORT, () => {
  console.log('서버 동작');
});
