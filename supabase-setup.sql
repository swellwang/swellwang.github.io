-- =====================================================
-- Supabase 数据库初始化脚本
-- =====================================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    accounts JSONB DEFAULT '{"1": 0, "2": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account INTEGER NOT NULL CHECK (account IN (1, 2)),
    type TEXT NOT NULL CHECK (type IN ('add', 'set', 'clear')),
    amount DECIMAL(12, 2) NOT NULL,
    note TEXT DEFAULT '',
    old_balance DECIMAL(12, 2),
    balance_after DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_account ON transactions(user_id, account);

-- 4. 创建行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. 创建用户表策略
CREATE POLICY "用户只能查看自己的数据"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的数据"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的数据"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 6. 创建交易记录表策略
CREATE POLICY "用户只能查看自己的交易记录"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的交易记录"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的交易记录"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的交易记录"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- 7. 创建自动更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 创建实时发布
-- 注意：这需要在 Supabase Dashboard 中启用 Realtime 功能
-- 在 Supabase Dashboard -> Database -> Replication 中启用 users 和 transactions 表的 Realtime

-- =====================================================
-- 使用说明：
-- 1. 在 Supabase Dashboard 的 SQL Editor 中运行此脚本
-- 2. 在 Supabase Dashboard -> Authentication -> Providers 中启用 Email 认证
-- 3. 在 Supabase Dashboard -> Database -> Replication 中启用 Realtime
-- 4. 复制 Supabase URL 和 Anon Key 到 cloud-app.js 中
-- =====================================================
