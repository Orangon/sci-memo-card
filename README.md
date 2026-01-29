# 科研单词闪卡 (SciMemoCard)

一个面向科研新手的智能单词闪卡Web应用，结合语境记忆和间隔重复算法，帮助高效掌握科研词汇。

## ✨ 核心功能

### 1. 生词场景化录入
- 📝 支持粘贴科研文献句子并高亮标记多个生词
- 🌐 中英双语解释（突出学术含义）
- 🔗 自动关联生词与上下文语境
- 📚 学科领域元数据标记
- 💾 持久化存储并支持JSON导出

### 2. 智能闪卡复习
- 🎯 完整句子展示 + 高亮目标单词
- 🔄 翻转卡片显示详细解释
- ⭐ 掌握程度评分（不熟/一般/熟练）
- 📊 基于遗忘曲线的智能复习间隔调整

### 3. 辅助功能
- 📈 学习数据统计（生词量/掌握率/学科分布）
- 🚀 极简操作流程
- 🎓 默认科研场景引导
- ⏰ 自动记录学习时间节点

## 🛠️ 技术栈



## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- Python 3.8+
- npm 或 yarn

### 开发
```bash
# 进入项目目录
cd sci-memo-card

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📁 项目结构

```
sci-memo-card/
├── src/                    # 前端源码
│   ├── components/         # React组件
│   ├── hooks/              # 自定义Hooks
│   ├── lib/                # 工具函数
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── globals.css         # 全局样式
├── package.json            # 前端依赖配置
└── README.md              # 项目说明
```

## 🎯 设计理念

### 科学学习原理
1. **语境记忆** - 在完整句子中学习单词，保留使用场景
2. **间隔重复** - 基于艾宾浩斯遗忘曲线智能安排复习
3. **主动回忆** - 通过翻转卡片促进主动记忆
4. **多模态输入** - 视觉高亮 + 文字解释 + 分类标签

### 用户体验设计
- 🎨 简洁专业的科研风格界面
- 📱 响应式设计，支持移动端
- ⚡ 快速交互，极简操作流程
- 🔍 清晰的视觉层次和引导

## 📊 数据模型

### 闪卡数据结构
```typescript
interface Flashcard {
  id: number
  sentence: string          // 完整文献句子
  word: string              // 目标单词
  translation: string       // 中文翻译
  definition: string        // 学术定义
  domain: string           // 学科领域
  mastery: number          // 掌握程度 (1-3)
  nextReview: Date         // 下次复习时间
  createdAt: Date          // 创建时间
}
```

## 🔧 API接口

### 闪卡管理
- `GET /api/cards` - 获取闪卡列表
- `POST /api/cards` - 创建新闪卡
- `GET /api/cards/{id}` - 获取单个闪卡
- `PUT /api/cards/{id}` - 更新闪卡
- `DELETE /api/cards/{id}` - 删除闪卡

### 复习系统
- `GET /api/review` - 获取待复习闪卡
- `POST /api/review/{id}` - 提交复习结果
- `GET /api/stats` - 获取学习统计数据

## 🚀 部署指南

### 生产环境部署
1. 配置环境变量
2. 构建前端应用：`npm run build`
3. 设置数据库连接
4. 使用Docker容器化部署（可选）

### 环境变量
```bash
# 数据库配置
DATABASE_URL=postgresql://user:pass@localhost:5432/scimemocard

# 应用配置
APP_ENV=production
SECRET_KEY=your-secret-key
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 灵感来源于科研人员的实际学习需求
- 基于科学的记忆和学习方法论
- 使用优秀的开源技术栈

---

如有问题或建议，请提交 [Issue](https://github.com/your-username/scimemocard/issues) 或联系开发团队。