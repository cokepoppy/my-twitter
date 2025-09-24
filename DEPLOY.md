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