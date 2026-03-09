// Supabase 配置 - 请在使用前替换为您的 Supabase 项目配置
// 获取配置方法：
// 1. 访问 https://supabase.com 创建项目
// 2. 进入 Dashboard -> Settings -> API
// 3. 复制 Project URL 和 anon public 密钥
const SUPABASE_URL = 'https://ehimwiaitlxezkrfvmea.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MY6ekN3aRjQSISI2R_eVaw_qLK5o1tW';

// 检查配置是否已设置
const isConfigured = SUPABASE_URL !== 'https://ehimwiaitlxezkrfvmea.supabase.co' && SUPABASE_ANON_KEY !== 'sb_publishable_MY6ekN3aRjQSISI2R_eVaw_qLK5o1tW';

// 初始化 Supabase 客户端
let supabase;
let currentUser = null;
let realtimeChannel = null;

const state = {
  accounts: { 1: 0, 2: 0 },
  transactions: [],
  currentFilter: 'all'
};

// 初始化应用
async function init() {
  // 检查配置
  if (!isConfigured) {
    showConfigWarning();
    hideLoading();
    return;
  }
  
  try {
    // 初始化 Supabase
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 检查登录状态
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      currentUser = session.user;
      setupAuthUI(true);
      await loadUserData();
      setupRealtimeSubscription();
    } else {
      setupAuthUI(false);
    }
  } catch (error) {
    console.error('初始化失败:', error);
    showNotification('初始化失败，请检查配置', 'error');
  }
  
  hideLoading();
}

// 显示配置警告
function showConfigWarning() {
  const authContainer = document.getElementById('authContainer');
  if (authContainer) {
    authContainer.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2 style="color: #f56565; margin-bottom: 20px;">⚠️ 需要配置 Supabase</h2>
        <p style="color: #4a5568; margin-bottom: 30px; line-height: 1.6;">
          您需要先配置 Supabase 才能使用此应用。<br>
          请按照以下步骤操作：
        </p>
        <div style="text-align: left; background: #f7fafc; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h3 style="color: #2d3748; margin-bottom: 15px;">📝 配置步骤：</h3>
          <ol style="color: #4a5568; line-height: 2;">
            <li>访问 <a href="https://supabase.com" target="_blank" style="color: #667eea;">supabase.com</a> 创建免费账户</li>
            <li>创建新项目（选择新加坡区域）</li>
            <li>在 SQL Editor 中运行 <code>supabase-setup.sql</code> 脚本</li>
            <li>在 Settings → API 中复制 Project URL 和 anon key</li>
            <li>打开 <code>cloud-app.js</code> 文件，替换第 8-9 行的配置</li>
          </ol>
        </div>
        <a href="QUICK_START.md" target="_blank" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600;">
          📖 查看详细配置指南
        </a>
      </div>
    `;
  }
}

// 设置实时订阅
function setupRealtimeSubscription() {
  if (!currentUser) return;
  
  realtimeChannel = supabase
    .channel('transactions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${currentUser.id}`
      },
      handleRealtimeUpdate
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${currentUser.id}`
      },
      handleAccountUpdate
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        updateSyncStatus('connected');
        console.log('✅ 实时同步已连接');
      } else if (status === 'CHANNEL_ERROR') {
        updateSyncStatus('error');
        console.error('❌ 实时同步连接错误');
      }
    });
}

// 处理实时更新
async function handleRealtimeUpdate(payload) {
  console.log('收到实时更新:', payload);
  
  const { eventType, new: newData, old: oldData } = payload;
  
  if (eventType === 'INSERT') {
    state.transactions.unshift(newData);
    await loadAccounts();
    renderHistory();
    showNotification('数据已同步', 'success');
  } else if (eventType === 'UPDATE') {
    const index = state.transactions.findIndex(t => t.id === newData.id);
    if (index !== -1) {
      state.transactions[index] = newData;
      renderHistory();
      showNotification('记录已更新', 'success');
    }
  } else if (eventType === 'DELETE') {
    state.transactions = state.transactions.filter(t => t.id !== oldData.id);
    renderHistory();
    showNotification('记录已删除', 'success');
  }
}

// 处理账户更新
async function handleAccountUpdate(payload) {
  console.log('账户更新:', payload);
  await loadAccounts();
  updateDisplay();
}

// 显示登录界面
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  document.querySelectorAll('.auth-tab')[0].classList.add('active');
  document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

// 显示注册界面
function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  document.querySelectorAll('.auth-tab')[0].classList.remove('active');
  document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

// 处理登录
async function handleLogin(e) {
  e.preventDefault();
  showLoading();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    currentUser = data.user;
    setupAuthUI(true);
    await loadUserData();
    setupRealtimeSubscription();
    showNotification('登录成功', 'success');
  } catch (error) {
    console.error('登录错误:', error);
    showNotification(error.message || '登录失败', 'error');
  } finally {
    hideLoading();
  }
}

// 处理注册
async function handleRegister(e) {
  e.preventDefault();
  showLoading();
  
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    // 注册 Supabase 用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    
    if (authError) throw authError;
    
    // 创建用户账户记录
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: username,
          email: email,
          accounts: { 1: 0, 2: 0 }
        });
      
      if (dbError) throw dbError;
    }
    
    currentUser = authData.user;
    setupAuthUI(true);
    showNotification('注册成功！', 'success');
  } catch (error) {
    console.error('注册错误:', error);
    showNotification(error.message || '注册失败', 'error');
  } finally {
    hideLoading();
  }
}

// 退出登录
async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
  state.accounts = { 1: 0, 2: 0 };
  state.transactions = [];
  
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel);
  }
  
  setupAuthUI(false);
  updateSyncStatus('disconnected');
  showNotification('已退出登录', 'info');
}

// 设置认证 UI
function setupAuthUI(isLoggedIn) {
  const authContainer = document.getElementById('authContainer');
  const appContent = document.getElementById('appContent');
  
  if (isLoggedIn) {
    authContainer.style.display = 'none';
    appContent.style.display = 'block';
    document.getElementById('currentUser').textContent = currentUser.user_metadata?.username || '用户';
  } else {
    authContainer.style.display = 'block';
    appContent.style.display = 'none';
  }
}

// 加载用户数据
async function loadUserData() {
  await Promise.all([
    loadAccounts(),
    loadTransactions()
  ]);
  updateDisplay();
  renderHistory();
}

// 加载账户信息
async function loadAccounts() {
  if (!currentUser) return;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('accounts')
      .eq('id', currentUser.id)
      .single();
    
    if (error) throw error;
    
    if (data && data.accounts) {
      state.accounts = data.accounts;
    }
  } catch (error) {
    console.error('加载账户失败:', error);
  }
}

// 加载交易记录
async function loadTransactions() {
  if (!currentUser) return;
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    state.transactions = data || [];
  } catch (error) {
    console.error('加载交易记录失败:', error);
  }
}

// 更新显示
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

// 添加到账户
async function addToAccount(accountNum) {
  const input = document.getElementById(`account${accountNum}Input`);
  const noteInput = document.getElementById(`account${accountNum}Note`);
  const amount = parseFloat(input.value);
  const note = noteInput.value.trim();
  
  if (isNaN(amount) || amount <= 0) {
    showNotification('请输入有效的金额', 'error');
    return;
  }
  
  showLoading();
  
  try {
    const newBalance = state.accounts[accountNum] + amount;
    
    // 创建交易记录
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        account: accountNum,
        type: 'add',
        amount: amount,
        note: note,
        balance_after: newBalance
      });
    
    if (error) throw error;
    
    // 更新账户余额
    await updateAccountBalance(accountNum, newBalance);
    
    input.value = '';
    noteInput.value = '';
    showNotification(`成功添加 ${formatCurrency(amount)}`, 'success');
  } catch (error) {
    console.error('添加失败:', error);
    showNotification(error.message || '操作失败', 'error');
  } finally {
    hideLoading();
  }
}

// 设置账户
async function setAccount(accountNum) {
  const input = document.getElementById(`account${accountNum}Input`);
  const noteInput = document.getElementById(`account${accountNum}Note`);
  const amount = parseFloat(input.value);
  const note = noteInput.value.trim();
  
  if (isNaN(amount) || amount < 0) {
    showNotification('请输入有效的金额', 'error');
    return;
  }
  
  showLoading();
  
  try {
    const oldBalance = state.accounts[accountNum];
    
    // 创建交易记录
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        account: accountNum,
        type: 'set',
        amount: amount,
        note: note,
        old_balance: oldBalance,
        balance_after: amount
      });
    
    if (error) throw error;
    
    // 更新账户余额
    await updateAccountBalance(accountNum, amount);
    
    input.value = '';
    noteInput.value = '';
    showNotification(`设置成功 ${formatCurrency(amount)}`, 'success');
  } catch (error) {
    console.error('设置失败:', error);
    showNotification(error.message || '操作失败', 'error');
  } finally {
    hideLoading();
  }
}

// 清空账户
async function clearAccount(accountNum) {
  if (state.accounts[accountNum] === 0) {
    showNotification(`账户已经是空的`, 'info');
    return;
  }
  
  if (!confirm(`确定要清空账户吗？当前余额：${formatCurrency(state.accounts[accountNum])}`)) {
    return;
  }
  
  showLoading();
  
  try {
    const oldBalance = state.accounts[accountNum];
    
    // 创建交易记录
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        account: accountNum,
        type: 'clear',
        amount: oldBalance,
        old_balance: oldBalance,
        balance_after: 0
      });
    
    if (error) throw error;
    
    // 更新账户余额
    await updateAccountBalance(accountNum, 0);
    
    showNotification('账户已清空', 'success');
  } catch (error) {
    console.error('清空失败:', error);
    showNotification(error.message || '操作失败', 'error');
  } finally {
    hideLoading();
  }
}

// 更新账户余额
async function updateAccountBalance(accountNum, balance) {
  const newAccounts = { ...state.accounts, [accountNum]: balance };
  
  const { error } = await supabase
    .from('users')
    .update({ accounts: newAccounts })
    .eq('id', currentUser.id);
  
  if (error) throw error;
  
  state.accounts = newAccounts;
  updateDisplay();
}

// 编辑交易记录
async function editTransaction(id) {
  const transaction = state.transactions.find(t => t.id === id);
  if (!transaction) return;
  
  const newNote = prompt('修改备注信息:', transaction.note || '');
  if (newNote === null) return;
  
  showLoading();
  
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ note: newNote })
      .eq('id', id);
    
    if (error) throw error;
    
    showNotification('更新成功', 'success');
  } catch (error) {
    console.error('更新失败:', error);
    showNotification(error.message || '更新失败', 'error');
  } finally {
    hideLoading();
  }
}

// 删除交易记录
async function deleteTransaction(id) {
  if (!confirm('确定要删除这条交易记录吗？')) return;
  
  showLoading();
  
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    showNotification('删除成功', 'success');
  } catch (error) {
    console.error('删除失败:', error);
    showNotification(error.message || '删除失败', 'error');
  } finally {
    hideLoading();
  }
}

// 渲染历史记录
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
    const date = new Date(item.created_at);
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
          <button class="btn-edit" onclick="editTransaction('${item.id}')">✏️</button>
          <button class="btn-delete" onclick="deleteTransaction('${item.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// 筛选历史
function filterHistory(filter) {
  state.currentFilter = filter;
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderHistory();
}

// 清空历史
async function clearHistory() {
  if (state.transactions.length === 0) {
    showNotification('已经没有记录了', 'info');
    return;
  }
  
  if (!confirm('确定要清空所有交易记录吗？此操作不可恢复。')) {
    return;
  }
  
  showLoading();
  
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', currentUser.id);
    
    if (error) throw error;
    
    state.transactions = [];
    renderHistory();
    showNotification('交易记录已清空', 'success');
  } catch (error) {
    console.error('清空失败:', error);
    showNotification(error.message || '操作失败', 'error');
  } finally {
    hideLoading();
  }
}

// 工具函数
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

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function updateSyncStatus(status) {
  const statusEl = document.getElementById('syncStatus');
  if (!statusEl) return;
  
  if (status === 'connected') {
    statusEl.textContent = '🟢 已连接';
    statusEl.style.color = '#48bb78';
  } else if (status === 'error') {
    statusEl.textContent = '🔴 连接失败';
    statusEl.style.color = '#f56565';
  } else {
    statusEl.textContent = '⚪ 未连接';
    statusEl.style.color = '#a0aec0';
  }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
