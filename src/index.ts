#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { APIClient } from './services/api-client.js';
import { Logger } from './utils/logger.js';
import {
  // 用户管理工具
  GenerateUserTool,
  GetUserTool,
  UpdateUserProfileTool,
  
  // 会话管理工具
  ValidateSessionTool,
  RefreshSessionTool,
  HeartbeatTool,
  LogoutTool,
  
  // 抽奖相关工具
  UploadUserProfileTool,
  ParticipateLotteryTool,
  GetUserStatsToolTool,
  GetLotteryHistoryTool,
  
  // 健康检查和错误处理工具
  HealthCheckTool,
  SystemStatsTool,
  ErrorReportTool,
  HealthCheckHandler
} from './tools/index.js';

/**
 * Vibe Coding 抽奖系统 MCP 服务器
 * 
 * 提供以下工具：
 * 用户管理：
 * 1. generate_user - 生成新用户
 * 2. get_user - 获取用户信息
 * 3. update_user_profile - 更新用户资料
 * 
 * 会话管理：
 * 4. validate_session - 验证会话
 * 5. refresh_session - 刷新会话
 * 6. heartbeat - 心跳检测
 * 7. logout - 用户登出
 * 
 * 抽奖系统：
 * 8. upload_user_profile - 上传用户完整资料信息
 * 9. participate_lottery - 参与指定抽奖活动
 * 10. get_lottery_result - 查询抽奖活动结果
 * 11. get_user_stats - 获取用户统计信息
 * 12. get_lottery_history - 获取抽奖历史记录
 * 13. health_check - 健康检查
 */
class VibeCodingMCPServer {
  private server: Server;
  private apiClient: APIClient;
  private logger: Logger;
  
  // 用户管理工具实例
  private generateUserTool: GenerateUserTool;
  private getUserTool: GetUserTool;
  private updateUserProfileTool: UpdateUserProfileTool;
  
  // 会话管理工具实例
  private validateSessionTool: ValidateSessionTool;
  private refreshSessionTool: RefreshSessionTool;
  private heartbeatTool: HeartbeatTool;
  private logoutTool: LogoutTool;
  
  // 抽奖相关工具实例
  private uploadUserProfileTool: UploadUserProfileTool;
  private participateLotteryTool: ParticipateLotteryTool;
  private getLotteryResultTool: GetLotteryResultTool;
  private getUserStatsToolTool: GetUserStatsToolTool;
  private getLotteryHistoryTool: GetLotteryHistoryTool;
  private healthCheckHandler: HealthCheckHandler;
  private healthCheckTool: HealthCheckTool;
  private systemStatsTool: SystemStatsTool;
  private errorReportTool: ErrorReportTool;

  constructor() {
    // 初始化服务器
    this.server = new Server(
      {
        name: 'vibe-coding-lottery-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 初始化日志器
    this.logger = new Logger('VibeCodingMCPServer');
    
    // 初始化API客户端
    const baseURL = process.env.VIBE_CODING_API_URL || 'https://api.vibecoding.com';
    this.apiClient = new APIClient();
    
    // 初始化用户管理工具实例
    this.generateUserTool = new GenerateUserTool(this.apiClient, this.logger);
    this.getUserTool = new GetUserTool(this.apiClient, this.logger);
    this.updateUserProfileTool = new UpdateUserProfileTool(this.apiClient, this.logger);
    
    // 初始化会话管理工具实例
    this.validateSessionTool = new ValidateSessionTool(this.apiClient, this.logger);
    this.refreshSessionTool = new RefreshSessionTool(this.apiClient, this.logger);
    this.heartbeatTool = new HeartbeatTool(this.apiClient, this.logger);
    this.logoutTool = new LogoutTool(this.apiClient, this.logger);
    
    // 初始化抽奖相关工具实例
    this.uploadUserProfileTool = new UploadUserProfileTool(this.apiClient, this.logger);
    this.participateLotteryTool = new ParticipateLotteryTool(this.apiClient, this.logger);
    this.getLotteryResultTool = new GetLotteryResultTool(this.apiClient, this.logger);
    this.getUserStatsToolTool = new GetUserStatsToolTool(this.apiClient, this.logger);
    this.getLotteryHistoryTool = new GetLotteryHistoryTool(this.apiClient, this.logger);
    
    // 初始化健康检查和错误处理工具
    this.healthCheckHandler = new HealthCheckHandler(this.apiClient, this.logger);
    this.healthCheckTool = new HealthCheckTool(this.apiClient, this.logger);
    this.systemStatsTool = new SystemStatsTool(this.apiClient, this.logger);
    this.errorReportTool = new ErrorReportTool(this.apiClient, this.logger);

    this.setupHandlers();
  }

  /**
   * 设置请求处理器
   */
  private setupHandlers(): void {
    // 处理工具列表请求
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.info('Received list_tools request');
      
      return {
          tools: [
            // 用户管理工具
            this.generateUserTool.getDefinition(),
            this.getUserTool.getDefinition(),
            this.updateUserProfileTool.getDefinition(),
            // 会话管理工具
            this.validateSessionTool.getDefinition(),
            this.refreshSessionTool.getDefinition(),
            this.heartbeatTool.getDefinition(),
            this.logoutTool.getDefinition(),
            // 抽奖相关工具
            this.uploadUserProfileTool.getDefinition(),
            this.participateLotteryTool.getDefinition(),
            this.getLotteryResultTool.getDefinition(),
            this.getUserStatsToolTool.getDefinition(),
            this.getLotteryHistoryTool.getDefinition(),
            this.healthCheckTool.getDefinition(),
            this.systemStatsTool.getDefinition(),
            this.errorReportTool.getDefinition()
          ],
        };
    });

    // 处理工具调用请求
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      this.logger.info(`Received call_tool request for: ${name}`);
      
      try {
        let result;
        
        switch (name) {
          // 用户管理工具
          case 'generate_user':
            result = await this.generateUserTool.execute(args as any);
            break;
            
          case 'get_user':
            result = await this.getUserTool.execute(args as any);
            break;
            
          case 'update_user_profile':
            result = await this.updateUserProfileTool.execute(args as any);
            break;
            
          // 会话管理工具
          case 'validate_session':
            result = await this.validateSessionTool.execute(args as any);
            break;
            
          case 'refresh_session':
            result = await this.refreshSessionTool.execute(args as any);
            break;
            
          case 'heartbeat':
            result = await this.heartbeatTool.execute(args as any);
            break;
            
          case 'logout':
            result = await this.logoutTool.execute(args as any);
            break;
            
          // 抽奖相关工具
          case 'upload_user_profile':
            result = await this.uploadUserProfileTool.execute(args as any);
            break;
            
          case 'participate_lottery':
            result = await this.participateLotteryTool.execute(args as any);
            break;
            
          case 'get_lottery_result':
            result = await this.getLotteryResultTool.execute(args as any);
            break;
            
          case 'get_user_stats':
            result = await this.getUserStatsToolTool.execute(args as any);
            break;
            
          case 'get_lottery_history':
            result = await this.getLotteryHistoryTool.execute(args as any);
            break;
            
          case 'health_check':
            result = await this.healthCheckTool.execute(args as any);
            break;
            
          case 'system_stats':
            result = await this.systemStatsTool.execute(args as any);
            break;
            
          case 'error_report':
            result = await this.errorReportTool.execute(args as any);
            break;
            
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        if (result.success) {
          this.logger.info(`Tool ${name} executed successfully`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result.data, null, 2),
              },
            ],
          };
        } else {
          this.logger.error(`Tool ${name} execution failed:`, result.error);
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${result.error?.message || 'Unknown error'}`,
            result.error?.details
          );
        }
      } catch (error: any) {
        this.logger.error(`Error executing tool ${name}:`, error);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Unexpected error: ${error.message || 'Unknown error'}`
        );
      }
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    
    this.logger.info('Starting Vibe Coding Lottery MCP Server...');
    
    try {
      await this.server.connect(transport);
      this.logger.info('Vibe Coding Lottery MCP Server started successfully');
    } catch (error) {
      this.logger.error('Failed to start MCP server:', error);
      process.exit(1);
    }
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping Vibe Coding Lottery MCP Server...');
    await this.server.close();
    this.logger.info('Vibe Coding Lottery MCP Server stopped');
  }
}

// 处理进程信号
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// 启动服务器
const server = new VibeCodingMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { VibeCodingMCPServer };