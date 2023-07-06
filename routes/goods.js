const Goods = require('../schemas/goods');
const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { goodsId, name, thumbnailUrl, category, price } = req.body;

    const goods = await Goods.findOne({ goodsId });
    if (goods) {
      return res
        .status(400)
        .json({ success: false, errorMessage: '이미 있는 데이터입니다.' });
    }
    const createdGoods = await Goods.create({
      goodsId,
      name,
      thumbnailUrl,
      category,
      price,
    });
    res.status(200).json({ goods: createdGoods });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 문제 발견' });
  }
});

module.exports = router;
