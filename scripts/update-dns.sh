#!/bin/bash

# DuckDNS 自动更新脚本
# 将这个脚本设置为 cron job，定期运行

# 配置信息
DOMAIN="my-twitter"  # 替换为你的 DuckDNS 域名前缀
TOKEN="83068ad7-e74e-40b1-83c2-5fb36752e89b"  # 替换为你的 DuckDNS token
CURRENT_IP="120.79.174.9"  # 你的阿里云公网IP

# DuckDNS API URL
URL="https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${CURRENT_IP}"

# 更新域名解析
echo "Updating DuckDNS..."
response=$(curl -s "$URL")

if [ "$response" = "OK" ]; then
    echo "Successfully updated ${DOMAIN}.duckdns.org -> ${CURRENT_IP}"
    echo "$(date): DNS update successful" >> /var/log/duckdns.log
else
    echo "Failed to update DNS. Response: $response"
    echo "$(date): DNS update failed - $response" >> /var/log/duckdns.log
fi