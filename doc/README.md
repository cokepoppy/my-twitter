# Twitter Clone 项目文档

## 项目概述

本项目是一个基于Vue3、TailwindCSS、Express、MySQL和Redis技术栈的Twitter克隆项目，旨在实现一个功能完整的社交媒体平台。

## 技术栈

### 前端技术
- **Vue 3.4+** - 主框架，使用Composition API
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **TailwindCSS** - UI框架
- **Headless UI** - 无障碍组件
- **Axios** - HTTP客户端
- **Socket.io-client** - 实时通信

### 后端技术
- **Node.js 20+** - 运行时环境
- **Express.js** - Web框架
- **TypeScript** - 类型安全
- **Prisma** - ORM
- **MySQL 8.0** - 主数据库
- **Redis** - 缓存和队列
- **Socket.io** - 实时通信
- **JWT** - 认证
- **Bcrypt** - 密码加密

## 文档结构

```
doc/
├── README.md                    # 本文档
├── twitter-clone-research.md    # 项目调研报告
├── technical-implementation-plan.md  # 技术实施方案
├── project-timeline.md          # 项目时间线
├── database-design.md           # 数据库设计文档
├── api-design.md               # API设计文档
├── deployment-guide.md          # 部署指南
└── architecture-overview.md     # 架构概览
```

## 快速开始

### 环境要求
- Node.js 20+
- MySQL 8.0+
- Redis 7.0+
- Docker (可选)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd my-twitter
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑环境变量
vim backend/.env
```

4. **启动数据库**
```bash
# 使用Docker启动MySQL和Redis
docker-compose up -d mysql redis
```

5. **数据库迁移**
```bash
cd backend
npm run migrate
npm run seed
```

6. **启动开发服务器**
```bash
# 启动后端服务器
npm run dev

# 启动前端开发服务器
cd ../frontend
npm run dev
```

7. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/api-docs

## 项目特性

### 核心功能
- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 关注/粉丝系统
- ✅ 推文发布/编辑
- ✅ 图片/视频上传
- ✅ 点赞/评论/转发
- ✅ 实时通知
- ✅ 私信功能
- ✅ 搜索功能
- ✅ 推荐系统
- ✅ 趋势话题

### 技术特性
- 🚀 现代化技术栈
- 🔒 JWT认证
- 📱 响应式设计
- 🔄 实时通信
- 💾 缓存优化
- 🎨 美观的UI设计
- ♿ 无障碍支持
- 📊 性能监控
- 🔧 Docker化部署

## 项目结构

```
my-twitter/
├── frontend/                 # Vue3前端
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/          # 页面组件
│   │   ├── stores/         # Pinia状态管理
│   │   ├── utils/          # 工具函数
│   │   ├── assets/         # 静态资源
│   │   └── api/            # API接口
│   ├── public/
│   └── package.json
├── backend/                 # Express后端
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── config/             # 配置文件
│   └── package.json
├── database/               # 数据库相关
│   ├── migrations/         # 数据库迁移
│   └── seeds/             # 种子数据
├── docker/                # Docker配置
└── docs/                  # 文档
```

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 使用ESLint和Prettier进行代码格式化
- 遵循Vue3 Composition API最佳实践
- 使用Prisma进行数据库操作

### 测试
```bash
# 运行前端测试
cd frontend
npm run test

# 运行后端测试
cd backend
npm run test

# 运行端到端测试
npm run test:e2e
```

### 构建
```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend
npm run build
```

## 部署

### Docker部署
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 手动部署
1. 配置服务器环境
2. 安装Node.js和MySQL
3. 上传代码到服务器
4. 安装依赖并构建
5. 配置Nginx反向代理
6. 启动服务

详细部署说明请参考 [部署指南](./deployment-guide.md)

## 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](../LICENSE) 文件。

## 支持

如果您在使用过程中遇到问题，请：

1. 查看 [常见问题](./faq.md)
2. 搜索已有的 [Issues](https://github.com/your-repo/issues)
3. 创建新的 Issue 描述问题
4. 联系开发团队

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现核心功能
- 完成基础架构

### v1.1.0 (2024-02-01)
- 添加实时通知功能
- 优化性能
- 修复已知问题

## 相关链接

- [项目调研报告](./twitter-clone-research.md)
- [技术实施方案](./technical-implementation-plan.md)
- [项目时间线](./project-timeline.md)
- [数据库设计](./database-design.md)
- [API设计](./api-design.md)
- [部署指南](./deployment-guide.md)
- [架构概览](./architecture-overview.md)

---

**开始您的Twitter克隆之旅！** 🚀