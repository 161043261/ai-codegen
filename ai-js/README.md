## 启动步骤

```bash
# 1. 初始化数据库
mysql -u root -p < sql/create_table.sql

# 2. 安装依赖
cd ai-js
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库密码等

# 4. 安装 Ollama 模型 (可选)
ollama pull qwen2.5-coder:7b

# 5. 启动
pnpm start:dev
```
