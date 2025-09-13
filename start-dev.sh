#!/bin/bash

# Vibe Coding Lottery MCP Server Development Startup Script

set -e

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 检查ts-node是否安装
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not available. Please install Node.js properly."
    exit 1
fi

# 设置开发环境变量
export NODE_ENV=development
export VIBE_CODING_API_URL=${VIBE_CODING_API_URL:-https://api.vibedoge.com}
export LOG_LEVEL=${LOG_LEVEL:-debug}

echo "Starting Vibe Coding Lottery MCP Server in Development Mode..."
echo "Environment: $NODE_ENV"
echo "API URL: $VIBE_CODING_API_URL"
echo "Log Level: $LOG_LEVEL"
echo ""

# 使用ts-node直接运行TypeScript代码
npx ts-node src/index.ts