import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import {
  UploadUserProfileParams,
  UserProfileUploadResponse,
  ToolExecutionResult,
  UserProfileData
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * 上传用户完整资料信息工具
 */
export class UploadUserProfileTool {
  private apiClient: APIClient;
  private logger: Logger;

  constructor(apiClient: APIClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger.child('UploadUserProfileTool');
  }

  /**
   * 获取工具定义
   */
  getDefinition(): Tool {
    return {
      name: 'upload_user_profile',
      description: '上传用户完整资料信息到抽奖系统，包括基础信息、技能信息、社交信息等8个维度的数据',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: '用户唯一标识符'
          },
          basicInfo: {
            type: 'object',
            description: '基础信息对象',
            properties: {
              name: { type: 'string', description: '用户姓名' },
              email: { type: 'string', description: '邮箱地址' },
              phone: { type: 'string', description: '电话号码' },
              location: { type: 'string', description: '所在地区' },
              bio: { type: 'string', description: '个人简介' },
              avatar: { type: 'string', description: '头像URL' },
              birthDate: { type: 'string', description: '出生日期' },
              gender: { type: 'string', enum: ['male', 'female', 'other'], description: '性别' }
            },
            required: ['name', 'email']
          },
          skillInfo: {
            type: 'object',
            description: '技能信息对象',
            properties: {
              programmingLanguages: { type: 'array', items: { type: 'string' }, description: '编程语言' },
              frameworks: { type: 'array', items: { type: 'string' }, description: '框架技术' },
              tools: { type: 'array', items: { type: 'string' }, description: '开发工具' },
              experienceYears: { type: 'number', description: '工作经验年数' },
              specialties: { type: 'array', items: { type: 'string' }, description: '专业领域' },
              certifications: { type: 'array', items: { type: 'string' }, description: '认证证书' },
              portfolioUrl: { type: 'string', description: '作品集URL' },
              githubUrl: { type: 'string', description: 'GitHub地址' }
            },
            required: ['programmingLanguages', 'frameworks', 'tools', 'experienceYears', 'specialties']
          },
          socialInfo: {
            type: 'object',
            description: '社交信息对象（可选）',
            properties: {
              twitterHandle: { type: 'string', description: 'Twitter用户名' },
              linkedinUrl: { type: 'string', description: 'LinkedIn地址' },
              discordUsername: { type: 'string', description: 'Discord用户名' },
              telegramUsername: { type: 'string', description: 'Telegram用户名' },
              wechatId: { type: 'string', description: '微信号' },
              personalWebsite: { type: 'string', description: '个人网站' },
              blogUrl: { type: 'string', description: '博客地址' }
            }
          },
          interactionInfo: {
            type: 'object',
            description: '互动信息对象（可选）',
            properties: {
              communityParticipation: { type: 'number', description: '社区参与度' },
              helpfulnessScore: { type: 'number', description: '帮助他人评分' },
              mentorshipHours: { type: 'number', description: '指导时长' },
              eventAttendance: { type: 'number', description: '活动参与次数' },
              forumPosts: { type: 'number', description: '论坛发帖数' },
              codeReviews: { type: 'number', description: '代码审查次数' }
            }
          },
          creativeInfo: {
            type: 'object',
            description: '创意信息对象（可选）',
            properties: {
              projectsCompleted: { type: 'number', description: '完成项目数' },
              innovationScore: { type: 'number', description: '创新评分' },
              designSkills: { type: 'array', items: { type: 'string' }, description: '设计技能' },
              creativePortfolio: { type: 'array', items: { type: 'string' }, description: '创意作品集' },
              awards: { type: 'array', items: { type: 'string' }, description: '获奖记录' },
              publications: { type: 'array', items: { type: 'string' }, description: '发表作品' }
            }
          },
          contributionInfo: {
            type: 'object',
            description: '贡献信息对象（可选）',
            properties: {
              openSourceContributions: { type: 'number', description: '开源贡献数' },
              communityContributions: { type: 'number', description: '社区贡献数' },
              knowledgeSharing: { type: 'number', description: '知识分享次数' },
              volunteerHours: { type: 'number', description: '志愿服务时长' },
              donations: { type: 'number', description: '捐赠金额' },
              menteeCount: { type: 'number', description: '指导学员数' }
            }
          },
          learningInfo: {
            type: 'object',
            description: '学习信息对象（可选）',
            properties: {
              coursesCompleted: { type: 'number', description: '完成课程数' },
              learningGoals: { type: 'array', items: { type: 'string' }, description: '学习目标' },
              currentLearning: { type: 'array', items: { type: 'string' }, description: '当前学习内容' },
              preferredLearningStyle: { type: 'string', enum: ['visual', 'auditory', 'kinesthetic', 'reading'], description: '学习风格' },
              skillsToImprove: { type: 'array', items: { type: 'string' }, description: '待提升技能' },
              learningTime: { type: 'number', description: '每周学习时长' }
            }
          },
          investmentInfo: {
            type: 'object',
            description: '投资信息对象（可选）',
            properties: {
              investmentExperience: { type: 'number', description: '投资经验年数' },
              riskTolerance: { type: 'string', enum: ['low', 'medium', 'high'], description: '风险承受能力' },
              investmentGoals: { type: 'array', items: { type: 'string' }, description: '投资目标' },
              portfolioValue: { type: 'number', description: '投资组合价值' },
              cryptoExperience: { type: 'boolean', description: '加密货币经验' },
              tradingFrequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'rarely'], description: '交易频率' }
            }
          },
          bearerToken: {
            type: 'string',
            description: 'API认证令牌'
          }
        },
        required: ['userId', 'basicInfo', 'skillInfo', 'bearerToken']
      }
    };
  }

  /**
   * 执行工具
   */
  async execute(params: UploadUserProfileParams): Promise<ToolExecutionResult<UserProfileUploadResponse>> {
    try {
      this.logger.info(`Uploading user profile for user: ${params.userId}`);
      
      // 设置Bearer Token
      this.apiClient.setBearerToken(params.bearerToken);
      
      // 构建用户资料数据
      const userProfileData: UserProfileData = {
        userId: params.userId,
        basicInfo: params.basicInfo,
        skillInfo: params.skillInfo,
        socialInfo: params.socialInfo,
        interactionInfo: params.interactionInfo,
        creativeInfo: params.creativeInfo,
        contributionInfo: params.contributionInfo,
        learningInfo: params.learningInfo,
        investmentInfo: params.investmentInfo
      };

      // 调用API上传用户资料
      const response = await this.apiClient.post<UserProfileUploadResponse>(
        '/api/users/profile',
        userProfileData
      );

      if (response.success && response.data) {
        this.logger.info(`User profile uploaded successfully for user: ${params.userId}`, {
          profileId: response.data.profileId,
          completeness: response.data.completeness,
          bonusWeight: response.data.bonusWeight
        });

        return {
          success: true,
          data: response.data
        };
      } else {
        const errorMessage = response.error?.message || 'Failed to upload user profile';
        this.logger.error(`Failed to upload user profile: ${errorMessage}`);
        
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
      this.logger.error('Error uploading user profile:', error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Unknown error occurred while uploading user profile',
          code: error.status?.toString(),
          details: error.response?.data
        }
      };
    }
  }

  /**
   * 验证参数
   */
  private validateParams(params: UploadUserProfileParams): string[] {
    const errors: string[] = [];

    if (!params.userId || typeof params.userId !== 'string') {
      errors.push('userId is required and must be a string');
    }

    if (!params.basicInfo) {
      errors.push('basicInfo is required');
    } else {
      if (!params.basicInfo.name) {
        errors.push('basicInfo.name is required');
      }
      if (!params.basicInfo.email) {
        errors.push('basicInfo.email is required');
      }
    }

    if (!params.skillInfo) {
      errors.push('skillInfo is required');
    } else {
      if (!Array.isArray(params.skillInfo.programmingLanguages)) {
        errors.push('skillInfo.programmingLanguages must be an array');
      }
      if (!Array.isArray(params.skillInfo.frameworks)) {
        errors.push('skillInfo.frameworks must be an array');
      }
      if (!Array.isArray(params.skillInfo.tools)) {
        errors.push('skillInfo.tools must be an array');
      }
      if (typeof params.skillInfo.experienceYears !== 'number') {
        errors.push('skillInfo.experienceYears must be a number');
      }
    }

    if (!params.bearerToken || typeof params.bearerToken !== 'string') {
      errors.push('bearerToken is required and must be a string');
    }

    return errors;
  }
}