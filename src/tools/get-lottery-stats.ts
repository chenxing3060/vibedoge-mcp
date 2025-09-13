import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import {
  GetLotteryStatsParams,
  LotteryStatsResponse,
  ToolExecutionResult
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * 获取抽奖统计信息工具
 */
export class GetLotteryStatsTool {
  private apiClient: APIClient;
  private logger: Logger;

  constructor(apiClient: APIClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger.child('GetLotteryStatsTool');
  }

  /**
   * 获取工具定义
   */
  getDefinition(): Tool {
    return {
      name: 'get_lottery_stats',
      description: '获取抽奖系统的统计信息，包括总体数据、趋势分析、用户参与度等多维度统计数据',
      inputSchema: {
        type: 'object',
        properties: {
          statsType: {
            type: 'string',
            enum: ['overview', 'detailed', 'trends', 'user_specific'],
            description: '统计类型：overview-概览，detailed-详细，trends-趋势，user_specific-用户特定',
            default: 'overview'
          },
          timeRange: {
            type: 'string',
            enum: ['7d', '30d', '90d', '1y', 'all', 'custom'],
            description: '时间范围：7d-7天，30d-30天，90d-90天，1y-1年，all-全部，custom-自定义',
            default: '30d'
          },
          startDate: {
            type: 'string',
            description: '自定义开始日期（ISO 8601格式，当timeRange为custom时必需）'
          },
          endDate: {
            type: 'string',
            description: '自定义结束日期（ISO 8601格式，当timeRange为custom时必需）'
          },
          userId: {
            type: 'string',
            description: '用户ID（当statsType为user_specific时必需）'
          },
          groupBy: {
            type: 'string',
            enum: ['day', 'week', 'month', 'category', 'prize_type'],
            description: '分组方式：day-按天，week-按周，month-按月，category-按分类，prize_type-按奖品类型',
            default: 'day'
          },
          includeCharts: {
            type: 'boolean',
            description: '是否包含图表数据（默认为false）',
            default: false
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'total_activities',
                'total_participants',
                'total_winners',
                'total_prize_value',
                'participation_rate',
                'win_rate',
                'avg_participants_per_activity',
                'avg_prize_value',
                'user_retention',
                'activity_completion_rate'
              ]
            },
            description: '指定要获取的指标（如果不指定则返回所有指标）'
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
  async execute(params: GetLotteryStatsParams): Promise<ToolExecutionResult<LotteryStatsResponse>> {
    try {
      this.logger.info(`Getting lottery stats for activity: ${params.activityId || 'all'}`, {
        // statsType 字段已简化
        timeRange: params.timeRange,
        // groupBy 字段已简化
        userId: params.userId
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
      
      // statsType 字段已简化
      
      if (params.activityId) {
        queryParams.append('activityId', params.activityId);
      }
      
      if (params.timeRange) {
        queryParams.append('timeRange', params.timeRange);
      }
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      if (params.userId) {
        queryParams.append('userId', params.userId);
      }
      
      // groupBy 和 includeCharts 字段已简化
      
      // metrics 字段已简化

      const queryString = queryParams.toString();
      
      // 调用API获取抽奖统计
      const endpoint = params.activityId 
        ? `/api/lottery/${params.activityId}/stats?${queryString}`
        : `/api/lottery/stats?${queryString}`;
      
      const response = await this.apiClient.get<LotteryStatsResponse>(endpoint);

      if (response.success && response.data) {
        this.logger.info(`Successfully retrieved lottery stats for ${params.activityId || 'all'}`, {
          statsData: response.data || {}
        });

        return {
          success: true,
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Failed to get lottery statistics';
        this.logger.error(`Failed to get lottery statistics: ${errorMessage}`);
        
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
      this.logger.error('Error getting lottery statistics:', error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Unknown error occurred while getting lottery statistics',
          code: error.status?.toString(),
          details: error.response?.data
        }
      };
    }
  }

  /**
   * 验证参数
   */
  private validateParams(params: GetLotteryStatsParams): string[] {
    const errors: string[] = [];
    // 基本验证，所有参数都是可选的
    return errors;
  }
}