const express = require('express');
const Goods = require('../schemas/goods');
const Cart = require('../schemas/cart');

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

router.get('/carts', async (_, res) => {
  try {
    const carts = await Cart.find().exec();
    const goodsIds = carts.map((cart) => cart.goodsId);

    const goods = await Goods.find({ goodsId: goodsIds }).exec();

    const results = carts.map((cart) => {
      return {
        quantity: cart.quantity,
        goods: goods.find((item) => item.goodsId === cart.goodsId),
      };
    });

    res.status(200).json({ results });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.post('/:goodsId/cart', async (req, res) => {
  try {
    const { goodsId } = req.params;
    const { quantity } = req.body;

    const existsCarts = await Cart.find({ goodsId: Number(goodsId) }).exec();
    if (existsCarts.length) {
      return res.status(400).json({
        success: false,
        errorMessage: '이미 장바구니에 존재하는 상품입니다.',
      });
    }
    const cart = await Cart.create({
      goodsId: Number(goodsId),
      quantity,
    }).exec();
    res.status(200).json({ cart });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.put('/:goodsId/cart', async (req, res) => {
  try {
    const { goodsId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res
        .status(400)
        .json({ errorMessage: '상품 수량이 0은 없습니다.' });
    }

    const existsCarts = await Cart.find({ goodsId: Number(goodsId) }).exec();
    if (existsCarts.length) {
      const updateCart = await Cart.updateOne(
        { goodsId: Number(goodsId) },
        { $set: { quantity } }
      ).exec();
    }
    res.status(201).json(updateCart);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.delete('/:goodsId/cart', async (req, res) => {
  try {
    const { goodsId } = req.params;

    const existsCarts = await Cart.find({ goodsId });
    if (existsCarts.length > 0) {
      await Cart.deleteOne({ goodsId }).exec();
    }
    res.status(200).json({ message: '삭제 완료' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

module.exports = router;
