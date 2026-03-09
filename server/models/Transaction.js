const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  type: {
    type: String,
    required: true,
    enum: ['add', 'set', 'clear']
  },
  amount: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  oldBalance: {
    type: Number
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
