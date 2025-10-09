# Twitter Clone 云服务器部署指南

## 服务器信息
- 地址：120.79.174.9
- 系统：Alibaba Cloud Linux 3
- 代码仓库：https://github.com/cokepoppy/my-twitter.git

## 快速部署

### 方法1：手动执行命令
```bash
# 1. 更新系统
dnf update -y

# 2. 安装必要软件
dnf install -y git nodejs npm nginx

# 3. 安装Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# 4. 克隆代码
git clone https://github.com/cokepoppy/my-twitter.git /root/my-twitter
cd /root/my-twitter

# 5. 安装后端依赖
cd backend
npm install

# 6. 安装前端依赖并构建
cd ../frontend
npm install
npm run build

# 7. 配置环境变量
cd ../backend
# 创建 .env 文件，填入实际的数据库密码等配置

# 8. 配置Nginx
# 复制 scripts/nginx.conf 到 /etc/nginx/conf.d/my-twitter.conf

# 9. 启动服务
systemctl start nginx
node server.js
```

### 方法2：使用部署脚本
```bash
# 下载并运行部署脚本
curl -o deploy.sh https://raw.githubusercontent.com/cokepoppy/my-twitter/main/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

## 部署后配置

1. **数据库配置**：修改 `/root/my-twitter/backend/.env` 文件
2. **启动服务**：
   ```bash
   cd /root/my-twitter/backend
   npm start
   # 或使用 pm2: pm2 start server.js
   ```
3. **访问地址**：http://120.79.174.9

### CORS / 前后端同源配置（重要）
- 如果前端通过 Nginx 静态托管在 `http://120.79.174.9`，后端运行在 `:8000`，推荐使用反向代理将同源的 `/api` 转发到后端，避免 CORS：
  - Nginx 中：`location /api { proxy_pass http://127.0.0.1:8000; }`
  - 此时前端的 `VITE_API_URL` 可以留空或设为 `http://120.79.174.9`
- 若不使用反向代理，需配置后端 CORS 允许页面来源：
  - 在后端环境设置 `FRONTEND_URLS=http://120.79.174.9,http://localhost:3000`
  - 重启后端后，`Access-Control-Allow-Origin` 将自动匹配来源
  - 本仓库已将后端 CORS 改为多域名白名单（支持逗号分隔）

## 维护命令
```bash
# 查看服务状态
systemctl status nginx

# 重启Nginx
systemctl restart nginx

# 更新代码
cd /root/my-twitter && git pull

# 查看日志
journalctl -u nginx -f
```

---

## 使用 Docker 在阿里云部署（推荐）

> 前端将部署到 Vercel，服务器仅运行后端 + MySQL + Redis。

### 1. 准备服务器

```bash
# 更新系统并安装 Docker
sudo dnf update -y
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
# 安装 Docker Compose v2（如果未自带）
sudo curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 拉取代码并配置环境
```bash
git clone https://github.com/cokepoppy/my-twitter.git /opt/my-twitter
cd /opt/my-twitter

# 可选：创建 .env 文件覆盖 Compose 变量（域名、数据库等）
cat > .env << 'ENV'
MYSQL_ROOT_PASSWORD=your-strong-root-pass
MYSQL_DATABASE=twitter
MYSQL_USER=twitter_user
MYSQL_PASSWORD=twitter_password
JWT_SECRET=please-change-me
# Vercel 前端域名，用于后端 CORS
FRONTEND_URL=https://your-vercel-domain.vercel.app
ENV
```

### 3. 启动后端栈
```bash
# 仅后端 + DB + Redis（前端在 Vercel）
docker compose -f docker-compose.api.yml up -d --build
```
- 后端监听 `:8000`，健康检查 `GET /health`
- 首次启动会自动执行 `prisma migrate deploy`
- 上传目录映射 `backend/uploads -> /app/uploads`

### 4. 配置安全组/防火墙
- 放通 8000（API）、3306（如需外部 DB 访问，可不暴露）
- 推荐在阿里云负载均衡或 Nginx 上绑定域名和 TLS，再转发到 `:8000`

---

## 前端部署到 Vercel

### 1. 创建项目
- 在 Vercel 选择 `frontend/` 子目录作为项目根目录
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### 2. 环境变量
在 Vercel Project → Settings → Environment Variables 中添加：
- `VITE_API_URL = https://api.your-domain.com`（指向阿里云 API 域名，带协议）
- 如使用 Socket：`VITE_SOCKET_URL = wss://api.your-domain.com`（若有）

代码侧已在 `frontend/src/main.ts` 设置：
```ts
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''
```

### 3. 单页路由
项目已包含 `frontend/vercel.json` 以支持 SPA 回退到 `index.html`。

---

## 常见问题
- 403/CORS：确认后端容器环境变量 `FRONTEND_URL` 与 Vercel 域名匹配
- 迁移失败：检查 `DATABASE_URL`，以及 MySQL/Redis 容器是否正常
- 上传文件 404：确认 `backend/uploads` 已持久化挂载
