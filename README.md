# 💰 账户总额记录系统

> 简单、安全、实时的个人财务管理工具

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://pages.github.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🌟 特性亮点

- ✅ **多用户系统** - 支持注册登录，多人使用
- ✅ **实时同步** - 多设备登录，数据秒级同步
- ✅ **交易管理** - 完整的增删改查功能
- ✅ **备注功能** - 每笔交易可添加备注
- ✅ **云端存储** - Supabase 免费云数据库
- ✅ **完全免费** - GitHub Pages + Supabase 免费套餐
- ✅ **响应式设计** - 手机电脑完美适配
- ✅ **数据安全** - 行级安全策略保护

## 🚀 快速开始

### 方案一：云端同步版（推荐）⭐

**无需安装任何软件，5 分钟即可部署上线！**

1. **创建 Supabase 项目** (2 分钟)
   - 访问 https://supabase.com
   - 创建免费账户和项目
   - 运行数据库初始化脚本

2. **配置前端** (30 秒)
   - 修改 `cloud-app.js` 中的 Supabase 配置

3. **部署到 GitHub** (2 分钟)
   - 推送到 GitHub 仓库
   - 启用 GitHub Pages

📖 **详细教程**：[查看 5 分钟快速配置指南](QUICK_START.md)

### 方案二：本地单机版

适合个人使用，数据存储在本地浏览器。

直接打开 `index.html` 即可使用（原来的本地版本保留）。

## 📱 使用演示

### 1. 注册账户
访问应用后，点击"注册"，填写用户名、邮箱和密码。

### 2. 添加交易
- 输入金额（必填）
- 输入备注（可选）
- 点击"添加"按钮

### 3. 管理记录
- ✏️ **编辑** - 修改备注信息
- 🗑️ **删除** - 删除交易记录
- 🔍 **筛选** - 按账户查看记录

### 4. 实时同步
在多个设备登录同一账户，所有操作实时同步！

## 📁 项目结构

```
money/
├── cloud-app.html          # 云端版主页面 ⭐
├── cloud-app.js            # 云端版主逻辑（含 Supabase 配置）
├── cloud-styles.css        # 云端版样式
├── index.html              # 入口页面（版本选择）
├── style.css               # 本地版样式
├── script.js               # 本地版主逻辑
├── supabase-setup.sql      # 数据库初始化脚本
├── QUICK_START.md          # 5 分钟快速配置指南 ⭐
├── DEPLOYMENT.md           # 完整部署指南
└── README.md               # 本文件
```

## 🛠️ 技术栈

### 前端
- HTML5 / CSS3 / JavaScript (ES6+)
- Supabase JS SDK
- 响应式设计

### 后端（云端版）
- **Supabase** - Backend as a Service
  - PostgreSQL 数据库
  - 用户认证（Auth）
  - 实时订阅（Realtime）
  - 行级安全（RLS）

### 部署
- **GitHub Pages** - 静态网站托管
- **Supabase** - 云端数据库和认证

## 🔒 安全性

- ✅ 密码 bcrypt 加密存储
- ✅ JWT 令牌认证
- ✅ 行级安全策略（RLS）
- ✅ HTTPS 加密传输
- ✅ 每个用户只能访问自己的数据

## 💰 费用说明

### 完全免费！

**Supabase 免费套餐**：
- 数据库：500MB
- 带宽：5GB/月
- 认证用户：50,000/月
- 实时连接：200 个同时连接

**GitHub Pages 免费套餐**：
- 存储空间：1GB
- 带宽：100GB/月

个人使用完全足够！

## 📖 文档索引

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| [QUICK_START.md](QUICK_START.md) | 5 分钟快速配置指南 | 新手首选 ⭐ |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 完整部署指南 | 需要详细了解 |
| [README.md](README.md) | 项目介绍 | 所有人 |

## 🎯 常见问题

### Q: 部署复杂吗？
A: 非常简单！按照 [QUICK_START.md](QUICK_START.md) 操作，5 分钟即可完成。

### Q: 数据会丢失吗？
A: Supabase 每天自动备份，数据非常安全。

### Q: 可以在手机上用吗？
A: 可以！响应式设计完美支持手机、平板、电脑。

### Q: 多人使用会冲突吗？
A: 不会！每个用户的数据完全隔离，通过账户认证保护。

### Q: 实时同步延迟高吗？
A: 使用 WebSocket 实时推送，延迟通常在 100ms 以内。

### Q: 如何修改账户名称（WSW/XD）？
A: 编辑 `cloud-app.html` 文件，搜索替换即可。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Supabase](https://supabase.com) - 提供免费的云端数据库服务
- [GitHub Pages](https://pages.github.com) - 提供免费的静态网站托管

---

**开始您的财务管理之旅吧！** 🎉

如有问题，请查看 [QUICK_START.md](QUICK_START.md) 或提交 Issue。
