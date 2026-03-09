require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const accountRoutes = require('./routes/accounts');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/money-tracker';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 用户连接:', socket.id);

  socket.on('authenticate', (data) => {
    const { userId } = data;
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`用户 ${userId} 已认证`);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
    console.log('用户断开连接:', socket.id);
  });
});

function notifyUser(userId, event, data) {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
}

app.notifyUser = notifyUser;
app.io = io;

server.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📡 环境：${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
