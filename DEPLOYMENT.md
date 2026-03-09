# 🚀 GitHub Pages + Supabase 部署指南

## 📋 项目特性

- ✅ **多用户实时同步** - 不同设备登录同一账户，数据实时同步
- ✅ **交易记录管理** - 支持添加、编辑、删除交易记录
- ✅ **备注功能** - 每笔交易可添加备注信息
- ✅ **云端存储** - 使用 Supabase 免费云数据库
- ✅ **完全免费** - GitHub Pages + Supabase 免费套餐
- ✅ **无需服务器** - 静态网页即可运行

## 🎯 快速开始（3 步部署）

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "Start your project" 创建免费账户
3. 创建新项目：
   - 项目名称：`money-tracker`
   - 数据库密码：（保存好密码）
   - 区域：选择最近的（推荐 `ap-southeast-1` 新加坡）

### 步骤 2: 配置数据库

1. **运行 SQL 脚本**
   - 进入 Supabase Dashboard
   - 点击左侧 "SQL Editor"
   - 点击 "New query"
   - 复制 `supabase-setup.sql` 文件内容并粘贴
   - 点击 "Run" 执行

2. **启用 Realtime**
   - 点击左侧 "Database" -> "Replication"
   - 找到 `users` 表，开启 "Enable Realtime"
   - 找到 `transactions` 表，开启 "Enable Realtime"

3. **配置认证**
   - 点击左侧 "Authentication" -> "Providers"
   - 确保 "Email" 已启用
   - （可选）关闭 "Confirm email" 以便立即登录

4. **获取项目配置**
   - 点击左下角 "Settings" -> "API"
   - 复制以下两个值：
     - `Project URL`: `https://xxxxx.supabase.co`
     - `anon public`: `eyJhbG...`（很长的字符串）

### 步骤 3: 配置前端代码

1. 打开 `cloud-app.js` 文件
2. 找到第 2-3 行：
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. 替换为您的 Supabase 配置：
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbG...';
   ```

### 步骤 4: 部署到 GitHub Pages

1. **创建 GitHub 仓库**
   ```bash
   cd d:\trae\money
   git init
   git add .
   git commit -m "Initial commit - 云端账户记录系统"
   ```

2. **创建远程仓库**
   - 访问 [GitHub](https://github.com)
   - 创建新仓库，例如：`money-tracker`
   - 不要勾选 "Initialize this repository with a README"

3. **推送代码**
   ```bash
   git remote add origin https://github.com/你的用户名/money-tracker.git
   git branch -M main
   git push -u origin main
   ```

4. **启用 GitHub Pages**
   - 进入仓库页面
   - 点击 "Settings" -> "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，文件夹选择 "/ (root)"
   - 点击 "Save"

5. **访问应用**
   - 等待 1-2 分钟部署完成
   - 访问：`https://你的用户名.github.io/money-tracker/cloud-app.html`

## 📱 使用方法

### 注册账户
1. 打开应用，点击 "注册" 标签
2. 输入用户名、邮箱和密码
3. 点击 "注册" 按钮

### 登录
1. 输入注册时的邮箱和密码
2. 点击 "登录" 按钮

### 添加交易记录
1. 在金额输入框输入金额
2. （可选）在备注框输入备注信息
3. 点击 "添加" 按钮

### 设置账户余额
1. 在金额输入框输入要设置的余额
2. （可选）输入备注
3. 点击 "设置" 按钮

### 编辑交易记录
1. 在交易记录列表中找到要编辑的记录
2. 点击 ✏️ 按钮
3. 修改备注信息
4. 确认保存

### 删除交易记录
1. 在交易记录列表中找到要删除的记录
2. 点击 🗑️ 按钮
3. 确认删除

### 实时同步
- 在多个设备登录同一账户
- 所有操作会实时同步到其他设备
- 查看右上角的同步状态指示器

## 🔧 技术架构

```
┌─────────────┐
│   用户浏览器  │
│  (前端页面)  │
└──────┬──────┘
       │
       │ HTTPS
       │
       ▼
┌─────────────┐     ┌──────────────┐
│ GitHub Pages│────▶│   Supabase   │
│  (静态托管)  │     │ (数据库 + 认证) │
└─────────────┘     └──────────────┘
                           │
                           │ WebSocket
                           │
                           ▼
                    ┌──────────────┐
                    │  实时同步服务  │
                    └──────────────┘
```

## 📁 文件说明

```
money/
├── cloud-app.html          # 云端版主页面
├── cloud-app.js            # 前端主逻辑（含 Supabase 配置）
├── cloud-styles.css        # 云端版样式
├── style.css               # 基础样式
├── supabase-setup.sql      # 数据库初始化脚本
├── README.md               # 项目说明文档
└── DEPLOYMENT.md          # 本部署文档
```

## 🔒 安全性

- ✅ 密码使用 bcrypt 加密存储
- ✅ JWT 令牌认证
- ✅ 行级安全策略 (RLS) 保护数据
- ✅ 每个用户只能访问自己的数据
- ✅ HTTPS 加密传输

## 💰 费用说明

### Supabase 免费套餐
- 数据库：500MB
- 带宽：5GB/月
- 认证用户：50,000/月
- 实时连接：200 个同时连接
- 完全够用个人使用

### GitHub Pages 免费套餐
- 存储空间：1GB
- 带宽：100GB/月
- 完全免费

## 🛠️ 常见问题

### Q: 注册后收不到确认邮件？
A: 在 Supabase Dashboard -> Authentication -> Settings 中关闭 "Confirm email"

### Q: 实时同步不工作？
A: 检查是否启用了 Realtime：
   - Database -> Replication -> 启用 users 和 transactions 表

### Q: 如何修改账户名称？
A: 编辑 `cloud-app.html` 文件中的 "WSW" 和 "XD"

### Q: 如何自定义样式？
A: 修改 `cloud-styles.css` 文件

### Q: 数据会丢失吗？
A: Supabase 每天自动备份，数据非常安全

## 📊 监控和统计

在 Supabase Dashboard 可以查看：
- 用户数量
- 数据库使用情况
- API 请求统计
- 实时连接数

## 🤝 技术支持

如有问题，请：
1. 查看 Supabase 文档：https://supabase.com/docs
2. 检查浏览器控制台错误信息
3. 联系项目维护者

## 📄 许可证

MIT License

---

**祝您使用愉快！** 🎉
