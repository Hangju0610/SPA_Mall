const mongoose = require('mongoose');

const connect = () => {
  mongoose
    .connect(process.env.DB_URL, {
      dbName: 'Spa_mall', // DB 이름 설정하기
    })
    .then(() => console.log('mongoDB 연결 완료'))
    .catch((err) => console.log(err));
};

mongoose.connection.on('error', (err) => {
  console.log('mongoDB 연결 에러', err);
});

module.exports = connect;
