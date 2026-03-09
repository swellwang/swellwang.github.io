let accounts = {
    1: 0,
    2: 0
};

let transactionHistory = [];

function init() {
    loadFromStorage();
    updateDisplay();
    renderHistory();
}

function loadFromStorage() {
    const savedAccounts = localStorage.getItem('accounts');
    const savedHistory = localStorage.getItem('transactionHistory');
    
    if (savedAccounts) {
        accounts = JSON.parse(savedAccounts);
    }
    
    if (savedHistory) {
        transactionHistory = JSON.parse(savedHistory);
    }
}

function saveToStorage() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
}

function formatCurrency(amount) {
    return '¥' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function updateDisplay() {
    const account1Balance = document.getElementById('account1Balance');
    const account2Balance = document.getElementById('account2Balance');
    const totalAmount = document.getElementById('totalAmount');
    const lastUpdated = document.getElementById('lastUpdated');
    
    account1Balance.textContent = formatCurrency(accounts[1]);
    account2Balance.textContent = formatCurrency(accounts[2]);
    
    const total = accounts[1] + accounts[2];
    totalAmount.textContent = formatCurrency(total);
    
    const now = new Date();
    lastUpdated.textContent = '最后更新：' + formatDateTime(now);
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

function addToAccount(accountNum) {
    const input = document.getElementById(`account${accountNum}Input`);
    const noteInput = document.getElementById(`account${accountNum}Note`);
    const amount = parseFloat(input.value);
    const note = noteInput.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('请输入有效的金额', 'error');
        return;
    }
    
    accounts[accountNum] += amount;
    
    transactionHistory.unshift({
        id: Date.now(),
        account: accountNum,
        type: 'add',
        amount: amount,
        note: note,
        balanceAfter: accounts[accountNum],
        timestamp: new Date().toISOString()
    });
    
    input.value = '';
    noteInput.value = '';
    saveToStorage();
    updateDisplay();
    renderHistory();
    const accountName = accountNum === 1 ? 'WSW' : 'XD';
    showNotification(`成功添加 ${formatCurrency(amount)} 到${accountName}`, 'success');
}

function setAccount(accountNum) {
    const input = document.getElementById(`account${accountNum}Input`);
    const noteInput = document.getElementById(`account${accountNum}Note`);
    const amount = parseFloat(input.value);
    const note = noteInput.value.trim();
    
    if (isNaN(amount) || amount < 0) {
        showNotification('请输入有效的金额', 'error');
        return;
    }
    
    const oldBalance = accounts[accountNum];
    accounts[accountNum] = amount;
    
    transactionHistory.unshift({
        id: Date.now(),
        account: accountNum,
        type: 'set',
        amount: amount,
        note: note,
        oldBalance: oldBalance,
        balanceAfter: accounts[accountNum],
        timestamp: new Date().toISOString()
    });
    
    input.value = '';
    noteInput.value = '';
    saveToStorage();
    updateDisplay();
    renderHistory();
    const accountName = accountNum === 1 ? 'WSW' : 'XD';
    showNotification(`${accountName} 已设置为 ${formatCurrency(amount)}`, 'success');
}

function clearAccount(accountNum) {
    const accountName = accountNum === 1 ? 'WSW' : 'XD';
    if (accounts[accountNum] === 0) {
        showNotification(`${accountName} 已经是空的`, 'info');
        return;
    }
    
    if (!confirm(`确定要清空${accountName}吗？当前余额：${formatCurrency(accounts[accountNum])}`)) {
        return;
    }
    
    transactionHistory.unshift({
        id: Date.now(),
        account: accountNum,
        type: 'clear',
        amount: accounts[accountNum],
        oldBalance: accounts[accountNum],
        balanceAfter: 0,
        timestamp: new Date().toISOString()
    });
    
    accounts[accountNum] = 0;
    saveToStorage();
    updateDisplay();
    renderHistory();
    showNotification(`${accountName} 已清空`, 'success');
}

function renderHistory(filter = 'all') {
    const historyList = document.getElementById('historyList');
    
    let filteredHistory = transactionHistory;
    if (filter !== 'all') {
        filteredHistory = transactionHistory.filter(item => item.account === parseInt(filter));
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
            </div>
        `;
    }).join('');
}

function filterHistory(filter) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = event.target;
    activeBtn.classList.add('active');
    
    renderHistory(filter);
}

function clearHistory() {
    if (transactionHistory.length === 0) {
        showNotification('已经没有记录了', 'info');
        return;
    }
    
    if (!confirm('确定要清空所有交易记录吗？此操作不可恢复。')) {
        return;
    }
    
    transactionHistory = [];
    saveToStorage();
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

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);

document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const accountNum = this.id.replace('account', '').replace('Input', '');
            addToAccount(parseInt(accountNum));
        }
    });
});
