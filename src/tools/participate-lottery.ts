import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import {
  ParticipateLotteryParams,
  LotteryParticipationResponse,
  ToolExecutionResult
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * 参与抽奖活动工具
 */
export class ParticipateLotteryTool {
  private apiClient: APIClient;
  private logger: Logger;

  constructor(apiClient: APIClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger.child('ParticipateLotteryTool');
  }

  /**
   * 获取工具定义
   */
  getDefinition(): Tool {
    return {
      name: 'participate_lottery',
      description: '参与指定的抽奖活动，系统会根据用户资料完整度和活跃度计算中奖权重',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: '用户唯一标识符'
          },
          lotteryId: {
            type: 'string',
            description: '抽奖活动唯一标识符'
          },
          participationData: {
            type: 'object',
            description: '参与数据（可选）',
            properties: {
              referralCode: {
                type: 'string',
                description: '推荐码（如果有）'
              },
              socialShares: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    platform: {
                      type: 'string',
                      enum: ['twitter', 'facebook', 'linkedin', 'discord', 'telegram'],
                      description: '社交平台'
                    },
                    shareUrl: {
                      type: 'string',
                      description: '分享链接'
                    },
                    timestamp: {
                      type: 'string',
                      description: '分享时间戳'
                    }
                  },
                  required: ['platform', 'shareUrl']
                },
                description: '社交分享记录'
              },
              additionalActions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    actionType: {
                      type: 'string',
                      enum: ['follow', 'like', 'comment', 'subscribe', 'join_community'],
                      description: '行动类型'
                    },
                    platform: {
                      type: 'string',
                      description: '平台名称'
                    },
                    proof: {
                      type: 'string',
                      description: '证明链接或截图'
                    },
                    timestamp: {
                      type: 'string',
                      description: '完成时间戳'
                    }
                  },
                  required: ['actionType', 'platform']
                },
                description: '额外行动记录'
              },
              customAnswers: {
                type: 'object',
                description: '自定义问题答案',
                additionalProperties: {
                  type: 'string'
                }
              }
            }
          },
          bearerToken: {
            type: 'string',
            description: 'API认证令牌'
          }
        },
        required: ['userId', 'lotteryId', 'bearerToken']
      }
    };
  }

  /**
   * 执行工具
   */
  async execute(params: ParticipateLotteryParams): Promise<ToolExecutionResult<LotteryParticipationResponse>> {
    try {
      this.logger.info(`User ${params.userId} participating in lottery: ${params.activityId}`);
      
      // Bearer Token 由API客户端统一管理
      
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

      // 构建参与数据
      const participationPayload = {
        userId: params.userId,
        activityId: params.activityId,
        participationType: params.participationType,
        additionalData: params.additionalData || {},
        skillChallenge: params.skillChallenge,
        creativeSubmission: params.creativeSubmission,
        timestamp: new Date().toISOString()
      };

      // 调用API参与抽奖
      const response = await this.apiClient.post<LotteryParticipationResponse>(
        `/api/lottery/${params.activityId}/participate`,
        participationPayload
      );

      if (response.success && response.data) {
        this.logger.info(`User ${params.userId} successfully participated in lottery ${params.activityId}`, {
          participationId: response.data.participationId
        });

        return {
          success: true,
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Failed to participate in lottery';
        this.logger.error(`Failed to participate in lottery: ${errorMessage}`);
        
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
      this.logger.error('Error participating in lottery:', error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Unknown error occurred while participating in lottery',
          code: error.status?.toString(),
          details: error.response?.data
        }
      };
    }
  }

  /**
   * 验证参数
   */
  private validateParams(params: ParticipateLotteryParams): string[] {
    const errors: string[] = [];

    // 基础参数验证
    if (!params.userId || typeof params.userId !== 'string') {
      errors.push('userId is required and must be a string');
    }

    if (!params.activityId || typeof params.activityId !== 'string') {
      errors.push('activityId is required and must be a string');
    }

    if (!params.participationType || !['normal', 'skill', 'creative'].includes(params.participationType)) {
      errors.push('participationType must be one of: normal, skill, creative');
    }

    // 技能挑战验证
    if (params.participationType === 'skill' && !params.skillChallenge) {
      errors.push('skillChallenge is required for skill participation type');
    }

    // 创意提交验证
    if (params.participationType === 'creative' && !params.creativeSubmission) {
      errors.push('creativeSubmission is required for creative participation type');
    }

    return errors;
  }
}