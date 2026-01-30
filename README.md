# SciMemoCard (科研单词闪卡)

智能单词闪卡应用，结合**语境记忆**和**间隔重复算法**帮助科研新手高效掌握术语。

**[English](README_EN.md)**

## ✨ 核心功能

- 📝 **生词场景化录入** - 在文献句子中学习单词，保留使用场景
- 🎯 **智能闪卡复习** - 基于遗忘曲线的智能复习间隔调整
- ⭐ **掌握程度评分** - 不熟/一般/熟练三级评分
- 📊 **学习数据统计** - 生词量/掌握率/学科分布

## 🛠️ 技术栈

Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + Vercel Postgres

## 🚀 快速开始

### 1. 启动 PostgreSQL (使用 Docker)

```bash
# 启动 PostgreSQL 容器 (端口 5435)
docker run -d --name sci-memo-postgres \
  -e POSTGRES_USER=scimemo \
  -e POSTGRES_PASSWORD=scimemo123 \
  -e POSTGRES_DB=scimemocard \
  -p 5435:5432 \
  postgres:15-alpine

# 查看容器状态
docker ps | grep sci-memo-postgres

# 停止容器
docker stop sci-memo-postgres
```

### 2. 配置环境变量

创建 `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=/api
POSTGRES_URL="postgresql://scimemo:scimemo123@localhost:5435/scimemocard"
POSTGRES_PRISMA_URL="postgresql://scimemo:scimemo123@localhost:5435/scimemocard"
POSTGRES_URL_NON_POOLING="postgresql://scimemo:scimemo123@localhost:5435/scimemocard"
```

### 3. 安装依赖并启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:3020)
pnpm dev

# 代码检查
pnpm lint

# 构建
pnpm build
```

## 📁 项目结构

```
src/
├── app/              # Next.js App Router (页面 + API路由)
├── components/       # React组件 (ui/ + flashcard/)
├── hooks/            # 自定义 Hooks
└── lib/              # 工具函数 (api.ts, storage.ts, types.ts)
```

## 📊 数据模型

```typescript
interface Flashcard {
  id: number
  sentence: string       // 完整文献句子
  word: string          // 目标单词
  translation: string   // 中文翻译
  definition: string    // 学术定义
  domain: string       // 学科领域 (默认: "通用")
  mastery: 1 | 2 | 3  // 掌握程度: 1=不熟, 2=一般, 3=熟练
  next_review: string  // 下次复习时间 (ISO date)
  review_count: number // 复习次数
  created_at: string   // 创建时间 (ISO date)
}
```

## 🔧 API 接口

- `GET/POST /api/cards` - 获取/创建闪卡
- `GET/PUT/DELETE /api/cards/{id}` - 操作单个闪卡
- `GET /api/cards/daily-random` - 获取每日复习卡片
- `POST /api/cards/{id}/review` - 提交复习结果
- `GET /api/cards/stats/overview` - 获取统计数据

## 🎯 间隔重复算法

- **Level 1 (不熟)**: 4小时后复习
- **Level 2 (一般)**: 1天后复习
- **Level 3 (熟练)**: 7天后复习

每日复习卡片使用**加权随机选择** - 低掌握度的卡片有更高概率被选中。

## 📝 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | API 基础路径 | `/api` |
| `POSTGRES_URL` | PostgreSQL 连接字符串 (带连接池) | `postgresql://user:pass@localhost:5435/db` |
| `POSTGRES_PRISMA_URL` | Prisma ORM 连接字符串 | 同上 |
| `POSTGRES_URL_NON_POOLING` | 直连 PostgreSQL 字符串 | 同上 |

## 📄 许可证

MIT License
