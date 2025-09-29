#!/bin/bash

# 服务器域名配置脚本

echo "Setting up domain configuration..."

# 1. 上传DNS更新脚本
echo "Uploading DNS update script..."
scp update-dns.sh root@120.79.174.9:/root/

# 2. SSH到服务器执行配置
ssh root@120.79.174.9 << 'EOF'
# 创建日志目录
mkdir -p /var/log

# 设置执行权限
chmod +x /root/update-dns.sh

# 手动运行一次测试
/root/update-dns.sh

# 设置定时任务（每小时更新一次）
(crontab -l 2>/dev/null; echo "0 * * * * /root/update-dns.sh") | crontab -

echo "Crontab updated:"
crontab -l

# 3. 更新Nginx配置
cat > /etc/nginx/conf.d/my-twitter.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name my-twitter.duckdns.org www.my-twitter.duckdns.org;

    root /root/my-twitter/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONF

# 4. 重启Nginx
systemctl restart nginx

# 5. 更新应用配置（如果需要）
cd /root/my-twitter/backend
if [ -f .env ]; then
    # 备份原配置
    cp .env .env.backup

    # 更新前端URL
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=http://my-twitter.duckdns.org|' .env

    echo "Updated backend .env configuration"
    cat .env | grep FRONTEND_URL
fi

cd /root/my-twitter/frontend
if [ -f .env ]; then
    # 备份原配置
    cp .env .env.backup

    # 更新API和Socket URL
    sed -i 's|VITE_API_URL=.*|VITE_API_URL=http://my-twitter.duckdns.org/api|' .env
    sed -i 's|VITE_SOCKET_URL=.*|VITE_SOCKET_URL=http://my-twitter.duckdns.org|' .env

    echo "Updated frontend .env configuration"
    cat .env | grep VITE_
fi

echo "Domain configuration completed!"
echo "Your Twitter clone is now available at: http://my-twitter.duckdns.org"
EOF

echo "Domain setup script completed!"
echo "Your application will be available at: http://my-twitter.duckdns.org"