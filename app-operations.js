async function addToAccount(accountNum) {
    const input = document.getElementById(`account${accountNum}Input`);
    const noteInput = document.getElementById(`account${accountNum}Note`);
    const amount = parseFloat(input.value);
    const note = noteInput.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('请输入有效的金额', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                account: accountNum,
                type: 'add',
                amount: amount,
                note: note,
                balanceAfter: state.accounts[accountNum] + amount
            })
        });
        
        if (res.ok) {
            input.value = '';
            noteInput.value = '';
            showNotification(`成功添加 ${formatCurrency(amount)}`, 'success');
        } else {
            const data = await res.json();
            showNotification(data.message || '操作失败', 'error');
        }
    } catch (error) {
        showNotification('网络错误', 'error');
    }
}

async function setAccount(accountNum) {
    const input = document.getElementById(`account${accountNum}Input`);
    const noteInput = document.getElementById(`account${accountNum}Note`);
    const amount = parseFloat(input.value);
    const note = noteInput.value.trim();
    
    if (isNaN(amount) || amount < 0) {
        showNotification('请输入有效的金额', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                account: accountNum,
                type: 'set',
                amount: amount,
                note: note,
                oldBalance: state.accounts[accountNum],
                balanceAfter: amount
            })
        });
        
        if (res.ok) {
            input.value = '';
            noteInput.value = '';
            showNotification(`设置成功 ${formatCurrency(amount)}`, 'success');
        } else {
            const data = await res.json();
            showNotification(data.message || '操作失败', 'error');
        }
    } catch (error) {
        showNotification('网络错误', 'error');
    }
}

async function clearAccount(accountNum) {
    if (state.accounts[accountNum] === 0) {
        showNotification(`账户已经是空的`, 'info');
        return;
    }
    
    if (!confirm(`确定要清空账户吗？当前余额：${formatCurrency(state.accounts[accountNum])}`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                account: accountNum,
                type: 'clear',
                amount: state.accounts[accountNum],
                oldBalance: state.accounts[accountNum],
                balanceAfter: 0
            })
        });
        
        if (res.ok) {
            showNotification('账户已清空', 'success');
        } else {
            const data = await res.json();
            showNotification(data.message || '操作失败', 'error');
        }
    } catch (error) {
        showNotification('网络错误', 'error');
    }
}
