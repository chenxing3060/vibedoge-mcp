import { JWTUtils, JWTPayload } from '../utils/jwt.js';
import { PermissionManager, Permission, Role, PermissionChecker } from '../utils/permissions.js';
import { SecurityUtils } from '../utils/security.js';
import { MCPUser } from '../types/user.js';
import { Session } from '../types/session.js';

/**
 * 认证上下文
 */
export interface AuthContext {
  user?: MCPUser;
  session?: Session;
  permissions: string[];
  roles: Role[];
  isAuthenticated: boolean;
  token?: string;
}

/**
 * 认证请求接口
 */
export interface AuthenticatedRequest {
  headers: Record<string, string>;
  body?: any;
  auth?: AuthContext;
}

/**
 * 认证响应接口
 */
export interface AuthResponse {
  success: boolean;
  message?: string;
  context?: AuthContext;
  error?: string;
}

/**
 * 认证中间件配置
 */
export interface AuthMiddlewareConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  skipPaths?: string[];
  requiredPermissions?: Permission[];
  requiredRoles?: Role[];
  allowGuest?: boolean;
}

/**
 * 认证中间件类
 */
export class AuthMiddleware {
  private jwtUtils: JWTUtils;
  private config: AuthMiddlewareConfig;
  private userStore: Map<string, MCPUser> = new Map();
  private sessionStore: Map<string, Session> = new Map();

  constructor(config: AuthMiddlewareConfig) {
    this.config = config;
    this.jwtUtils = new JWTUtils(config.jwtSecret, config.tokenExpiry);
  }

  /**
   * 主要认证中间件方法
   * @param request 请求对象
   * @returns 认证响应
   */
  async authenticate(request: AuthenticatedRequest): Promise<AuthResponse> {
    try {
      // 检查是否跳过认证
      if (this.shouldSkipAuth(request)) {
        return this.createGuestContext(request);
      }

      // 提取token
      const token = this.extractToken(request);
      if (!token) {
        if (this.config.allowGuest) {
          return this.createGuestContext(request);
        }
        return {
          success: false,
          error: 'Authentication token required'
        };
      }

      // 验证token
      const payload = await this.jwtUtils.verifyToken(token);
      if (!payload) {
        return {
          success: false,
          error: 'Invalid or expired token'
        };
      }

      // 获取用户信息
      const user = await this.getUserById(payload.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return {
          success: false,
          error: 'User account is not active'
        };
      }

      // 获取会话信息
      const session = await this.getSessionById(payload.sessionId);
      if (!session || !session.isValid) {
        return {
          success: false,
          error: 'Invalid session'
        };
      }

      // 创建认证上下文
      const context = await this.createAuthContext(user, session, token);
      
      // 检查权限
      const permissionCheck = this.checkPermissions(context);
      if (!permissionCheck.success) {
        return permissionCheck;
      }

      // 更新会话活动时间
      await this.updateSessionActivity(session.sessionId);

      request.auth = context;
      return {
        success: true,
        context
      };

    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 检查是否应该跳过认证
   * @param request 请求对象
   * @returns 是否跳过
   */
  private shouldSkipAuth(request: AuthenticatedRequest): boolean {
    if (!this.config.skipPaths) return false;
    
    // 这里需要根据实际的路径匹配逻辑来实现
    // 由于MCP协议的特殊性，这里简化处理
    return false;
  }

  /**
   * 提取认证token
   * @param request 请求对象
   * @returns token字符串
   */
  private extractToken(request: AuthenticatedRequest): string | null {
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // 也可以从其他地方获取token，如cookie或自定义header
    return request.headers['x-auth-token'] || null;
  }

  /**
   * 根据用户ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  private async getUserById(userId: string): Promise<MCPUser | null> {
    // 从内存存储中获取（实际应用中应该从数据库获取）
    return this.userStore.get(userId) || null;
  }

  /**
   * 根据会话ID获取会话信息
   * @param sessionId 会话ID
   * @returns 会话信息
   */
  private async getSessionById(sessionId: string): Promise<Session | null> {
    // 从内存存储中获取（实际应用中应该从数据库获取）
    return this.sessionStore.get(sessionId) || null;
  }

  /**
   * 创建认证上下文
   * @param user 用户信息
   * @param session 会话信息
   * @param token 认证token
   * @returns 认证上下文
   */
  private async createAuthContext(
    user: MCPUser, 
    session: Session, 
    token: string
  ): Promise<AuthContext> {
    const roles = user.profile?.roles || [Role.USER];
    const permissions = PermissionManager.getPermissionsByRoles(roles);
    
    return {
      user,
      session,
      permissions: permissions.map(p => p.toString()),
      roles,
      isAuthenticated: true,
      token
    };
  }

  /**
   * 创建访客上下文
   * @param request 请求对象
   * @returns 认证响应
   */
  private createGuestContext(request: AuthenticatedRequest): AuthResponse {
    const guestPermissions = PermissionManager.getPermissionsByRole(Role.GUEST);
    
    const context: AuthContext = {
      permissions: guestPermissions.map(p => p.toString()),
      roles: [Role.GUEST],
      isAuthenticated: false
    };
    
    request.auth = context;
    
    return {
      success: true,
      context
    };
  }

  /**
   * 检查权限
   * @param context 认证上下文
   * @returns 权限检查结果
   */
  private checkPermissions(context: AuthContext): AuthResponse {
    // 检查必需的权限
    if (this.config.requiredPermissions && this.config.requiredPermissions.length > 0) {
      const permissionCheck = PermissionChecker.check(
        context.permissions,
        this.config.requiredPermissions,
        true // 需要所有权限
      );
      
      if (!permissionCheck.allowed) {
        return {
          success: false,
          error: permissionCheck.reason
        };
      }
    }
    
    // 检查必需的角色
    if (this.config.requiredRoles && this.config.requiredRoles.length > 0) {
      const hasRequiredRole = this.config.requiredRoles.some(role => 
        context.roles.includes(role)
      );
      
      if (!hasRequiredRole) {
        return {
          success: false,
          error: `Required role not found. Need one of: ${this.config.requiredRoles.join(', ')}`
        };
      }
    }
    
    return { success: true };
  }

  /**
   * 更新会话活动时间
   * @param sessionId 会话ID
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.sessionStore.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.sessionStore.set(sessionId, session);
    }
  }

  /**
   * 登录用户
   * @param userId 用户ID
   * @param password 密码
   * @param deviceInfo 设备信息
   * @returns 登录结果
   */
  async login(
    userId: string, 
    password: string, 
    deviceInfo?: any
  ): Promise<{
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: MCPUser;
    session?: Session;
    error?: string;
  }> {
    try {
      // 获取用户信息
      const user = await this.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // 验证密码
      const isValidPassword = await SecurityUtils.verifyPassword(
        password, 
        user.profile?.passwordHash || ''
      );
      
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return {
          success: false,
          error: 'Account is not active'
        };
      }

      // 创建会话
      const session = await this.createSession(user, deviceInfo);
      
      // 生成token
      const payload: JWTPayload = {
        userId: user.userId,
        sessionId: session.sessionId,
        roles: user.profile?.roles || [Role.USER],
        permissions: PermissionManager.getPermissionsByRoles(user.profile?.roles || [Role.USER])
      };
      
      const token = await this.jwtUtils.generateToken(payload);
      const refreshToken = await this.jwtUtils.generateRefreshToken(payload);

      return {
        success: true,
        token,
        refreshToken,
        user,
        session
      };

    } catch (error) {
      return {
        success: false,
        error: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 创建会话
   * @param user 用户信息
   * @param deviceInfo 设备信息
   * @returns 会话信息
   */
  private async createSession(user: MCPUser, deviceInfo?: any): Promise<Session> {
    const sessionId = SecurityUtils.generateSecureId();
    const now = new Date();
    
    const session: Session = {
      sessionId,
      userId: user.userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24小时后过期
      isValid: true,
      deviceInfo: deviceInfo || {},
      metadata: {
        loginTime: now.toISOString(),
        userAgent: deviceInfo?.userAgent || 'Unknown',
        ipAddress: deviceInfo?.ipAddress || 'Unknown'
      }
    };
    
    this.sessionStore.set(sessionId, session);
    return session;
  }

  /**
   * 登出用户
   * @param sessionId 会话ID
   * @returns 登出结果
   */
  async logout(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessionStore.get(sessionId);
      if (session) {
        session.isValid = false;
        this.sessionStore.set(sessionId, session);
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 刷新token
   * @param refreshToken 刷新token
   * @returns 新的token
   */
  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      const payload = await this.jwtUtils.verifyRefreshToken(refreshToken);
      if (!payload) {
        return {
          success: false,
          error: 'Invalid refresh token'
        };
      }

      // 检查会话是否仍然有效
      const session = await this.getSessionById(payload.sessionId);
      if (!session || !session.isValid) {
        return {
          success: false,
          error: 'Session expired'
        };
      }

      // 生成新的访问token
      const newToken = await this.jwtUtils.generateToken(payload);
      
      return {
        success: true,
        token: newToken
      };
    } catch (error) {
      return {
        success: false,
        error: `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 添加用户到存储（用于测试）
   * @param user 用户信息
   */
  addUser(user: MCPUser): void {
    this.userStore.set(user.userId, user);
  }

  /**
   * 获取所有活跃会话
   * @param userId 用户ID（可选）
   * @returns 会话列表
   */
  getActiveSessions(userId?: string): Session[] {
    const sessions = Array.from(this.sessionStore.values());
    
    return sessions.filter(session => {
      if (!session.isValid) return false;
      if (session.expiresAt < new Date()) return false;
      if (userId && session.userId !== userId) return false;
      return true;
    });
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.expiresAt < now || !session.isValid) {
        this.sessionStore.delete(sessionId);
      }
    }
  }

  /**
   * 获取认证统计信息
   * @returns 统计信息
   */
  getAuthStats(): {
    totalUsers: number;
    activeSessions: number;
    expiredSessions: number;
  } {
    const activeSessions = this.getActiveSessions();
    const allSessions = Array.from(this.sessionStore.values());
    
    return {
      totalUsers: this.userStore.size,
      activeSessions: activeSessions.length,
      expiredSessions: allSessions.length - activeSessions.length
    };
  }
}

/**
 * 权限检查装饰器工厂
 * @param permissions 需要的权限
 * @returns 装饰器函数
 */
export function RequireAuth(permissions?: Permission[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const request = args[0] as AuthenticatedRequest;
      
      if (!request.auth?.isAuthenticated) {
        throw new Error('Authentication required');
      }
      
      if (permissions && permissions.length > 0) {
        const hasPermission = PermissionManager.hasAllPermissions(
          request.auth.permissions,
          permissions
        );
        
        if (!hasPermission) {
          throw new Error(`Insufficient permissions. Required: ${permissions.join(', ')}`);
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}