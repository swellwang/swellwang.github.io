const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : `${window.location.origin}/api`;

let currentUser = null;
let socket = null;

const state = {
  accounts: { 1: 0, 2: 0 },
  transactions: [],
  currentFilter: 'all'
};

function init() {
  checkAuth();
  initSocket();
  loadUI();
}

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    currentUser = JSON.parse(user);
    setupAuthUI(true);
  } else {
    setupAuthUI(false);
  }
}

function initSocket() {
  socket = io(window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin);
  
  socket.on('connect', () => {
    console.log('Socket 已连接');
    if (currentUser) {
      socket.emit('authenticate', { userId: currentUser.id });
    }
  });
  
  socket.on('transaction:new', (transaction) => {
    console.log('收到新交易通知', transaction);
    state.transactions.unshift(transaction);
    updateAccountBalance(transaction.account, transaction.balanceAfter);
    renderHistory();
    showNotification('数据已同步更新', 'success');
  });
  
  socket.on('transaction:update', (transaction) => {
    console.log('收到交易更新通知', transaction);
    const index = state.transactions.findIndex(t => t._id === transaction._id);
    if (index !== -1) {
      state.transactions[index] = transaction;
      renderHistory();
      showNotification('交易记录已更新', 'success');
    }
  });
  
  socket.on('transaction:delete', (data) => {
    console.log('收到交易删除通知', data);
    state.transactions = state.transactions.filter(t => t._id !== data.id);
    renderHistory();
    showNotification('交易记录已删除', 'success');
  });
  
  socket.on('accounts:update', (updates) => {
    console.log('收到账户更新通知', updates);
    Object.keys(updates).forEach(key => {
      state.accounts[key] = updates[key];
    });
    updateDisplay();
  });
  
  socket.on('disconnect', () => {
    console.log('Socket 断开连接');
  });
}

function loadUI() {
  if (currentUser) {
    loadUserData();
  }
}

async function loadUserData() {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const [accountsRes, transactionsRes] = await Promise.all([
      fetch(`${API_URL}/accounts`, { headers }),
      fetch(`${API_URL}/transactions`, { headers })
    ]);
    
    if (accountsRes.ok) {
      state.accounts = await accountsRes.json();
      updateDisplay();
    }
    
    if (transactionsRes.ok) {
      state.transactions = await transactionsRes.json();
      renderHistory();
    }
  } catch (error) {
    console.error('加载用户数据失败:', error);
    showNotification('加载数据失败', 'error');
  }
}

function setupAuthUI(isLoggedIn) {
  const authContainer = document.getElementById('authContainer');
  const appContent = document.getElementById('appContent');
  
  if (isLoggedIn) {
    authContainer.style.display = 'none';
    appContent.style.display = 'block';
    document.getElementById('currentUser').textContent = currentUser.username;
  } else {
    authContainer.style.display = 'block';
    appContent.style.display = 'none';
  }
}

function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      currentUser = data.user;
      setupAuthUI(true);
      document.getElementById('currentUser').textContent = data.user.username;
      loadUserData();
      socket.emit('authenticate', { userId: data.user.id });
      showNotification('登录成功', 'success');
    } else {
      showNotification(data.message || '登录失败', 'error');
    }
  } catch (error) {
    showNotification('网络错误', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      currentUser = data.user;
      setupAuthUI(true);
      document.getElementById('currentUser').textContent = data.user.username;
      loadUserData();
      socket.emit('authenticate', { userId: data.user.id });
      showNotification('注册成功', 'success');
    } else {
      showNotification(data.message || '注册失败', 'error');
    }
  } catch (error) {
    showNotification('网络错误', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  state.accounts = { 1: 0, 2: 0 };
  state.transactions = [];
  setupAuthUI(false);
  showNotification('已退出登录', 'info');
}

function updateDisplay() {
  const account1Balance = document.getElementById('account1Balance');
  const account2Balance = document.getElementById('account2Balance');
  const totalAmount = document.getElementById('totalAmount');
  const lastUpdated = document.getElementById('lastUpdated');
  
  account1Balance.textContent = formatCurrency(state.accounts[1]);
  account2Balance.textContent = formatCurrency(state.accounts[2]);
  
  const total = state.accounts[1] + state.accounts[2];
  totalAmount.textContent = formatCurrency(total);
  
  const now = new Date();
  lastUpdated.textContent = '最后更新：' + formatDateTime(now);
}

function updateAccountBalance(accountNum, balance) {
  state.accounts[accountNum] = balance;
  updateDisplay();
}

function formatCurrency(amount) {
  return '¥' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  
  let filteredHistory = state.transactions;
  if (state.currentFilter !== 'all') {
    filteredHistory = state.transactions.filter(item => item.account === parseInt(state.currentFilter));
  }
  
  if (filteredHistory.length === 0) {
    historyList.innerHTML = '<div class="empty-history">暂无交易记录</div>';
    return;
  }
  
  historyList.innerHTML = filteredHistory.map(item => {
    const date = new Date(item.timestamp);
    const timeStr = formatDateTime(date);
    
    let typeText = '';
    let amountClass = 'add';
    
    if (item.type === 'add') {
      typeText = `➕ 添加金额`;
      amountClass = 'add';
    } else if (item.type === 'set') {
      typeText = `⚙️ 设置金额`;
      amountClass = 'set';
    } else if (item.type === 'clear') {
      typeText = `🗑️ 清空账户`;
      amountClass = 'set';
    }
    
    const accountName = item.account === 1 ? 'WSW' : 'XD';
    
    return `
      <div class="history-item account-${item.account}">
        <div class="history-info">
          <div class="history-type">${typeText} - ${accountName}</div>
          <div class="history-time">${timeStr}</div>
          ${item.note ? `<div class="history-note">📝 ${item.note}</div>` : ''}
        </div>
        <div class="history-amount ${amountClass}">
          ${item.type === 'add' ? '+' : ''}${formatCurrency(item.amount)}
        </div>
        <div class="history-actions">
          <button class="btn-edit" onclick="editTransaction('${item._id}')">✏️</button>
          <button class="btn-delete" onclick="deleteTransaction('${item._id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

async function editTransaction(id) {
  const transaction = state.transactions.find(t => t._id === id);
  if (!transaction) return;
  
  const newNote = prompt('修改备注信息:', transaction.note || '');
  if (newNote === null) return;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ note: newNote })
    });
    
    if (res.ok) {
      showNotification('更新成功', 'success');
    } else {
      showNotification('更新失败', 'error');
    }
  } catch (error) {
    showNotification('网络错误', 'error');
  }
}

async function deleteTransaction(id) {
  if (!confirm('确定要删除这条交易记录吗？')) return;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (res.ok) {
      showNotification('删除成功', 'success');
    } else {
      showNotification('删除失败', 'error');
    }
  } catch (error) {
    showNotification('网络错误', 'error');
  }
}

function filterHistory(filter) {
  state.currentFilter = filter;
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderHistory();
}

function clearHistory() {
  if (state.transactions.length === 0) {
    showNotification('已经没有记录了', 'info');
    return;
  }
  
  if (!confirm('确定要清空所有交易记录吗？此操作不可恢复。')) {
    return;
  }
  
  state.transactions = [];
  renderHistory();
  showNotification('交易记录已清空', 'success');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

document.addEventListener('DOMContentLoaded', init);
