// 会话相关数据模型定义

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  isActive: boolean;
  deviceInfo?: DeviceInfo;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  platform: string;
  userAgent: string;
  language: string;
  timezone: string;
  ipAddress?: string;
}

export interface SessionValidationRequest {
  userId: string;
  sessionToken: string;
}

export interface SessionValidationResponse {
  valid: boolean;
  expiresAt: string;
  refreshed: boolean;
}

export interface MCPContext {
  capabilities: string[];
  tools: string[];
  resources: string[];
  prompts: string[];
  settings: Record<string, any>;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
}