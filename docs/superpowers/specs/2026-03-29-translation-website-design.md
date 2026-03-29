# 中英文翻译网站设计文档

**日期：** 2026-03-29
**状态：** 已批准

---

## 1. 项目概述

- **项目名称：** EasyTranslate
- **项目类型：** 翻译工具 Web 应用（BaaS 模式）
- **核心功能：** 中英互译、用户账号管理、翻译历史记录
- **目标用户：** 需要中英翻译的用户

---

## 2. 技术栈

| 层级 | 技术选型 |
|------|---------|
| 前端框架 | Next.js 14 (App Router) |
| 样式 | Tailwind CSS |
| 后端/数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth (邮箱 + 密码) |
| 翻译 API | 百度翻译 API (免费额度) |
| 部署 | Vercel |
| 模式 | BaaS（后端即服务） |

---

## 3. 功能列表

### 3.1 翻译功能
- 中译英、英译中双向翻译
- 语言切换按钮
- 实时翻译（提交后返回结果）
- 简洁的输入/输出界面

### 3.2 用户认证
- 邮箱注册（邮箱 + 密码）
- 邮箱登录
- 登录状态持久化
- 登出功能

### 3.3 翻译历史
- 保存每条翻译记录（原文、译文、方向、时间）
- 查看历史翻译列表
- 删除单条历史记录
- 仅显示当前登录用户的历史（RLS 隔离）

---

## 4. 数据库设计

### 表：`translations`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 关联用户（来自 Supabase Auth） |
| source_text | text | 原文 |
| translated_text | text | 译文 |
| direction | text | 翻译方向（zh-en 或 en-zh） |
| created_at | timestamp | 创建时间 |

### 表：`profiles`（可选扩展）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，引用 auth.users.id |
| email | text | 用户邮箱 |

---

## 5. 项目结构

```
/
├── app/
│   ├── layout.tsx          # 根布局（含导航栏）
│   ├── page.tsx            # 首页（翻译主界面）
│   ├── login/page.tsx      # 登录页
│   ├── register/page.tsx   # 注册页
│   └── history/page.tsx    # 历史记录页
├── components/
│   ├── TranslateForm.tsx    # 翻译表单组件
│   ├── HistoryList.tsx     # 历史记录列表
│   ├── NavBar.tsx          # 导航栏
│   └── AuthForm.tsx        # 登录/注册表单
├── lib/
│   ├── supabase.ts         # Supabase 客户端
│   └── translate.ts        # 百度翻译 API 调用
├── styles/
│   └── globals.css          # 全局样式
└── .env.local               # 环境变量（API 密钥）
```

---

## 6. API 设计

### 6.1 翻译接口（客户端直连）

百度翻译 API 调用在客户端完成，通过环境变量存储 appid 和密钥。

**环境变量：**
- `NEXT_PUBLIC_BAIDU_APP_ID` — 百度翻译 App ID
- `NEXT_PUBLIC_BAIDU_SECRET` — 百度翻译密钥

### 6.2 Supabase 数据库操作

- **插入翻译记录：** `supabase.from('translations').insert(...)`
- **查询历史：** `supabase.from('translations').select('*').eq('user_id', ...).order('created_at', { ascending: false })`
- **删除记录：** `supabase.from('translations').delete().eq('id', ...)`

---

## 7. 安全设计

- Supabase Row Level Security (RLS) 启用，确保用户只能操作自己的数据
- 百度翻译 API 密钥存储在 Vercel 环境变量，不暴露在前端
- 密码使用 Supabase Auth 默认加密

---

## 8. 部署流程

1. 在 Vercel 创建新项目，连接 GitHub 仓库
2. 配置 Supabase 项目 URL 和 anon key 环境变量
3. 配置百度翻译 API 密钥环境变量
4. 部署上线

---

## 9. 待实现（后续迭代）

- 多语言支持
- 收藏功能
- 搜索历史
