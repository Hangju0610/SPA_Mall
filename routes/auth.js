const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('../schemas/user');
const Refresh = require('../schemas/refreshToken');

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email }).exec();

    const validPassword = await bcrypt.compare(password, findUser.password);
    if (!findUser || !validPassword) {
      return res
        .status(400)
        .json({ errorMessage: '이메일이나 비밀번호가 올바르지 않습니다.' });
    }
    // access Token 생성
    const accessToken = jwt.sign(
      { userId: findUser.userId },
      process.env.ACCESS_TOKEN,
      { expiresIn: '10s' }
    );

    // refresh Token 생성
    const refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN, {
      expiresIn: '7d',
    });

    const findRefreshToken = await Refresh.find({ userId: findUser.userId });
    // console.log(findRefreshToken);

    // DB에 userId가 있는 경우
    if (findRefreshToken) {
      await Refresh.updateOne(
        { userId: findUser.userId },
        { $set: { refreshToken } }
      );
    } else {
      // DB에 userId가 없는 경우
      await Refresh.create({ refreshToken, userId: findUser.userId });
    }

    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

module.exports = router;
