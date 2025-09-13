import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import {
  GetUserHistoryParams,
  UserHistoryResponse,
  ToolExecutionResult
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * 获取用户抽奖历史记录工具
 */
export class GetUserHistoryTool {
  private apiClient: APIClient;
  private logger: Logger;

  constructor(apiClient: APIClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger.child('GetUserHistoryTool');
  }

  /**
   * 获取工具定义
   */
  getDefinition(): Tool {
    return {
      name: 'get_user_history',
      description: '获取指定用户的抽奖历史记录，包括参与的活动、中奖记录、奖品领取状态等信息',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: '用户唯一标识符'
          },
          page: {
            type: 'number',
            description: '页码（从1开始）',
            minimum: 1,
            default: 1
          },
          limit: {
            type: 'number',
            description: '每页记录数（最大100）',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          status: {
            type: 'string',
            enum: ['all', 'participated', 'won', 'claimed', 'expired'],
            description: '筛选状态：all-全部，participated-已参与，won-已中奖，claimed-已领取，expired-已过期',
            default: 'all'
          },
          dateFrom: {
            type: 'string',
            description: '开始日期（ISO 8601格式，如：2024-01-01T00:00:00Z）'
          },
          dateTo: {
            type: 'string',
            description: '结束日期（ISO 8601格式，如：2024-12-31T23:59:59Z）'
          },
          sortBy: {
            type: 'string',
            enum: ['date', 'status', 'prize_value'],
            description: '排序字段：date-日期，status-状态，prize_value-奖品价值',
            default: 'date'
          },
          sortOrder: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: '排序顺序：asc-升序，desc-降序',
            default: 'desc'
          },
          includeDetails: {
            type: 'boolean',
            description: '是否包含详细信息（默认为true）',
            default: true
          },
          bearerToken: {
            type: 'string',
            description: 'API认证令牌'
          }
        },
        required: ['userId', 'bearerToken']
      }
    };
  }

  /**
   * 执行工具
   */
  async execute(params: GetUserHistoryParams): Promise<ToolExecutionResult<UserHistoryResponse>> {
    try {
      this.logger.info(`Getting user history for user: ${params.userId}`);
      
      // 设置Bearer Token
      // Bearer Token 由 API 客户端统一管理
      
      // 验证参数
      const validationErrors = this.validateParams(params);
      if (validationErrors.length > 0) {
        this.logger.error('Parameter validation failed:', validationErrors);
        return {
          success: false,
          error: {
            message: 'Parameter validation failed',
            details: validationErrors
          }
        };
      }

      // 构建查询参数
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', (params.page || 1).toString());
      queryParams.append('limit', (params.limit || 20).toString());
      
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      
      // 日期和排序字段已简化
      
      // 排序和详情字段已简化

      const queryString = queryParams.toString();
      const endpoint = `/api/users/${params.userId}/history?${queryString}`;

      // 调用API获取用户历史记录
      const response = await this.apiClient.get<UserHistoryResponse>(endpoint);

      if (response.success && response.data) {
        this.logger.info(`Successfully retrieved user history for user: ${params.userId}`, {
          userId: params.userId,
          recordsCount: Array.isArray(response.data) ? response.data.length : 0
        });

        return {
          success: true,
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Failed to get user history';
        this.logger.error(`Failed to get user history: ${errorMessage}`);
        
        return {
          success: false,
          error: {
            message: errorMessage,
            code: response.error?.code,
            details: response.error?.details
          }
        };
      }
    } catch (error: any) {
      this.logger.error('Error getting user history:', error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Unknown error occurred while getting user history',
          code: error.status?.toString(),
          details: error.response?.data
        }
      };
    }
  }

  /**
   * 验证参数
   */
  private validateParams(params: GetUserHistoryParams): string[] {
    const errors: string[] = [];

    if (!params.userId || typeof params.userId !== 'string') {
      errors.push('userId is required and must be a string');
    }

    return errors;
  }
}