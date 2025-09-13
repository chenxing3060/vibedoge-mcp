import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import {
  ListLotteryActivitiesParams,
  LotteryActivitiesResponse,
  ToolExecutionResult
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * 获取抽奖活动列表工具
 */
export class ListLotteryActivitiesTool {
  private apiClient: APIClient;
  private logger: Logger;

  constructor(apiClient: APIClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger.child('ListLotteryActivitiesTool');
  }

  /**
   * 获取工具定义
   */
  getDefinition(): Tool {
    return {
      name: 'list_lottery_activities',
      description: '获取抽奖活动列表，支持多种筛选条件和排序方式，可查看活动详情、参与状态等信息',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: '页码（从1开始）',
            minimum: 1,
            default: 1
          },
          limit: {
            type: 'number',
            description: '每页记录数（最大50）',
            minimum: 1,
            maximum: 50,
            default: 10
          },
          status: {
            type: 'string',
            enum: ['all', 'upcoming', 'active', 'ended', 'cancelled'],
            description: '活动状态：all-全部，upcoming-即将开始，active-进行中，ended-已结束，cancelled-已取消',
            default: 'all'
          },
          category: {
            type: 'string',
            description: '活动分类（可选）'
          },
          prizeType: {
            type: 'string',
            enum: ['all', 'cash', 'crypto', 'nft', 'physical', 'digital'],
            description: '奖品类型：all-全部，cash-现金，crypto-加密货币，nft-NFT，physical-实物，digital-数字商品',
            default: 'all'
          },
          minPrizeValue: {
            type: 'number',
            description: '最小奖品价值（USD）',
            minimum: 0
          },
          maxPrizeValue: {
            type: 'number',
            description: '最大奖品价值（USD）',
            minimum: 0
          },
          startDateFrom: {
            type: 'string',
            description: '活动开始时间筛选-起始日期（ISO 8601格式）'
          },
          startDateTo: {
            type: 'string',
            description: '活动开始时间筛选-结束日期（ISO 8601格式）'
          },
          endDateFrom: {
            type: 'string',
            description: '活动结束时间筛选-起始日期（ISO 8601格式）'
          },
          endDateTo: {
            type: 'string',
            description: '活动结束时间筛选-结束日期（ISO 8601格式）'
          },
          sortBy: {
            type: 'string',
            enum: ['created_date', 'start_date', 'end_date', 'prize_value', 'participants_count'],
            description: '排序字段：created_date-创建时间，start_date-开始时间，end_date-结束时间，prize_value-奖品价值，participants_count-参与人数',
            default: 'start_date'
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
          userId: {
            type: 'string',
            description: '用户ID（可选，用于查看用户参与状态）'
          },
          searchKeyword: {
            type: 'string',
            description: '搜索关键词（在活动标题和描述中搜索）'
          },
          bearerToken: {
            type: 'string',
            description: 'API认证令牌'
          }
        },
        required: ['bearerToken']
      }
    };
  }

  /**
   * 执行工具
   */
  async execute(params: ListLotteryActivitiesParams): Promise<ToolExecutionResult<LotteryActivitiesResponse>> {
    try {
      this.logger.info('Getting lottery activities list', {
        page: params.page,
        limit: params.limit,
        status: params.status,
        category: params.category
      });
      
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
      queryParams.append('limit', (params.limit || 10).toString());
      
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      
      if (params.category) {
        queryParams.append('category', params.category);
      }
      
      // 奖品相关字段已简化
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      // 其他字段已简化

      const queryString = queryParams.toString();
      const endpoint = `/api/lottery/activities?${queryString}`;

      // 调用API获取抽奖活动列表
      const response = await this.apiClient.get<LotteryActivitiesResponse>(endpoint);

      if (response.success && response.data) {
        this.logger.info('Successfully retrieved lottery activities', {
          activitiesCount: response.data.activities.length
        });

        return {
          success: true,
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Failed to get lottery activities list';
        this.logger.error(`Failed to get lottery activities list: ${errorMessage}`);
        
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
      this.logger.error('Error getting lottery activities list:', error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Unknown error occurred while getting lottery activities list',
          code: error.status?.toString(),
          details: error.response?.data
        }
      };
    }
  }

  /**
   * 验证参数
   */
  private validateParams(params: ListLotteryActivitiesParams): string[] {
    const errors: string[] = [];
    // 基本验证，所有参数都是可选的
    return errors;
  }
}