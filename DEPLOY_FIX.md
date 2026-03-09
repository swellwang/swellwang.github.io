# 🚀 部署后常见问题解决

## 问题：登录后一直显示"正在加载"

### 原因
`cloud-app.js` 文件中的 Supabase 配置还没有设置。

### 解决方法

#### 步骤 1: 创建 Supabase 项目（2 分钟）

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（推荐）或邮箱注册
4. 点击 "New project"
5. 填写项目信息：
   - **Name**: `money-tracker`
   - **Database password**: 记住这个密码（例如：`MyMoney2024!`）
   - **Region**: 选择 `Singapore (Singapore)` - 离中国最近
6. 点击 "Create new project"
7. 等待 1-2 分钟项目创建完成

#### 步骤 2: 配置数据库（1 分钟）

1. **运行 SQL 脚本**
   - 进入 Supabase Dashboard
   - 点击左侧 "SQL Editor"
   - 点击 "New query"
   - 打开项目中的 `supabase-setup.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 按钮
   - 看到 "Success. No rows returned" 提示

2. **启用 Realtime**
   - 点击左侧 "Database" -> "Replication"
   - 找到 `users` 表，打开开关（Enable Realtime）
   - 找到 `transactions` 表，打开开关（Enable Realtime）

3. **（可选）关闭邮箱验证**
   - 点击左侧 "Authentication" -> "Settings"
   - 找到 "Enable email confirmations"
   - 关闭此选项（这样注册后可以直接登录）
   - 点击 "Save"

#### 步骤 3: 获取 API 密钥（30 秒）

1. 点击左下角 "Settings"（齿轮图标）
2. 点击 "API"
3. 复制两个值：
   - **Project URL**: `https://abcdefgh.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MT...`（很长的字符串）

#### 步骤 4: 修改 cloud-app.js 配置（1 分钟）

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

#### 步骤 5: 更新到 GitHub（1 分钟）

1. 打开命令行（PowerShell 或 CMD）
2. 进入项目目录：
   ```bash
   cd d:\trae\money
   ```
3. 提交并推送更改：
   ```bash
   git add .
   git commit -m "Update Supabase configuration"
   git push
   ```

#### 步骤 6: 测试（30 秒）

1. 等待 1-2 分钟 GitHub Pages 自动更新
2. 刷新浏览器页面
3. 现在应该可以看到登录/注册界面了！
4. 尝试注册一个账户并登录

---

## ✅ 验证配置成功

配置成功后，您应该看到：

1. ✅ 登录/注册表单正常显示
2. ✅ 可以注册新账户
3. ✅ 可以登录
4. ✅ 登录后显示账户操作界面
5. ✅ 右上角显示 "🟢 已连接"

---

## 🔧 其他问题

### 问题 1: 注册后无法登录

**原因**: 邮箱验证未关闭

**解决方法**:
1. 在 Supabase Dashboard -> Authentication -> Settings
2. 关闭 "Confirm email"
3. 重新注册账户

### 问题 2: 登录后看不到数据

**原因**: 数据库表未创建

**解决方法**:
1. 重新运行 `supabase-setup.sql` 脚本
2. 确认没有错误提示

### 问题 3: 实时同步不工作

**原因**: Realtime 未启用

**解决方法**:
1. 在 Supabase Dashboard -> Database -> Replication
2. 确保 `users` 和 `transactions` 表的 Realtime 已启用

### 问题 4: GitHub Pages 404 错误

**原因**: GitHub Pages 未正确配置

**解决方法**:
1. 进入 GitHub 仓库 -> Settings -> Pages
2. 确认 Source 设置为 "Deploy from a branch"
3. Branch 选择 "main"，文件夹选择 "/ (root)"
4. 保存后等待 2-3 分钟

---

## 📞 需要帮助？

如果以上方法都无法解决问题：

1. 打开浏览器开发者工具（F12）
2. 查看 Console（控制台）中的错误信息
3. 根据错误信息搜索解决方案
4. 或查看 [QUICK_START.md](QUICK_START.md) 获取详细帮助

---

**祝您部署成功！** 🎉
