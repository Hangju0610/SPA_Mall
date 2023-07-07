const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const Refresh = require('../schemas/refreshToken');
const dotenv = require('dotenv');

dotenv.config();

// refresh 토큰 유효성 검사
const validateRefreshToken = function (refreshToken) {
  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    // 인증된 경우 True 반환
    return true;
  } catch (error) {
    // 만료된 경우 에러 발생, false 반환
    return false;
  }
};

// access 토큰 유효성 검사
const validateAccessToken = function (accessToken) {
  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    return true;
    // 인증된 경우 True 반환
  } catch (error) {
    // 만료된 경우 에러 발생, false 반환
    return false;
  }
};

const jwtValidation = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    // 1. 토큰 확인
    if (!refreshToken)
      return res
        .status(400)
        .json({ message: 'Refresh Token이 존재하지 않습니다.' });
    if (!accessToken)
      return res
        .status(400)
        .json({ message: 'Access Token이 존재하지 않습니다.' });

    // 2. 토큰 검증
    const isAccessTokenValidate = validateAccessToken(accessToken);
    const isRefreshTokenValidate = validateRefreshToken(refreshToken);

    // 3. Refresh 토큰이 만료된 경우
    if (!isRefreshTokenValidate) {
      return res
        .status(419)
        .json({ errorMessage: 'Refresh Token이 만료되었습니다.' });
    }
    // 4. AccessToken이 만료된 경우
    if (!isAccessTokenValidate) {
      const findUser = await Refresh.findOne({ refreshToken });
      if (!findUser) {
        // 토큰 자체가 정상적이지만, 탈취를 당했거나 고의적으로 만료한 경우.
        return res.status(419).json({
          errorMessage: 'Refresh Token의 정보가 서버에 존재하지 않습니다.',
        });
      }
      // 새로운 AccessToken 생성
      const newAccessToken = jwt.sign(
        { userId: findUser.userId },
        process.env.ACCESS_TOKEN,
        { expiresIn: '10s' }
      );
      console.log('AccessToken 재발급 완료');
      // 새로운 AccessToken 전달 및 user 정보 전달
      res.cookie('accessToken', newAccessToken);
      const user = await User.findById(findUser.userId);
      res.locals.user = user;
      next();
    } else {
      // 5. 모든 경우가 정상적인 경우
      console.log('정상적인 경우');
      const findId = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
      const user = await User.findById(findId.userId);
      res.locals.user = user;
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
};

module.exports = jwtValidation;
