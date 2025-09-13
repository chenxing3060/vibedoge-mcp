import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import { GenerateUserRequest, GenerateUserResponse, MCPUser } from '../types/user.js';
import { ApiResponse } from '../types/api.js';

// 生成用户ID工具
export const GenerateUserTool: Tool = {
  name: 'generate_user',
  description: '为新用户生成唯一标识符和会话令牌',
  inputSchema: {
    type: 'object',
    properties: {
      deviceInfo: {
        type: 'object',
        properties: {
          platform: { type: 'string', description: '平台类型' },
          userAgent: { type: 'string', description: '用户代理' },
          language: { type: 'string', description: '语言设置' },
          timezone: { type: 'string', description: '时区' }
        },
        required: ['platform']
      },
      metadata: {
        type: 'object',
        properties: {
          source: { type: 'string', description: '来源' },
          version: { type: 'string', description: '版本' }
        }
      }
    },
    required: ['deviceInfo']
  }
};

export async function handleGenerateUser(args: GenerateUserRequest): Promise<ApiResponse<GenerateUserResponse>> {
  try {
    const apiClient = new APIClient();
    const response = await apiClient.post<GenerateUserResponse>('/users/generate', args);
    
    return {
      success: true,
      data: response,
      message: '用户创建成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('生成用户失败:', error);
    throw new Error(`生成用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 获取用户信息工具
export const GetUserTool: Tool = {
  name: 'get_user',
  description: '获取指定用户的详细信息',
  inputSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: '用户ID'
      },
      sessionToken: {
        type: 'string',
        description: '会话令牌'
      }
    },
    required: ['userId', 'sessionToken']
  }
};

export async function handleGetUser(args: { userId: string; sessionToken: string }): Promise<ApiResponse<MCPUser>> {
  try {
    const apiClient = new APIClient();
    apiClient.setAuthToken(args.sessionToken);
    
    const response = await apiClient.get<MCPUser>(`/users/${args.userId}`);
    
    return {
      success: true,
      data: response,
      message: '获取用户信息成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw new Error(`获取用户信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 更新用户资料工具
export const UpdateUserProfileTool: Tool = {
  name: 'update_user_profile',
  description: '更新用户个人资料',
  inputSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: '用户ID'
      },
      sessionToken: {
        type: 'string',
        description: '会话令牌'
      },
      profile: {
        type: 'object',
        properties: {
          nickname: { type: 'string', description: '昵称' },
          avatar: { type: 'string', description: '头像URL' },
          preferences: { type: 'object', description: '用户偏好设置' }
        }
      }
    },
    required: ['userId', 'sessionToken', 'profile']
  }
};

export async function handleUpdateUserProfile(args: { userId: string; sessionToken: string; profile: any }): Promise<ApiResponse<void>> {
  try {
    const apiClient = new APIClient();
    apiClient.setAuthToken(args.sessionToken);
    
    await apiClient.put(`/users/${args.userId}/profile`, args.profile);
    
    return {
      success: true,
      message: '用户资料更新成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('更新用户资料失败:', error);
    throw new Error(`更新用户资料失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}