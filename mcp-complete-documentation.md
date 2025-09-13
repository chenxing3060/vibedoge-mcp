# VibeDoge MCP服务完整文档

## 目录

1. [项目概述](#1-项目概述)
2. [产品需求文档](#2-产品需求文档)
3. [技术架构设计](#3-技术架构设计)
4. [API接口规范](#4-api接口规范)
5. [开发指南](#5-开发指南)
6. [Vibe Coding抽奖系统集成](#6-vibe-coding抽奖系统集成)
7. [部署说明](#7-部署说明)

---

## 1. 项目概述

### 1.1 项目定位

VibeDoge MCP (Model Context Protocol) 服务是一个创新的用户身份管理和上下文协议服务，专为VibeDoge交易所Demo版设计。该服务采用轻量级架构，提供免注册的流畅用户体验，同时集成Vibe Coding抽奖系统，为用户提供丰富的互动功能。

### 1.2 核心特性

- **免注册体验**: 自动生成用户ID，无需复杂注册流程
- **会话持久化**: 智能会话管理，支持跨设备同步
- **轻量级设计**: 最小化资源占用，快速响应
- **抽奖系统集成**: 完整的Vibe Coding抽奖功能
- **本地优先**: 支持本地存储，离线可用
- **跨平台兼容**: 支持Web、移动端等多平台

### 1.3 技术栈

**前端技术：**
- React 18+ with TypeScript
- Vite (构建工具)
- Tailwind CSS (样式框架)
- LocalStorage (本地存储)
- Fetch API (HTTP请求)

**后端技术：**
- Node.js >= 18.0.0
- Express (Web框架)
- TypeScript >= 5.0.0
- UUID (唯一标识符生成)
- JWT (会话令牌)
- Redis (缓存，可选)
- PostgreSQL (数据持久化，可选)

**开发工具：**
- pnpm (包管理器)
- ESLint (代码质量)
- Jest (单元测试)
- Docker (容器化)
- PM2 (进程管理)

---

## 2. 产品需求文档

### 2.1 产品概述

**项目名称**: VibeDoge MCP服务  
**项目类型**: 用户身份管理和上下文协议服务  
**目标用户**: VibeDoge交易所用户、Vibe Coding社区成员  
**核心价值**: 提供无缝的用户体验和丰富的社区互动功能

### 2.2 核心功能模块

#### 2.2.1 用户身份管理
- **自动用户生成**: 无需注册，自动创建用户身份
- **会话管理**: 智能会话维护和恢复
- **身份验证**: 基于令牌的安全验证
- **用户资料**: 支持个人信息和偏好设置

#### 2.2.2 MCP协议支持
- **上下文管理**: 维护用户交互上下文
- **工具集成**: 支持多种MCP工具
- **资源管理**: 统一资源访问接口
- **提示管理**: 智能提示和建议系统

#### 2.2.3 Vibe Coding抽奖系统
- **用户资料管理**: 6类用户资料上传和管理
- **智能抽奖算法**: 基于用户活跃度的权重计算
- **多样化抽奖**: 普通抽奖、技能挑战、创意比赛
- **实时统计**: 参与数据和中奖概率统计
- **防作弊机制**: 数据验证和质量评分

### 2.3 用户角色定义

#### 2.3.1 普通用户
- 自动获得用户身份
- 参与抽奖活动
- 管理个人资料
- 查看活动历史

#### 2.3.2 活跃用户
- 完善个人资料获得更高权重
- 参与技能挑战
- 贡献社区内容
- 享受优先权益

#### 2.3.3 开发者用户
- 集成MCP协议
- 使用开发工具
- 访问API接口
- 参与技术社区

### 2.4 核心业务流程

#### 2.4.1 用户首次访问流程
1. **自动识别**: 检测新用户访问
2. **生成身份**: 自动创建用户ID和会话
3. **本地存储**: 保存用户信息到本地
4. **引导体验**: 展示核心功能和抽奖活动

#### 2.4.2 抽奖参与流程
1. **资料完善**: 用户上传个人资料
2. **权重计算**: 系统计算用户权重
3. **参与抽奖**: 选择抽奖类型并参与
4. **结果查询**: 查看抽奖结果和历史

#### 2.4.3 会话恢复流程
1. **本地检测**: 检查本地存储的会话信息
2. **会话验证**: 验证会话有效性
3. **数据同步**: 同步最新用户数据
4. **状态恢复**: 恢复用户操作状态

---

## 3. 技术架构设计

### 3.1 整体架构

```mermaid
graph TD
    A[前端应用] --> B[MCP客户端SDK]
    B --> C[MCP服务API]
    C --> D[用户身份管理]
    C --> E[会话管理]
    C --> F[抽奖系统]
    C --> G[本地存储]
    
    subgraph "前端层"
        A
        B
    end
    
    subgraph "MCP服务层"
        C
        D
        E
        F
    end
    
    subgraph "存储层"
        G
        H[Redis缓存]
        I[PostgreSQL]
    end
    
    C --> H
    C --> I
```

### 3.2 服务分层架构

| 层级 | 组件 | 职责 |
|------|------|------|
| 接入层 | MCP客户端SDK | 前端集成、API调用、本地存储管理 |
| 服务层 | MCP服务API | 用户管理、会话控制、抽奖逻辑 |
| 业务层 | 核心服务 | 身份验证、权重计算、数据处理 |
| 数据层 | 存储服务 | 用户数据持久化、会话缓存 |

### 3.3 核心组件设计

#### 3.3.1 MCP客户端SDK
```typescript
class MCPService {
  // 用户管理
  generateUserId(): string
  createUser(): Promise<MCPUser>
  updateUserProfile(profile: UserProfile): Promise<void>
  
  // 会话管理
  restoreFromStorage(): MCPUser | null
  heartbeat(): void
  clearSession(): void
  
  // 抽奖功能
  uploadUserProfile(profile: LotteryProfile): Promise<void>
  participateInLottery(lotteryId: string): Promise<ParticipationResult>
  getLotteryResults(lotteryId: string): Promise<LotteryResult>
  
  // 存储管理
  private saveToStorage(user: MCPUser): void
  private loadFromStorage(): MCPUser | null
}
```

#### 3.3.2 数据模型定义
```typescript
// 用户模型
interface MCPUser {
  id: string;           // 用户唯一标识
  createdAt: string;    // 创建时间
  lastActiveAt: string; // 最后活跃时间
  sessionToken: string; // 会话令牌
  profile?: UserProfile; // 用户资料
}

// 用户资料模型
interface UserProfile {
  nickname?: string;
  avatar?: string;
  preferences: Record<string, any>;
  lotteryProfile?: LotteryProfile;
}

// 抽奖资料模型
interface LotteryProfile {
  basicInfo: BasicInfo;
  skillInfo: SkillInfo;
  socialInfo: SocialInfo;
  interactionInfo: InteractionInfo;
  creativeInfo: CreativeInfo;
  contributionInfo: ContributionInfo;
  learningInfo: LearningInfo;
  investmentInfo: InvestmentInfo;
}
```

### 3.4 安全架构

#### 3.4.1 身份验证
- **JWT令牌**: 基于JSON Web Token的会话管理
- **令牌刷新**: 自动令牌刷新机制
- **权限控制**: 基于角色的访问控制

#### 3.4.2 数据安全
- **数据加密**: 敏感数据加密存储
- **传输安全**: HTTPS加密传输
- **输入验证**: 严格的输入数据验证

#### 3.4.3 防作弊机制
- **重复检测**: 防止重复参与抽奖
- **质量评分**: 用户资料质量评估
- **行为分析**: 异常行为检测

---

## 4. API接口规范

### 4.1 基础信息

- **Base URL**: `http://localhost:3001/api/mcp/v1`
- **协议**: HTTP (本地开发环境)
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API版本**: v1.0.0
- **本地调试端口**: 3001

### 4.2 通用响应格式

```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "timestamp": string,
  "requestId": string
}
```

### 4.3 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": object
  },
  "timestamp": string,
  "requestId": string
}
```

### 4.4 用户管理接口

#### 4.4.1 生成用户ID

**接口信息**
- **URL**: `POST /users/generate`
- **描述**: 为新用户生成唯一标识符和会话令牌
- **认证**: 无需认证

**请求参数**
```json
{
  "deviceInfo": {
    "platform": "web",
    "userAgent": "Mozilla/5.0...",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai"
  },
  "metadata": {
    "source": "vibedoge-demo",
    "version": "1.0.0"
  }
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "mcp_1704067200000_abc123def456",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastActiveAt": "2024-01-01T00:00:00.000Z",
      "sessionToken": "xyz789uvw012pqr345stu678",
      "expiresAt": "2024-01-08T00:00:00.000Z"
    },
    "config": {
      "sessionDuration": 604800,
      "heartbeatInterval": 300,
      "features": ["lottery", "community", "stats"]
    }
  },
  "message": "用户创建成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_abc123def456"
}
```

#### 4.4.2 获取用户信息

**接口信息**
- **URL**: `GET /users/{userId}`
- **描述**: 获取指定用户的详细信息
- **认证**: 需要会话令牌

**请求头**
```
Authorization: Bearer {sessionToken}
X-User-ID: {userId}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "mcp_1704067200000_abc123def456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActiveAt": "2024-01-01T12:30:00.000Z",
    "status": "active",
    "profile": {
      "nickname": "VibeCoder",
      "avatar": "https://cdn.vibedoge.com/avatars/default.jpg",
      "preferences": {
        "language": "zh-CN",
        "theme": "auto"
      }
    },
    "stats": {
      "loginCount": 15,
      "lotteryParticipations": 3,
      "communityPosts": 7
    }
  },
  "message": "获取用户信息成功",
  "timestamp": "2024-01-01T12:30:00.000Z",
  "requestId": "req_def456ghi789"
}
```

### 4.5 会话管理接口

#### 4.5.1 验证会话

**接口信息**
- **URL**: `POST /sessions/validate`
- **描述**: 验证用户会话的有效性
- **认证**: 需要会话令牌

**请求参数**
```json
{
  "userId": "mcp_1704067200000_abc123def456",
  "sessionToken": "xyz789uvw012pqr345stu678"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "refreshed": false
  },
  "message": "会话验证成功",
  "timestamp": "2024-01-01T12:30:00.000Z",
  "requestId": "req_session_validate"
}
```

### 4.6 抽奖系统接口

#### 4.6.1 上传用户抽奖资料

**接口信息**
- **URL**: `POST /lottery/user-profile`
- **描述**: 上传用户Vibe Coding抽奖相关信息
- **认证**: 需要会话令牌

**请求参数**
```json
{
  "userId": "string",
  "basicInfo": {
    "nickname": "string",
    "avatar": "string",
    "bio": "string",
    "location": "string",
    "birthYear": "number",
    "gender": "male|female|other",
    "occupation": "string",
    "interests": ["string"]
  },
  "skillInfo": {
    "programmingLanguages": ["JavaScript", "Python", "Go"],
    "techLevel": "beginner|intermediate|advanced|expert",
    "projectExperience": "string",
    "specialties": ["string"],
    "certifications": ["string"],
    "yearsOfExperience": "number",
    "frameworks": ["string"],
    "tools": ["string"]
  },
  "socialInfo": {
    "githubUrl": "string",
    "portfolioUrl": "string",
    "linkedinUrl": "string",
    "twitterHandle": "string",
    "discordId": "string",
    "telegramHandle": "string",
    "personalWebsite": "string",
    "blogUrl": "string"
  },
  "interactionInfo": {
    "wishContent": "string",
    "shareReason": "string",
    "referralCode": "string",
    "favoriteFeature": "string",
    "improvementSuggestion": "string",
    "communityContribution": "string",
    "helpfulContent": "string",
    "mentorshipOffer": "boolean"
  },
  "creativeInfo": {
    "lotterySlogan": "string",
    "luckyNumber": "number",
    "personalTags": ["string"],
    "motto": "string",
    "favoriteQuote": "string",
    "dreamProject": "string",
    "superpower": "string",
    "timeTravel": "string"
  },
  "contributionInfo": {
    "platformContribution": "number",
    "activityLevel": "low|medium|high",
    "reputationScore": "number",
    "communityRole": "string",
    "helpfulAnswers": "number",
    "tutorialsCreated": "number",
    "bugsReported": "number",
    "featureRequests": "number"
  },
  "learningInfo": {
    "currentLearning": ["string"],
    "completedCourses": ["string"],
    "readingList": ["string"],
    "learningGoals": ["string"],
    "skillsToImprove": ["string"],
    "mentors": ["string"],
    "learningStyle": "string",
    "knowledgeSharing": "boolean"
  },
  "investmentInfo": {
    "riskTolerance": "conservative|moderate|aggressive",
    "investmentExperience": "string",
    "favoriteTokens": ["string"],
    "tradingStrategy": "string",
    "portfolioSize": "small|medium|large",
    "investmentGoals": ["string"],
    "marketAnalysis": "string",
    "defiExperience": "boolean"
  }
}
```

**响应示例**
```json
{
  "success": true,
  "message": "用户信息上传成功",
  "data": {
    "profileId": "string",
    "completeness": "number",
    "bonusWeight": "number"
  }
}
```

#### 4.6.2 参与抽奖

**接口信息**
- **URL**: `POST /lottery/participate`
- **描述**: 用户参与指定Vibe Coding抽奖活动
- **认证**: 需要会话令牌

**请求参数**
```json
{
  "userId": "string",
  "lotteryId": "string",
  "participationType": "normal|skill|creative",
  "additionalData": {
    "skillChallenge": "string",
    "creativeSubmission": "string"
  }
}
```

**响应示例**
```json
{
  "success": true,
  "message": "参与Vibe Coding抽奖成功",
  "data": {
    "participationId": "string",
    "ticketNumber": "string",
    "winningProbability": "number"
  }
}
```

#### 4.6.3 查询抽奖结果

**接口信息**
- **URL**: `GET /lottery/result/{lotteryId}`
- **描述**: 查询指定Vibe Coding抽奖活动的结果
- **认证**: 需要会话令牌

**响应示例**
```json
{
  "success": true,
  "data": {
    "lotteryId": "string",
    "status": "pending|completed|cancelled",
    "winners": [
      {
        "userId": "string",
        "nickname": "string",
        "prize": "string",
        "winningTime": "string"
      }
    ],
    "totalParticipants": "number",
    "drawTime": "string"
  },
  "message": "查询抽奖结果成功",
  "timestamp": "2024-01-01T12:30:00.000Z",
  "requestId": "req_lottery_result"
}
```

---

## 5. 开发指南

### 5.1 开发环境配置

#### 5.1.1 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- TypeScript >= 5.0.0
- Git

#### 5.1.2 项目初始化
```bash
# 创建MCP服务项目
mkdir mcp-service
cd mcp-service

# 初始化项目
pnpm init

# 安装核心依赖
pnpm add express cors helmet morgan compression
pnpm add -D typescript @types/node @types/express ts-node nodemon

# 安装MCP相关依赖
pnpm add @modelcontextprotocol/sdk
pnpm add uuid jsonwebtoken bcryptjs
pnpm add -D @types/uuid @types/jsonwebtoken @types/bcryptjs

# 启动本地开发服务器
pnpm dev
```

#### 5.1.3 本地开发环境配置
创建 `.env.local` 文件：
```env
# 服务器配置
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# 数据库配置（可选）
DATABASE_URL=postgresql://localhost:5432/mcp_dev
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-local-jwt-secret-key
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:5173
```

#### 5.1.4 快速启动脚本
```bash
# 1. 克隆项目并安装依赖
git clone <your-mcp-service-repo>
cd mcp-service
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，设置本地配置

# 3. 启动本地开发服务器
pnpm dev

# 4. 验证服务启动
curl http://localhost:3001/health

# 5. 测试API接口
curl -X POST http://localhost:3001/api/mcp/v1/users/generate
```

### 5.2 项目结构

```
mcp-service/
├── src/
│   ├── controllers/          # 控制器层
│   │   ├── userController.ts
│   │   ├── sessionController.ts
│   │   ├── lotteryController.ts
│   │   └── mcpController.ts
│   ├── services/            # 业务逻辑层
│   │   ├── userService.ts
│   │   ├── sessionService.ts
│   │   ├── lotteryService.ts
│   │   └── mcpService.ts
│   ├── models/              # 数据模型
│   │   ├── User.ts
│   │   ├── Session.ts
│   │   ├── LotteryProfile.ts
│   │   └── MCPContext.ts
│   ├── middleware/          # 中间件
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── rateLimit.ts
│   ├── routes/              # 路由定义
│   │   ├── users.ts
│   │   ├── sessions.ts
│   │   ├── lottery.ts
│   │   └── mcp.ts
│   ├── utils/               # 工具函数
│   │   ├── crypto.ts
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   └── weightCalculator.ts
│   ├── config/              # 配置文件
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── app.ts
│   ├── types/               # 类型定义
│   │   ├── api.ts
│   │   ├── mcp.ts
│   │   ├── lottery.ts
│   │   └── common.ts
│   └── app.ts               # 应用入口
├── tests/                   # 测试文件
├── docs/                    # 文档
├── docker/                  # Docker配置
├── scripts/                 # 构建脚本
├── .env.example             # 环境变量示例
├── .env.local               # 本地开发环境变量
├── package.json
├── tsconfig.json
└── README.md
```

### 5.3 核心开发指南

#### 5.3.1 用户管理服务开发

```typescript
// src/models/User.ts
export interface User {
    id: string;
    email?: string;
    username?: string;
    profile: {
        displayName: string;
        avatar?: string;
        preferences: Record<string, any>;
    };
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        lastActiveAt: Date;
        isActive: boolean;
    };
    mcpContext?: MCPContext;
    lotteryProfile?: LotteryProfile;
}

export interface MCPContext {
    capabilities: string[];
    tools: string[];
    resources: string[];
    prompts: string[];
    settings: Record<string, any>;
}
```

#### 5.3.2 抽奖权重计算算法

```typescript
// src/utils/weightCalculator.ts
export class WeightCalculator {
    static calculateUserWeight(profile: LotteryProfile): number {
        let weight = 1.0; // 基础权重
        
        // 基础信息权重 (10%)
        weight += this.calculateBasicInfoWeight(profile.basicInfo) * 0.1;
        
        // 技能信息权重 (25%)
        weight += this.calculateSkillInfoWeight(profile.skillInfo) * 0.25;
        
        // 社交信息权重 (15%)
        weight += this.calculateSocialInfoWeight(profile.socialInfo) * 0.15;
        
        // 互动信息权重 (20%)
        weight += this.calculateInteractionInfoWeight(profile.interactionInfo) * 0.2;
        
        // 创意信息权重 (10%)
        weight += this.calculateCreativeInfoWeight(profile.creativeInfo) * 0.1;
        
        // 贡献信息权重 (15%)
        weight += this.calculateContributionInfoWeight(profile.contributionInfo) * 0.15;
        
        // 学习信息权重 (5%)
        weight += this.calculateLearningInfoWeight(profile.learningInfo) * 0.05;
        
        return Math.min(weight, 5.0); // 最大权重限制为5倍
    }
    
    private static calculateBasicInfoWeight(basicInfo: BasicInfo): number {
        let score = 0;
        if (basicInfo.nickname) score += 0.2;
        if (basicInfo.bio) score += 0.3;
        if (basicInfo.location) score += 0.1;
        if (basicInfo.occupation) score += 0.2;
        if (basicInfo.interests?.length > 0) score += 0.2;
        return score;
    }
    
    // 其他权重计算方法...
}
```

#### 5.3.3 防作弊机制实现

```typescript
// src/services/antiCheatService.ts
export class AntiCheatService {
    static async validateUserProfile(profile: LotteryProfile): Promise<ValidationResult> {
        const issues: string[] = [];
        
        // 检查数据完整性
        if (!this.validateDataIntegrity(profile)) {
            issues.push('数据完整性验证失败');
        }
        
        // 检查内容质量
        if (!this.validateContentQuality(profile)) {
            issues.push('内容质量不符合要求');
        }
        
        // 检查重复提交
        if (await this.checkDuplicateSubmission(profile)) {
            issues.push('检测到重复提交');
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            qualityScore: this.calculateQualityScore(profile)
        };
    }
    
    private static validateDataIntegrity(profile: LotteryProfile): boolean {
        // 验证必填字段
        // 验证数据格式
        // 验证数据范围
        return true;
    }
    
    private static validateContentQuality(profile: LotteryProfile): boolean {
        // 检查文本长度
        // 检查内容原创性
        // 检查垃圾信息
        return true;
    }
    
    private static async checkDuplicateSubmission(profile: LotteryProfile): Promise<boolean> {
        // 检查相似内容
        // 检查提交频率
        // 检查设备指纹
        return false;
    }
}
```

### 5.4 测试指南

#### 5.4.1 单元测试
```typescript
// tests/services/userService.test.ts
import { UserService } from '../../src/services/userService';

describe('UserService', () => {
    describe('generateUserId', () => {
        it('should generate unique user ID with correct format', () => {
            const userId = UserService.generateUserId();
            expect(userId).toMatch(/^mcp_\d+_[a-z0-9]+$/);
        });
        
        it('should generate different IDs for multiple calls', () => {
            const id1 = UserService.generateUserId();
            const id2 = UserService.generateUserId();
            expect(id1).not.toBe(id2);
        });
    });
});
```

#### 5.4.2 集成测试
```typescript
// tests/integration/api.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('MCP API Integration Tests', () => {
    describe('POST /api/mcp/v1/users/generate', () => {
        it('should create new user successfully', async () => {
            const response = await request(app)
                .post('/api/mcp/v1/users/generate')
                .send({
                    deviceInfo: {
                        platform: 'web',
                        language: 'zh-CN'
                    }
                });
                
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.id).toMatch(/^mcp_\d+_[a-z0-9]+$/);
        });
    });
});
```

---

## 6. Vibe Coding抽奖系统集成

### 6.1 系统概述

Vibe Coding抽奖系统是MCP服务的核心功能模块，提供完整的用户参与、信息上传、抽奖执行和结果查询功能。系统支持多种抽奖类型，通过智能权重算法提高用户参与度。

### 6.2 核心功能

- **用户资料管理**: 支持8类用户资料上传（基础信息、技能展示、社交互动、创意个性、平台贡献、学习成长、投资偏好等）
- **智能抽奖算法**: 基于用户资料完整度和质量的权重计算
- **多样化抽奖类型**: 普通抽奖、技能挑战、创意比赛
- **实时统计**: 参与人数、中奖概率、历史记录等
- **防作弊机制**: 数据验证、重复检测、质量评分

### 6.3 数据库设计

#### 6.3.1 用户抽奖资料表
```sql
CREATE TABLE lottery_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    basic_info JSONB,
    skill_info JSONB,
    social_info JSONB,
    interaction_info JSONB,
    creative_info JSONB,
    contribution_info JSONB,
    learning_info JSONB,
    investment_info JSONB,
    completeness_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    bonus_weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6.3.2 抽奖活动表
```sql
CREATE TABLE lotteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lottery_type VARCHAR(50) NOT NULL, -- 'normal', 'skill', 'creative'
    prizes JSONB NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    draw_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6.3.3 抽奖参与记录表
```sql
CREATE TABLE lottery_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id UUID NOT NULL REFERENCES lotteries(id),
    user_id VARCHAR(255) NOT NULL,
    participation_type VARCHAR(50) NOT NULL,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    weight_multiplier DECIMAL(5,2) DEFAULT 1.0,
    additional_data JSONB,
    is_winner BOOLEAN DEFAULT FALSE,
    prize_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lottery_id, user_id)
);
```

### 6.4 权重计算算法

#### 6.4.1 基础权重计算
```typescript
export class LotteryWeightCalculator {
    static calculateUserWeight(profile: LotteryProfile): number {
        const weights = {
            basicInfo: 0.10,      // 基础信息 10%
            skillInfo: 0.25,      // 技能信息 25%
            socialInfo: 0.15,     // 社交信息 15%
            interactionInfo: 0.20, // 互动信息 20%
            creativeInfo: 0.10,   // 创意信息 10%
            contributionInfo: 0.15, // 贡献信息 15%
            learningInfo: 0.05,   // 学习信息 5%
        };
        
        let totalWeight = 1.0; // 基础权重
        
        // 计算各部分权重
        Object.entries(weights).forEach(([key, weight]) => {
            const sectionScore = this.calculateSectionScore(profile[key]);
            totalWeight += sectionScore * weight;
        });
        
        // 质量加成
        const qualityBonus = this.calculateQualityBonus(profile);
        totalWeight *= (1 + qualityBonus);
        
        return Math.min(totalWeight, 5.0); // 最大5倍权重
    }
    
    private static calculateSectionScore(sectionData: any): number {
        if (!sectionData) return 0;
        
        let score = 0;
        let totalFields = 0;
        
        // 计算字段完整度
        Object.values(sectionData).forEach(value => {
            totalFields++;
            if (value && value !== '' && value !== null) {
                score++;
            }
        });
        
        return totalFields > 0 ? score / totalFields : 0;
    }
    
    private static calculateQualityBonus(profile: LotteryProfile): number {
        let bonus = 0;
        
        // 内容长度加成
        if (profile.interactionInfo?.wishContent?.length > 100) bonus += 0.1;
        if (profile.creativeInfo?.lotterySlogan?.length > 20) bonus += 0.05;
        
        // 社交链接加成
        const socialLinks = Object.values(profile.socialInfo || {}).filter(Boolean).length;
        bonus += Math.min(socialLinks * 0.02, 0.1);
        
        // 技能多样性加成
        const skillCount = (profile.skillInfo?.programmingLanguages?.length || 0) +
                          (profile.skillInfo?.frameworks?.length || 0);
        bonus += Math.min(skillCount * 0.01, 0.1);
        
        return bonus;
    }
}
```

### 6.5 抽奖算法实现

#### 6.5.1 加权随机抽奖
```typescript
export class LotteryDrawService {
    static async conductDraw(lotteryId: string): Promise<DrawResult> {
        // 获取所有参与者
        const participants = await this.getParticipants(lotteryId);
        
        // 获取奖品配置
        const lottery = await this.getLottery(lotteryId);
        const prizes = lottery.prizes;
        
        const winners: Winner[] = [];
        
        // 按奖品等级依次抽奖
        for (const prize of prizes) {
            const prizeWinners = await this.drawForPrize(
                participants.filter(p => !winners.some(w => w.userId === p.userId)),
                prize
            );
            winners.push(...prizeWinners);
        }
        
        // 保存抽奖结果
        await this.saveDrawResult(lotteryId, winners);
        
        return {
            lotteryId,
            winners,
            totalParticipants: participants.length,
            drawTime: new Date().toISOString()
        };
    }
    
    private static async drawForPrize(
        participants: Participant[],
        prize: Prize
    ): Promise<Winner[]> {
        const winners: Winner[] = [];
        
        // 计算总权重
        const totalWeight = participants.reduce((sum, p) => sum + p.weightMultiplier, 0);
        
        // 抽取指定数量的获奖者
        for (let i = 0; i < prize.quantity; i++) {
            if (participants.length === 0) break;
            
            // 加权随机选择
            const randomValue = Math.random() * totalWeight;
            let currentWeight = 0;
            let selectedIndex = -1;
            
            for (let j = 0; j < participants.length; j++) {
                currentWeight += participants[j].weightMultiplier;
                if (randomValue <= currentWeight) {
                    selectedIndex = j;
                    break;
                }
            }
            
            if (selectedIndex >= 0) {
                const winner = participants[selectedIndex];
                winners.push({
                    userId: winner.userId,
                    nickname: winner.nickname,
                    prize: prize.name,
                    prizeValue: prize.value,
                    winningTime: new Date().toISOString()
                });
                
                // 移除已中奖用户
                participants.splice(selectedIndex, 1);
            }
        }
        
        return winners;
    }
}
```

---

## 7. 部署说明

### 7.1 本地开发部署

#### 7.1.1 环境准备
```bash
# 安装Node.js和pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh

# 克隆项目
git clone <repository-url>
cd mcp-service

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑.env.local文件
```

#### 7.1.2 启动服务
```bash
# 开发模式启动
pnpm dev

# 生产模式启动
pnpm build
pnpm start
```

### 7.2 Docker部署

#### 7.2.1 Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["pnpm", "start"]
```

#### 7.2.2 docker-compose.yml
```yaml
version: '3.8'

services:
  mcp-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://postgres:password@db:5432/mcp_prod
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=mcp_prod
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 7.3 生产环境部署

#### 7.3.1 环境配置
```env
# 生产环境配置
NODE_ENV=production
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379

# 安全配置
JWT_SECRET=your-production-jwt-secret
API_RATE_LIMIT=1000

# 监控配置
LOG_LEVEL=info
MONITORING_ENABLED=true
```

#### 7.3.2 PM2配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mcp-service',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 7.4 监控和维护

#### 7.4.1 健康检查
```typescript
// src/routes/health.ts
import { Router } from 'express';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await checkDatabase();
    
    // 检查Redis连接
    await checkRedis();
    
    // 检查内存使用
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
```

#### 7.4.2 日志配置
```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mcp-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 7.5 性能优化

#### 7.5.1 缓存策略
```typescript
// src/services/cacheService.ts
import Redis from 'ioredis';

export class CacheService {
  private static redis = new Redis(process.env.REDIS_URL);
  
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  static async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}
```

#### 7.5.2 数据库优化
```sql
-- 创建索引优化查询性能
CREATE INDEX idx_lottery_profiles_user_id ON lottery_profiles(user_id);
CREATE INDEX idx_lottery_participations_lottery_id ON lottery_participations(lottery_id);
CREATE INDEX idx_lottery_participations_user_id ON lottery_participations(user_id);
CREATE INDEX idx_lotteries_status ON lotteries(status);
CREATE INDEX idx_lotteries_start_end_time ON lotteries(start_time, end_time);

-- 分区表优化大数据量查询
CREATE TABLE lottery_participations_partitioned (
    LIKE lottery_participations INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE lottery_participations_2024_q1 PARTITION OF lottery_participations_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

---

## 结语

本文档提供了VibeDoge MCP服务的完整开发和部署指南，涵盖了从产品需求到技术实现的各个方面。通过遵循本文档的指导，开发团队可以快速构建一个功能完整、性能优良的MCP服务系统。

如有任何问题或建议，请联系开发团队或提交Issue到项目仓库。

---

**文档版本**: v1.0.0  
**最后更新**: 2024年1月1日  
**维护团队**: VibeDoge开发团队