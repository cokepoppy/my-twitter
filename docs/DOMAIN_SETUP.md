# 免费域名配置指南

## 方案一：DuckDNS (推荐)

### 1. 注册 DuckDNS 账户
- 访问：https://www.duckdns.org
- 使用 Google/GitHub 账户登录
- 获取免费的子域名

### 2. 配置域名
- 在 DuckDNS 控制台添加子域名
- 获取你的 Token

### 3. 服务器端配置
```bash
# 上传更新脚本到服务器
scp /mnt/d/home/my-twitter/scripts/update-dns.sh root@120.79.174.9:/root/

# SSH 登录服务器
ssh root@120.79.174.9

# 设置定时任务
crontab -e
# 添加以下内容（每小时更新一次）：
0 * * * * /root/update-dns.sh
```

### 4. 更新 Nginx 配置
```nginx
# /etc/nginx/conf.d/my-twitter.conf
server {
    listen 80;
    server_name your-name.duckdns.org www.your-name.duckdns.org;

    root /root/my-twitter/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 方案二：Cloudflare + 便宜域名

### 1. 购买便宜域名
- 推荐注册商：Porkbun, NameSilo
- 域名后缀：.xyz, .tk, .ml, .ga, .cf (约 $1-2/年)

### 2. 使用 Cloudflare DNS
- 将域名服务器指向 Cloudflare
- 在 Cloudflare 添加 A 记录指向 120.79.174.9

### 3. 配置 Cloudflare
- 启用 CDN 和 HTTPS
- 设置 SSL/TLS 加密模式

## 方案三：FreeDNS

### 1. 注册 FreeDNS
- 访问：https://freedns.afraid.org/
- 注册账户并验证邮箱

### 2. 配置子域名
- 在控制台添加子域名
- 设置 A 记录指向 120.79.174.9

## 测试域名解析

```bash
# 测试 DNS 解析
nslookup your-name.duckdns.org
# 或
dig your-name.duckdns.org
```

## 更新应用配置

```bash
# 更新前端配置
# frontend/.env
VITE_API_URL=http://your-name.duckdns.org/api
VITE_SOCKET_URL=http://your-name.duckdns.org

# 更新后端配置
# backend/.env
FRONTEND_URL=http://your-name.duckdns.org
```

## 监控和维护

```bash
# 查看更新日志
tail -f /var/log/duckdns.log

# 手动测试更新脚本
/root/update-dns.sh
```

## 推荐顺序

1. **先试用 DuckDNS** - 完全免费，测试功能
2. **如果需要更好的体验** - 购买便宜域名 + Cloudflare
3. **长期使用** - 考虑购买正式域名