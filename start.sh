#!/bin/bash

# Vibe Coding Lottery MCP Server Startup Script

set -e

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "Building the project..."
    npm run build
fi

# 设置环境变量
export NODE_ENV=${NODE_ENV:-production}
export VIBE_CODING_API_URL=${VIBE_CODING_API_URL:-https://api.vibedoge.com}
export LOG_LEVEL=${LOG_LEVEL:-info}

echo "Starting Vibe Coding Lottery MCP Server..."
echo "Environment: $NODE_ENV"
echo "API URL: $VIBE_CODING_API_URL"
echo "Log Level: $LOG_LEVEL"
echo ""

# 启动服务器
node dist/index.js