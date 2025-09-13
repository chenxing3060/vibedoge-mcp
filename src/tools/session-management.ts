import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { APIClient } from '../services/api-client.js';
import { SessionValidationRequest, SessionValidationResponse } from '../types/session.js';
import { ApiResponse } from '../types/api.js';

// 验证会话工具
export const ValidateSessionTool: Tool = {
  name: 'validate_session',
  description: '验证用户会话的有效性',
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

export async function handleValidateSession(args: SessionValidationRequest): Promise<ApiResponse<SessionValidationResponse>> {
  try {
    const apiClient = new APIClient();
    const response = await apiClient.post<SessionValidationResponse>('/sessions/validate', args);
    
    return {
      success: true,
      data: response,
      message: '会话验证成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('会话验证失败:', error);
    throw new Error(`会话验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 刷新会话工具
export const RefreshSessionTool: Tool = {
  name: 'refresh_session',
  description: '刷新用户会话令牌',
  inputSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: '用户ID'
      },
      sessionToken: {
        type: 'string',
        description: '当前会话令牌'
      }
    },
    required: ['userId', 'sessionToken']
  }
};

export async function handleRefreshSession(args: { userId: string; sessionToken: string }): Promise<ApiResponse<{ sessionToken: string; expiresAt: string }>> {
  try {
    const apiClient = new APIClient();
    apiClient.setAuthToken(args.sessionToken);
    
    const response = await apiClient.post<{ sessionToken: string; expiresAt: string }>('/sessions/refresh', {
      userId: args.userId
    });
    
    return {
      success: true,
      data: response,
      message: '会话刷新成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('会话刷新失败:', error);
    throw new Error(`会话刷新失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 心跳检测工具
export const HeartbeatTool: Tool = {
  name: 'heartbeat',
  description: '发送心跳信号保持会话活跃',
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

export async function handleHeartbeat(args: { userId: string; sessionToken: string }): Promise<ApiResponse<{ lastActiveAt: string }>> {
  try {
    const apiClient = new APIClient();
    apiClient.setAuthToken(args.sessionToken);
    
    const response = await apiClient.post<{ lastActiveAt: string }>('/sessions/heartbeat', {
      userId: args.userId
    });
    
    return {
      success: true,
      data: response,
      message: '心跳检测成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('心跳检测失败:', error);
    throw new Error(`心跳检测失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 注销会话工具
export const LogoutTool: Tool = {
  name: 'logout',
  description: '注销用户会话',
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

export async function handleLogout(args: { userId: string; sessionToken: string }): Promise<ApiResponse<void>> {
  try {
    const apiClient = new APIClient();
    apiClient.setAuthToken(args.sessionToken);
    
    await apiClient.post('/sessions/logout', {
      userId: args.userId
    });
    
    return {
      success: true,
      message: '注销成功',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('注销失败:', error);
    throw new Error(`注销失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}