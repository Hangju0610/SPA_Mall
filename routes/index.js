const express = require('express');
const goodsRouter = require('./goods');
const router = express.Router();

router.use('/goods', goodsRouter);

module.exports = router;
