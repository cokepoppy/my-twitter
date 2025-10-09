#!/usr/bin/env python3
"""
Idempotent remote provisioning for coke-twitter.com

Usage:
  python3 scripts/provision_remote.py \
    --host 107.174.39.191 \
    --user root \
    --password '<PASSWORD>' \
    --domain coke-twitter.com \
    [--email admin@coke-twitter.com]

This script:
- Installs Docker (get.docker.com) and docker compose
- Installs git, nginx, certbot (nginx plugin)
- Clones or updates repo at /opt/my-twitter
- Writes frontend .env with VITE_API_URL/SOCKET_URL for the domain
- Creates .env at repo root for compose variables (JWT_SECRET, FRONTEND_URLS)
- Starts stack with `docker compose up -d --build`
- Configures Nginx reverse proxy for frontend (/ -> 127.0.0.1:3000) and API (/api, /socket.io -> 127.0.0.1:8000)
- Attempts to issue/renew SSL via certbot (if DNS ready)

No secrets are stored in the repo; all credentials are passed on CLI.
"""

import argparse
import hashlib
import os
import random
import socket
import string
import sys
import time

try:
    import paramiko
except ImportError:
    print("Missing dependency 'paramiko'. Install with: python3 -m pip install --user paramiko", file=sys.stderr)
    sys.exit(2)


def gen_secret(n: int = 48) -> str:
    # Generate a reasonably strong JWT secret
    alphabet = string.ascii_letters + string.digits
    rnd = random.SystemRandom()
    return ''.join(rnd.choice(alphabet) for _ in range(n))


def ssh_connect(host: str, user: str, password: str, port: int = 22) -> paramiko.SSHClient:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=host, username=user, password=password, port=port, timeout=20)
    return client


def run(c: paramiko.SSHClient, cmd: str, sudo: bool = False, check: bool = True) -> tuple[int, str, str]:
    # All commands run as root by default; sudo param kept for clarity
    final = cmd
    stdin, stdout, stderr = c.exec_command(final)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    if check and code != 0:
        raise RuntimeError(f"Command failed ({code}): {cmd}\nERR: {err}\nOUT: {out}")
    return code, out, err


def put(c: paramiko.SSHClient, data: str, remote_path: str, mode: int = 0o644):
    sftp = c.open_sftp()
    tmp_path = f"{remote_path}.tmp-{int(time.time())}"
    with sftp.file(tmp_path, 'w') as f:
        f.write(data)
    sftp.chmod(tmp_path, mode)
    # atomic move
    try:
        sftp.posix_rename(tmp_path, remote_path)
    except IOError:
        # fallback
        sftp.remove(remote_path)
        sftp.posix_rename(tmp_path, remote_path)
    sftp.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', required=True)
    ap.add_argument('--user', default='root')
    ap.add_argument('--password', required=True)
    ap.add_argument('--domain', required=True)
    ap.add_argument('--email', default='admin@localhost')
    ap.add_argument('--repo', default='https://github.com/cokepoppy/my-twitter.git')
    ap.add_argument('--path', default='/opt/my-twitter')
    args = ap.parse_args()

    domain = args.domain.strip()
    host = args.host.strip()
    user = args.user.strip()
    password = args.password
    project_dir = args.path
    # Local repo root (to source Dockerfiles)
    local_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    print(f"Connecting to {user}@{host}...")
    c = ssh_connect(host, user, password)
    print("Connected.")

    # Detect OS and setup packages
    _, osrel, _ = run(c, "cat /etc/os-release || true", check=False)
    is_debian = 'ID=debian' in osrel or 'ID=ubuntu' in osrel
    is_rhel = any(x in osrel for x in ['ID=fedora', 'ID="centos"', 'ID=almalinux', 'ID=rocky'])

    print("Updating system packages...")
    if is_debian:
        run(c, "apt-get update -y || true", check=False)
        # Install base deps; tolerate failures gracefully
        run(c, "DEBIAN_FRONTEND=noninteractive apt-get install -y git curl nginx certbot python3-certbot-nginx || true", check=False)
    elif is_rhel:
        run(c, "yum -y install epel-release || dnf -y install epel-release || true", check=False)
        run(c, "yum -y install git curl nginx certbot python3-certbot-nginx || dnf -y install git curl nginx certbot python3-certbot-nginx || true", check=False)
    else:
        # Fallback: try common managers
        run(c, "(apt-get update && apt-get install -y git curl nginx certbot python3-certbot-nginx) || (yum -y install git curl nginx certbot python3-certbot-nginx) || true", check=False)

    print("Installing Docker (get.docker.com)...")
    run(c, "curl -fsSL https://get.docker.com | sh")
    run(c, "systemctl enable docker || true")
    run(c, "systemctl start docker || true")

    # Ensure compose exists (plugin or standalone)
    code, _, _ = run(c, "docker compose version >/dev/null 2>&1", check=False)
    if code != 0:
        # Try to install compose plugin via package manager
        if is_debian:
            run(c, "apt-get install -y docker-compose-plugin || true", check=False)
        elif is_rhel:
            run(c, "yum -y install docker-compose-plugin || dnf -y install docker-compose-plugin || true", check=False)
        # Fallback to static binary
        code2, _, _ = run(c, "docker compose version >/dev/null 2>&1", check=False)
        if code2 != 0:
            run(c, "curl -L 'https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose")

    print(f"Preparing project directory at {project_dir}...")
    run(c, f"mkdir -p {project_dir}")
    # Clone or update
    code, _, _ = run(c, f"test -d {project_dir}/.git", check=False)
    if code == 0:
        print("Repo exists, pulling latest...")
        run(c, f"cd {project_dir} && git fetch --all && git reset --hard origin/main || git pull --rebase", check=False)
    else:
        print("Cloning repo...")
        # If directory exists but is not a git repo, recreate it
        code2, _, _ = run(c, f"test -d {project_dir}", check=False)
        if code2 == 0:
            run(c, f"rm -rf {project_dir}")
            run(c, f"mkdir -p {project_dir}")
        run(c, f"git clone {args.repo} {project_dir}")

    # Configure envs
    print("Configuring environment files...")
    # Root .env for docker-compose variable substitution
    jwt_secret = gen_secret()
    env_root = f"""# Auto-generated by provisioner
JWT_SECRET={jwt_secret}
FRONTEND_URLS=https://{domain},http://{domain}
"""
    put(c, env_root, f"{project_dir}/.env", mode=0o600)

    # Frontend .env for Vite build
    env_fe = f"""VITE_API_URL=https://{domain}
VITE_SOCKET_URL=https://{domain}
VITE_BASE_URL=/
"""
    put(c, env_fe, f"{project_dir}/frontend/.env", mode=0o644)

    # Ensure Dockerfiles exist on remote; upload from local if missing
    def upload_if_missing(local_path: str, remote_path: str):
        code, _, _ = run(c, f"test -f {remote_path}", check=False)
        if code != 0:
            try:
                with open(local_path, 'r', encoding='utf-8') as f:
                    put(c, f.read(), remote_path, mode=0o644)
                print(f"Uploaded {remote_path} from {local_path}")
            except FileNotFoundError:
                print(f"Warning: local file not found, skipping upload: {local_path}")

    upload_if_missing(os.path.join(local_root, 'backend', 'Dockerfile'), f"{project_dir}/backend/Dockerfile")
    upload_if_missing(os.path.join(local_root, 'frontend', 'Dockerfile'), f"{project_dir}/frontend/Dockerfile")

    # Generate a compose file (without containerized nginx; we use host nginx)
    compose_yml = f"""
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: twitter-mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: twitter
      MYSQL_USER: twitter_user
      MYSQL_PASSWORD: twitter_password
    # Internal only; no host port published
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - twitter-network

  redis:
    image: redis:7-alpine
    container_name: twitter-redis
    # Internal only; no host port published
    volumes:
      - redis_data:/data
    networks:
      - twitter-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: twitter-backend
    ports:
      - '8000:8000'
    environment:
      NODE_ENV: production
      PORT: 8000
      DATABASE_URL: mysql://twitter_user:twitter_password@mysql:3306/twitter
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${{JWT_SECRET}}
      FRONTEND_URLS: ${{FRONTEND_URLS}}
    volumes:
      - ./backend/uploads:/app/uploads
    depends_on:
      - mysql
      - redis
    networks:
      - twitter-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: twitter-frontend
    ports:
      - '3000:3000'
    environment:
      VITE_API_URL: https://{domain}
    depends_on:
      - backend
    networks:
      - twitter-network

volumes:
  mysql_data:
  redis_data:

networks:
  twitter-network:
    driver: bridge
"""
    put(c, compose_yml, f"{project_dir}/docker-compose.yml", mode=0o644)

    # Nginx config for reverse proxy
    nginx_conf = f"""
server {{
    listen 80;
    server_name {domain} www.{domain};

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend (static)
    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    # API
    location /api {{
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
    }}

    # WebSocket
    location /socket.io {{
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    location /uploads {{
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    location /health {{
        access_log off;
        return 200 'healthy\n';
        add_header Content-Type text/plain;
    }}
}}
"""
    # Place into conf.d (works in both Debian and RHEL flavors)
    put(c, nginx_conf, f"/etc/nginx/conf.d/{domain}.conf", mode=0o644)
    # Remove default site if present
    run(c, "rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true", check=False)
    run(c, "nginx -t && systemctl enable nginx && systemctl restart nginx")

    # Start Docker stack
    print("Building and starting Docker services...")
    # Prefer 'docker compose', fallback to 'docker-compose'
    code, _, _ = run(c, "docker compose version >/dev/null 2>&1", check=False)
    compose_cmd = "docker compose" if code == 0 else "docker-compose"
    # Explicitly pass compose file to avoid name detection issues
    run(c, f"cd {project_dir} && {compose_cmd} -f docker-compose.yml up -d --build")
    # Show ps
    _, out, _ = run(c, f"cd {project_dir} && {compose_cmd} -f docker-compose.yml ps")
    print(out)

    # Attempt SSL via certbot (non-interactive). This will succeed only if DNS is pointed.
    print("Attempting to obtain SSL certificate via certbot...")
    email = args.email
    code, out, err = run(
        c,
        f"certbot --nginx --agree-tos --no-eff-email -m {email} -d {domain} -d www.{domain} --redirect",
        check=False,
    )
    if code == 0:
        print("SSL certificate installed and HTTPS enabled.")
    else:
        print("Certbot did not complete (likely DNS not ready). You can rerun later:")
        print(f"  certbot --nginx -d {domain} -d www.{domain} -m {email} --agree-tos --redirect")

    print("Provisioning complete. Visit: http://" + domain)


if __name__ == '__main__':
    main()
