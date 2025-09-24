#!/bin/bash

# Twitter Clone 部署脚本
# 适用于阿里云 Alibaba Cloud Linux 3
# 服务器地址: 120.79.174.9

set -e

echo "=== Twitter Clone 部署开始 ==="

# 更新系统
echo "1. 更新系统..."
yum update -y

# 安装必要的软件
echo "2. 安装必要软件..."
yum install -y git nodejs npm nginx

# 安装Node.js 18 (如果需要)
echo "3. 安装Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 创建项目目录
echo "4. 创建项目目录..."
mkdir -p /root/my-twitter
cd /root/my-twitter

# 克隆代码
echo "5. 克隆代码..."
git clone https://github.com/cokepoppy/my-twitter.git .

# 安装后端依赖
echo "6. 安装后端依赖..."
cd backend
npm install

# 安装前端依赖
echo "7. 安装前端依赖..."
cd ../frontend
npm install

# 构建前端
echo "8. 构建前端..."
npm run build

# 配置Nginx
echo "9. 配置Nginx..."
cat > /etc/nginx/conf.d/my-twitter.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /root/my-twitter/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket支持
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 创建环境变量文件
echo "10. 创建环境变量文件..."
cd /root/my-twitter/backend
cat > .env << 'EOF'
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=twitter_clone

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here

# 服务器配置
PORT=3000
NODE_ENV=production

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS配置
FRONTEND_URL=http://your_server_ip

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_BUCKET=your_bucket_name
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
EOF

# 创建系统服务文件
echo "11. 创建系统服务文件..."
cat > /etc/systemd/system/my-twitter-backend.service << 'EOF'
[Unit]
Description=My Twitter Backend Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/my-twitter/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
echo "12. 启动服务..."
systemctl daemon-reload
systemctl enable my-twitter-backend
systemctl start my-twitter-backend
systemctl enable nginx
systemctl start nginx

# 设置防火墙
echo "13. 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
fi

echo "=== 部署完成 ==="
echo ""
echo "访问地址: http://$(curl -s ifconfig.me)"
echo "后端API: http://$(curl -s ifconfig.me)/api"
echo ""
echo "后续维护命令："
echo "  查看后端状态: systemctl status my-twitter-backend"
echo "  重启后端: systemctl restart my-twitter-backend"
echo "  查看日志: journalctl -u my-twitter-backend -f"
echo "  更新代码: cd /root/my-twitter && git pull"