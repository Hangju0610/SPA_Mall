const express = require('express');
const goodsRouter = require('./goods');
const usersRouter = require('./users');
const authRouter = require('./auth');
const router = express.Router();

router.use('/users', usersRouter);
router.use('/goods', goodsRouter);
router.use('/auth', authRouter);

module.exports = router;
