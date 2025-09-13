# VibeDoge MCP Server

A comprehensive Model Context Protocol (MCP) server for VibeDoge lottery system integration with advanced user management, session handling, and security features.

## 功能特性

### 核心工具

1. **upload_user_profile** - 用户档案上传
   - 支持头像上传和个人信息管理
   - 自动处理文件格式验证
   - Bearer Token 认证

2. **participate_lottery** - 参与抽奖
   - 支持多种抽奖活动参与
   - 实时参与状态反馈
   - 参与记录自动保存

3. **get_lottery_result** - 获取抽奖结果
   - 查询指定活动的抽奖结果
   - 支持详细结果信息
   - 实时状态更新

4. **get_user_history** - 用户历史记录
   - 查询用户参与历史
   - 支持分页和排序
   - 详细参与统计

5. **list_lottery_activities** - 活动列表
   - 获取可用抽奖活动
   - 支持状态筛选
   - 活动详情展示

6. **get_lottery_stats** - 统计信息
   - 抽奖活动统计数据
   - 参与者和获奖者统计
   - 奖品价值统计

## 安装和使用

### 环境要求

- Node.js 18+ 
- npm 或 pnpm
- TypeScript 支持

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 构建项目

```bash
# 构建 TypeScript 代码
pnpm run build

# 或使用 npm
npm run build
```

### 启动服务器

#### 生产环境

```bash
# 使用启动脚本
./start.sh

# 或直接运行
node dist/index.js
```

#### 开发环境

```bash
# 使用开发启动脚本
./start-dev.sh

# 或使用 ts-node
npx ts-node src/index.ts
```

### 环境变量配置

创建 `.env` 文件或设置以下环境变量：

```bash
# API 服务器地址
VIBE_CODING_API_URL=https://api.vibedoge.com

# 运行环境
NODE_ENV=production

# 日志级别
LOG_LEVEL=info
```

## MCP 客户端集成

### 配置示例

在 MCP 客户端中添加服务器配置：

```json
{
  "mcpServers": {
    "vibe-coding-lottery": {
      "command": "node",
      "args": ["/path/to/vibedoge mcp/dist/index.js"],
      "env": {
        "VIBE_CODING_API_URL": "https://api.vibedoge.com"
      }
    }
  }
}
```

### 工具使用示例

```javascript
// 上传用户档案
const profileResult = await mcpClient.callTool('upload_user_profile', {
  userId: 'user123',
  avatar: 'base64_image_data',
  nickname: '用户昵称',
  bearerToken: 'your_auth_token'
});

// 参与抽奖
const participateResult = await mcpClient.callTool('participate_lottery', {
  activityId: 'lottery_001',
  userId: 'user123',
  bearerToken: 'your_auth_token'
});

// 获取抽奖结果
const resultData = await mcpClient.callTool('get_lottery_result', {
  activityId: 'lottery_001',
  bearerToken: 'your_auth_token'
});
```

## API 接口说明

### 认证方式

所有 API 请求都需要 Bearer Token 认证：

```
Authorization: Bearer <your_token>
```

### 响应格式

所有 API 响应都遵循统一格式：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  }
}
```

### 错误处理

错误响应格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  }
}
```

## 开发指南

### 项目结构

```
src/
├── index.ts              # MCP 服务器主入口
├── types/                # TypeScript 类型定义
│   └── index.ts
├── services/             # 服务层
│   └── api-client.ts     # API 客户端
└── tools/                # MCP 工具实现
    ├── upload-user-profile.ts
    ├── participate-lottery.ts
    ├── get-lottery-result.ts
    ├── get-user-history.ts
    ├── list-lottery-activities.ts
    ├── get-lottery-stats.ts
    └── index.ts
```

### 添加新工具

1. 在 `src/tools/` 目录下创建新的工具文件
2. 实现 `MCPTool` 接口
3. 在 `src/tools/index.ts` 中导出新工具
4. 在 `src/index.ts` 中注册新工具

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 所有公共方法需要 JSDoc 注释
- 错误处理要完整和一致

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！