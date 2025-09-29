# 服务器域名配置指南

## 当前状态
✅ DNS解析已生效：my-twitter.duckdns.org -> 120.79.174.9
✅ DuckDNS配置已完成
⚠️ 需要手动在服务器上完成Nginx配置

## 手动配置步骤

### 1. 登录服务器
```bash
# 使用密码登录（SSH密钥配置有问题）
ssh root@120.79.174.9
```

### 2. 创建DNS更新脚本
在服务器上创建 `/root/update-dns.sh`：
```bash
#!/bin/bash

# DuckDNS 自动更新脚本
DOMAIN="my-twitter"
TOKEN="83068ad7-e74e-40b1-83c2-5fb36752e89b"
CURRENT_IP="120.79.174.9"

URL="https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${CURRENT_IP}"

# 创建日志目录
mkdir -p /var/log

# 更新域名解析
response=$(curl -s "$URL")

if [ "$response" = "OK" ]; then
    echo "$(date): Successfully updated ${DOMAIN}.duckdns.org -> ${CURRENT_IP}" >> /var/log/duckdns.log
else
    echo "$(date): Failed to update DNS. Response: $response" >> /var/log/duckdns.log
fi
```

### 3. 设置脚本权限
```bash
chmod +x /root/update-dns.sh
```

### 4. 测试脚本
```bash
/root/update-dns.sh
cat /var/log/duckdns.log
```

### 5. 设置定时任务
```bash
crontab -e
# 添加以下行（每小时更新一次）：
0 * * * * /root/update-dns.sh
```

### 6. 更新Nginx配置
编辑 `/etc/nginx/conf.d/my-twitter.conf`：
```nginx
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
```

### 7. 重启Nginx
```bash
systemctl restart nginx
```

### 8. 更新应用配置（可选）

**后端配置** (`/root/my-twitter/backend/.env`):
```env
# 添加或更新
FRONTEND_URL=http://my-twitter.duckdns.org
```

**前端配置** (`/root/my-twitter/frontend/.env`):
```env
# 添加或更新
VITE_API_URL=http://my-twitter.duckdns.org/api
VITE_SOCKET_URL=http://my-twitter.duckdns.org
```

### 9. 验证配置
```bash
# 检查Nginx状态
systemctl status nginx

# 检查配置语法
nginx -t

# 查看访问日志
tail -f /var/log/nginx/access.log
```

## 测试访问

现在你可以通过以下地址访问你的应用：
- **主页**: http://my-twitter.duckdns.org
- **API**: http://my-twitter.duckdns.org/api

## 维护命令

```bash
# 查看DNS更新日志
tail -f /var/log/duckdns.log

# 手动更新DNS
/root/update-dns.sh

# 重启Nginx
systemctl restart nginx

# 查看系统状态
systemctl status nginx
```