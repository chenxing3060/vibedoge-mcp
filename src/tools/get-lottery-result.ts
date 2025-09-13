import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import {
  GetLotteryResultParams,
  LotteryResultResponse,
  ToolExecutionResult
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * 查询抽奖结果工具
 */
export class GetLotteryResultTool {
  private apiClient: APIClient;
  private logger: Logger;

  constructor(apiClient: APIClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger.child('GetLotteryResultTool');
  }

  /**
   * 获取工具定义
   */
  getDefinition(): Tool {
    return {
      name: 'get_lottery_result',
      description: '查询指定抽奖活动的结果，包括中奖者信息、奖品分配等详细信息',
      inputSchema: {
        type: 'object',
        properties: {
          lotteryId: {
            type: 'string',
            description: '抽奖活动唯一标识符'
          },
          userId: {
            type: 'string',
            description: '用户唯一标识符（可选，用于查询特定用户的中奖状态）'
          },
          includeDetails: {
            type: 'boolean',
            description: '是否包含详细信息（默认为true）',
            default: true
          },
          resultType: {
            type: 'string',
            enum: ['all', 'winners_only', 'user_specific'],
            description: '结果类型：all-所有信息，winners_only-仅中奖者，user_specific-特定用户',
            default: 'all'
          },
          bearerToken: {
            type: 'string',
            description: 'API认证令牌'
          }
        },
        required: ['lotteryId', 'bearerToken']
      }
    };
  }

  /**
   * 执行工具
   */
  async execute(params: GetLotteryResultParams): Promise<ToolExecutionResult<LotteryResultResponse>> {
    try {
      this.logger.info(`Getting lottery result for lottery: ${params.activityId}`);
      
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
      
      if (params.userId) {
        queryParams.append('userId', params.userId);
      }
      
      // includeDetails 和 resultType 字段已简化

      const queryString = queryParams.toString();
      const endpoint = `/api/lottery/${params.activityId}/result${queryString ? `?${queryString}` : ''}`;

      // 调用API获取抽奖结果
      const response = await this.apiClient.get<LotteryResultResponse>(endpoint);

      if (response.success && response.data) {
        this.logger.info(`Successfully retrieved lottery result for lottery: ${params.activityId}`, {
          activityId: params.activityId,
          resultData: response.data || {}
        });

        return {
          success: true,
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Failed to get lottery result';
        this.logger.error(`Failed to get lottery result: ${errorMessage}`);
        
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
      this.logger.error('Error getting lottery result:', error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Unknown error occurred while getting lottery result',
          code: error.status?.toString(),
          details: error.response?.data
        }
      };
    }
  }

  /**
   * 验证参数
   */
  private validateParams(params: GetLotteryResultParams): string[] {
    const errors: string[] = [];

    if (!params.activityId || typeof params.activityId !== 'string') {
      errors.push('activityId is required and must be a string');
    }

    if (params.userId && typeof params.userId !== 'string') {
      errors.push('userId must be a string if provided');
    }

    // 详细验证已简化

    return errors;
  }
}