# GitHub 推送指南

## 当前状态
- ✅ 本地代码已准备好
- ✅ 远程仓库已添加：`https://github.com/cokepoppy/my-twitter.git`
- ❌ 需要配置GitHub认证

## 推送方法

### 方法1：使用Personal Access Token (推荐)

1. **创建GitHub Personal Access Token**:
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 选择以下权限：
     - `repo` (完整仓库访问)
     - `workflow` (工作流访问)
   - 生成token并复制保存

2. **配置Git使用Token**:
   ```bash
   # 移除当前的HTTPS远程仓库
   git remote remove origin

   # 添加包含token的远程仓库URL
   git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/cokepoppy/my-twitter.git

   # 推送代码
   git push -u origin master
   ```

### 方法2：使用SSH密钥

1. **创建SSH密钥**:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 或使用RSA: ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. **添加SSH密钥到ssh-agent**:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **添加公钥到GitHub**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   复制输出的公钥，到GitHub Settings → SSH and GPG keys → New SSH key

4. **修改远程仓库为SSH**:
   ```bash
   git remote set-url origin git@github.com:cokepoppy/my-twitter.git
   git push -u origin master
   ```

### 方法3：使用GitHub CLI

1. **安装GitHub CLI**:
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install gh

   # CentOS/RHEL
   sudo dnf install gh
   ```

2. **登录GitHub**:
   ```bash
   gh auth login
   ```

3. **推送代码**:
   ```bash
   git push -u origin master
   ```

## 当前分支信息
- 分支: master
- 提交历史: 包含后端完整代码
- 状态: 准备推送

## 推送后
- 代码将在 https://github.com/cokepoppy/my-twitter.git 可见
- 可以在服务器上克隆部署