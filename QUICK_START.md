# ⚡ 5 分钟快速配置指南

## 前提条件
- 拥有一个 GitHub 账号
- 拥有一个邮箱

## 步骤概览（总共 5 分钟）

1. ✅ 创建 Supabase 项目（2 分钟）
2. ✅ 配置数据库（1 分钟）
3. ✅ 修改前端配置（30 秒）
4. ✅ 部署到 GitHub（1 分半钟）
5. ✅ 测试使用（30 秒）

---

## 详细步骤

### 1️⃣ 创建 Supabase 项目（2 分钟）

1. 打开 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（最快）
4. 点击 "New project"
5. 填写：
   - **Name**: `money-tracker`
   - **Database password**: 记住这个密码（例如：`MyMoney2024!`）
   - **Region**: 选择 `Singapore (Singapore)` - 离中国最近
6. 点击 "Create new project"
7. 等待 1-2 分钟项目创建完成

### 2️⃣ 配置数据库（1 分钟）

#### 2.1 运行 SQL 脚本
1. 点击左侧菜单 "SQL Editor"
2. 点击 "New query"
3. 打开项目中的 `supabase-setup.sql` 文件
4. 复制全部内容
5. 粘贴到 SQL Editor
6. 点击 "Run" 按钮
7. 看到 "Success" 提示

#### 2.2 启用 Realtime
1. 点击左侧 "Database" -> "Replication"
2. 找到 `users` 表，打开开关（Enable Realtime）
3. 找到 `transactions` 表，打开开关（Enable Realtime）

#### 2.3 获取 API 密钥
1. 点击左下角 "Settings"（设置图标）
2. 点击 "API"
3. 复制两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长）

### 3️⃣ 修改前端配置（30 秒）

1. 打开项目中的 `cloud-app.js` 文件
2. 找到第 2-3 行：
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. 替换为刚才复制的值：
   ```javascript
   const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MT...';
   ```
4. 保存文件

### 4️⃣ 部署到 GitHub（1 分半钟）

#### 4.1 初始化 Git 仓库
打开命令行（PowerShell 或 CMD），进入项目目录：
```bash
cd d:\trae\money
git init
git add .
git commit -m "Initial commit"
```

#### 4.2 创建 GitHub 仓库
1. 打开 https://github.com
2. 点击右上角 "+" -> "New repository"
3. 填写：
   - **Repository name**: `money-tracker`（或其他名字）
   - 选择 "Public"
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

#### 4.3 推送代码
复制 GitHub 显示的命令（替换为你的仓库地址）：
```bash
git remote add origin https://github.com/你的用户名/money-tracker.git
git branch -M main
git push -u origin main
```

#### 4.4 启用 GitHub Pages
1. 在 GitHub 仓库页面，点击 "Settings"
2. 点击左侧 "Pages"
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选择 "/ (root)"
5. 点击 "Save"

### 5️⃣ 测试使用（30 秒）

#### 5.1 等待部署完成
- GitHub 需要 1-2 分钟部署
- 刷新页面查看状态

#### 5.2 访问应用
访问地址：
```
https://你的用户名.github.io/money-tracker/cloud-app.html
```

#### 5.3 注册测试账户
1. 点击 "注册" 标签
2. 输入：
   - 用户名：`test`
   - 邮箱：`your-email@example.com`
   - 密码：`Test123456`
3. 点击 "注册"

#### 5.4 测试功能
1. 登录账户
2. 添加一笔金额（例如：100）
3. 添加备注（例如：测试）
4. 查看交易记录
5. 尝试编辑和删除

---

## ✅ 完成！

现在您拥有了一个：
- ✅ 多用户实时同步的账户记录系统
- ✅ 完全免费托管在 GitHub 上
- ✅ 数据存储在 Supabase 云端
- ✅ 支持编辑和删除交易记录
- ✅ 可通过 URL 分享给任何人

## 🎉 下一步

### 自定义账户名称
编辑 `cloud-app.html`，搜索 "WSW" 和 "XD" 替换为您喜欢的名字

### 修改样式
编辑 `cloud-styles.css` 自定义颜色和布局

### 分享给朋友
将 GitHub Pages 链接分享给朋友，他们也可以注册使用

---

## 🆘 遇到问题？

### 问题 1: 注册后无法登录
**解决**: 在 Supabase Dashboard -> Authentication -> Settings，关闭 "Confirm email"

### 问题 2: 页面显示空白
**解决**: 
1. 检查 `cloud-app.js` 中的配置是否正确
2. 打开浏览器控制台（F12）查看错误信息

### 问题 3: 数据不同步
**解决**: 
1. 检查是否启用了 Realtime
2. 查看浏览器控制台是否有错误

### 问题 4: GitHub Pages 404 错误
**解决**: 
1. 等待 2-3 分钟让 GitHub 完成部署
2. 确认访问的是 `cloud-app.html` 而不是 `index.html`

---

**祝您使用愉快！** 🚀

如有问题，请查看完整文档 `DEPLOYMENT.md`
