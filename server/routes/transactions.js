const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { io } = require('../server');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json(transactions);
  } catch (error) {
    console.error('获取交易记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', [
  auth,
  body('account').isIn([1, 2]).withMessage('账户必须是 1 或 2'),
  body('type').isIn(['add', 'set', 'clear']).withMessage('无效的操作类型'),
  body('amount').isNumeric().withMessage('金额必须是数字'),
  body('balanceAfter').isNumeric().withMessage('余额必须是数字')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { account, type, amount, note, oldBalance, balanceAfter } = req.body;

    const transaction = new Transaction({
      user: req.user.userId,
      account,
      type,
      amount,
      note: note || '',
      oldBalance,
      balanceAfter
    });

    await transaction.save();

    await User.findByIdAndUpdate(req.user.userId, {
      [`accounts.${account}`]: balanceAfter
    });

    io.to(req.user.userId).emit('transaction:new', transaction);
    io.to(req.user.userId).emit('accounts:update', {
      [account]: balanceAfter
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('创建交易记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', [
  auth,
  body('note').optional().trim(),
  body('amount').optional().isNumeric()
], async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: '交易记录不存在' });
    }

    if (req.body.note !== undefined) transaction.note = req.body.note;
    if (req.body.amount !== undefined) transaction.amount = req.body.amount;

    await transaction.save();

    io.to(req.user.userId).emit('transaction:update', transaction);

    res.json(transaction);
  } catch (error) {
    console.error('更新交易记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: '交易记录不存在' });
    }

    io.to(req.user.userId).emit('transaction:delete', { id: req.params.id });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除交易记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
