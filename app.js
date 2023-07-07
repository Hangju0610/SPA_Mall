const express = require('express');
const dotenv = require('dotenv');
const connect = require('./schemas');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');

const app = express();
dotenv.config();

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('assets'));
app.use('/api', indexRouter);

app.listen(process.env.PORT, () => {
  console.log('서버 동작');
});
