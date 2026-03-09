-- ============================================
-- 账户总额记录系统 - 完整数据库设置脚本
-- 在 Supabase SQL Editor 中运行
-- ============================================

-- ============================================
-- 第一部分：创建表结构
-- ============================================

-- 1. 创建 users 表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    accounts JSONB DEFAULT '{"1": 0, "2": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 transactions 表（如果不存在）
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('add', 'set', 'clear')),
    amount NUMERIC NOT NULL,
    note TEXT,
    balance_after NUMERIC NOT NULL,
    old_balance NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 第二部分：创建索引
-- ============================================

-- 为 users 表创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 为 transactions 表创建索引
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================
-- 第三部分：创建触发器（自动更新 updated_at）
-- ============================================

-- 创建更新函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 users 表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第四部分：启用 Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第五部分：删除旧策略
-- ============================================

-- 删除 users 表的所有策略
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- 删除 transactions 表的所有策略
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- ============================================
-- 第六部分：创建 RLS 策略
-- ============================================

-- users 表策略
-- 允许用户查看自己的数据
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- 允许用户更新自己的数据
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- 允许用户插入自己的数据（注册时）
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- transactions 表策略
-- 允许用户查看自己的交易记录
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- 允许用户插入自己的交易记录
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的交易记录
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 允许用户删除自己的交易记录
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 第七部分：创建实时订阅（可选）
-- ============================================

-- 启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- ============================================
-- 第八部分：验证设置
-- ============================================

-- 检查表结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('users', 'transactions')
ORDER BY table_name, ordinal_position;

-- 检查外键约束
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('users', 'transactions');

-- 检查 RLS 策略
SELECT 
    tablename,
    policyname,
    cmd AS operation,
    CASE 
        WHEN qual IS NOT NULL THEN '✓'
        ELSE '✗'
    END AS has_using,
    CASE 
        WHEN with_check IS NOT NULL THEN '✓'
        ELSE '✗'
    END AS has_with_check
FROM pg_policies
WHERE tablename IN ('users', 'transactions')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 检查索引
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'transactions')
ORDER BY tablename, indexname;

-- ============================================
-- 第九部分：完成消息
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ 数据库设置完成！';
    RAISE NOTICE '';
    RAISE NOTICE '已创建：';
    RAISE NOTICE '  - users 表（用户信息）';
    RAISE NOTICE '  - transactions 表（交易记录）';
    RAISE NOTICE '  - 外键约束（transactions.user_id -> users.id）';
    RAISE NOTICE '  - 索引（优化查询性能）';
    RAISE NOTICE '  - 触发器（自动更新 updated_at）';
    RAISE NOTICE '  - RLS 策略（行级安全控制）';
    RAISE NOTICE '  - 实时订阅（数据实时同步）';
    RAISE NOTICE '';
    RAISE NOTICE '现在可以：';
    RAISE NOTICE '  1. 在应用中注册用户';
    RAISE NOTICE '  2. 登录并添加交易记录';
    RAISE NOTICE '  3. 实时查看数据同步';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 设置成功！';
END $$;
