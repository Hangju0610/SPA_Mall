const express = require('express');
const User = require('../schemas/user');
const signupSchema = require('../validations/validation');
const authMiddleware = require('../middlewares/auth-middleware');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, nickname, password, confirmPassword } = req.body;

    const { error } = signupSchema.validate({
      email,
      nickname,
      password,
      confirmPassword,
    });

    if (error) {
      console.log(error);
      return res.status(400).json('에러 발생');
    }

    const existsUser = await User.findOne({
      $or: [{ email }, { nickname }],
    }).exec();
    if (existsUser) {
      return res
        .status(400)
        .json({ errorMessage: '이메일 또는 닉네임이 이미 사용중입니다.' });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      email,
      nickname,
      password: hashedPassword,
    });

    res.status(201).json({ message: '아이디 생성 완료' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { email, nickname } = res.locals.user;

    res.status(200).json({ user: { email, nickname } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

module.exports = router;
