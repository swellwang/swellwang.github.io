const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      1: user.accounts[1],
      2: user.accounts[2]
    });
  } catch (error) {
    console.error('获取账户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
