const express = require('express');
const Goods = require('../schemas/goods');
const Cart = require('../schemas/cart');
const authMiddleware = require('../middlewares/auth-middleware');

const router = express.Router();

router.get('/cart', authMiddleware, async (_, res) => {
  try {
    const { userId } = res.locals.user;
    const carts = await Cart.find({ userId }).exec();
    const goodsIds = carts.map((cart) => cart.goodsId);

    const goods = await Goods.find({ goodsId: goodsIds }).exec();

    const results = carts.map((cart) => {
      return {
        quantity: cart.quantity,
        goods: goods.find((item) => item.goodsId === cart.goodsId),
      };
    });

    res.status(200).json({ carts: results });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.get('/goods', async (req, res) => {
  try {
    const { category } = req.query;
    // 3항 연산자
    const goods = await Goods.find(category ? { category } : {})
      .sort('-data')
      .exec();

    const results = goods.map((item) => {
      return {
        goodsId: item.goodsId,
        name: item.name,
        price: item.price,
        thumbnailUrl: item.thumbnailUrl,
        category: item.category,
      };
    });
    res.status(200).json({ goods: results });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.get('/goods/:goodsId', async (req, res) => {
  try {
    const { goodsId } = req.params;
    const goods = await Goods.findOne({ goodsId }).exec();

    if (!goods)
      return res.status(404).json({ errorMessage: '없는 목록입니다.' });
    const result = {
      goodsId: goods.goodsId,
      name: goods.name,
      price: goods.price,
      thumbnailUrl: goods.thumbnailUrl,
      category: goods.category,
    };

    res.status(200).json({ goods: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.post('/goods', async (req, res) => {
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

router.post('/goods/:goodsId/cart', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { goodsId } = req.params;
    const { quantity } = req.body;

    const existsCarts = await Cart.find({ userId, goodsId }).exec();
    if (existsCarts.length) {
      return res.status(400).json({
        success: false,
        errorMessage: '이미 장바구니에 존재하는 상품입니다.',
      });
    }
    const cart = await Cart.create({
      userId,
      goodsId,
      quantity,
    });
    res.status(200).json({ cart });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.put('/goods/:goodsId/cart', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { goodsId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res
        .status(400)
        .json({ errorMessage: '상품 수량이 0은 없습니다.' });
    }

    const existsCarts = await Cart.find({ userId, goodsId }).exec();
    if (existsCarts.length) {
      await Cart.updateOne(
        { userId, goodsId: goodsId },
        { $set: { quantity } }
      ).exec();
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

router.delete('/goods/:goodsId/cart', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { goodsId } = req.params;

    const existsCarts = await Cart.find({ goodsId });
    if (existsCarts.length > 0) {
      await Cart.deleteOne({ userId, goodsId }).exec();
    }
    res.status(200).json({ message: '삭제 완료' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

module.exports = router;
