import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from '../services/api-client.js';
import { ApiResponse } from '../types/api.js';
import { AuthContext } from '../middleware/auth.js';
import { Permission } from '../utils/permissions.js';

/**
 * 健康检查响应接口
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    api: ServiceHealth;
    database: ServiceHealth;
    auth: ServiceHealth;
    cache: ServiceHealth;
  };
  metrics: {
    memory: MemoryMetrics;
    cpu: CpuMetrics;
    requests: RequestMetrics;
  };
  dependencies: DependencyHealth[];
}

/**
 * 服务健康状态
 */
export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: Record<string, any>;
}

/**
 * 内存指标
 */
export interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  heap: {
    used: number;
    total: number;
  };
}

/**
 * CPU指标
 */
export interface CpuMetrics {
  usage: number;
  loadAverage: number[];
  cores: number;
}

/**
 * 请求指标
 */
export interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
  requestsPerMinute: number;
}

/**
 * 依赖健康状态
 */
export interface DependencyHealth {
  name: string;
  status: 'up' | 'down' | 'unknown';
  url?: string;
  responseTime?: number;
  error?: string;
}

/**
 * 系统错误类型
 */
export enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  NOT_FOUND_ERROR = 'not_found_error',
  CONFLICT_ERROR = 'conflict_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  INTERNAL_ERROR = 'internal_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  TIMEOUT_ERROR = 'timeout_error',
  NETWORK_ERROR = 'network_error'
}

/**
 * 错误详情接口
 */
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  code: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  stackTrace?: string;
  context?: Record<string, any>;
  suggestions?: string[];
}

/**
 * 健康检查工具
 */
export const HealthCheckTool: Tool = {
  name: 'health_check',
  description: 'Check the health status of the MCP server and its dependencies',
  inputSchema: {
    type: 'object',
    properties: {
      detailed: {
        type: 'boolean',
        description: 'Whether to include detailed metrics and dependency checks',
        default: false
      },
      services: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['api', 'database', 'auth', 'cache', 'all']
        },
        description: 'Specific services to check (default: all)',
        default: ['all']
      }
    },
    additionalProperties: false
  }
};

/**
 * 系统统计工具
 */
export const SystemStatsTool: Tool = {
  name: 'system_stats',
  description: 'Get detailed system statistics and performance metrics',
  inputSchema: {
    type: 'object',
    properties: {
      timeRange: {
        type: 'string',
        enum: ['1h', '6h', '24h', '7d', '30d'],
        description: 'Time range for statistics',
        default: '1h'
      },
      metrics: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['requests', 'errors', 'performance', 'users', 'sessions']
        },
        description: 'Specific metrics to include',
        default: ['requests', 'errors', 'performance']
      }
    },
    additionalProperties: false
  }
};

/**
 * 错误报告工具
 */
export const ErrorReportTool: Tool = {
  name: 'error_report',
  description: 'Report and track system errors',
  inputSchema: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: Object.values(ErrorType)
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          context: {
            type: 'object',
            description: 'Additional error context'
          }
        },
        required: ['type', 'message', 'code']
      },
      severity: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    },
    required: ['error'],
    additionalProperties: false
  }
};

/**
 * 健康检查处理器
 */
export class HealthCheckHandler {
  private apiClient: ApiClient;
  private startTime: Date;
  private requestMetrics: {
    total: number;
    successful: number;
    failed: number;
    responseTimes: number[];
  };
  private errorLog: ErrorDetails[];

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.startTime = new Date();
    this.requestMetrics = {
      total: 0,
      successful: 0,
      failed: 0,
      responseTimes: []
    };
    this.errorLog = [];
  }

  /**
   * 执行健康检查
   * @param params 检查参数
   * @param auth 认证上下文
   * @returns 健康检查结果
   */
  async handleHealthCheck(
    params: { detailed?: boolean; services?: string[] },
    auth?: AuthContext
  ): Promise<ApiResponse<HealthCheckResponse>> {
    try {
      // 检查权限
      if (auth && !auth.permissions.includes(Permission.SYSTEM_HEALTH)) {
        return {
          success: false,
          error: {
            type: ErrorType.AUTHORIZATION_ERROR,
            message: 'Insufficient permissions for health check',
            code: 'HEALTH_CHECK_FORBIDDEN'
          }
        };
      }

      const { detailed = false, services = ['all'] } = params;
      const timestamp = new Date().toISOString();
      const uptime = Date.now() - this.startTime.getTime();

      // 基础健康检查
      const basicHealth: HealthCheckResponse = {
        status: 'healthy',
        timestamp,
        uptime,
        version: '1.0.0',
        services: {
          api: await this.checkApiHealth(),
          database: await this.checkDatabaseHealth(),
          auth: await this.checkAuthHealth(),
          cache: await this.checkCacheHealth()
        },
        metrics: {
          memory: this.getMemoryMetrics(),
          cpu: this.getCpuMetrics(),
          requests: this.getRequestMetrics()
        },
        dependencies: []
      };

      // 详细检查
      if (detailed) {
        basicHealth.dependencies = await this.checkDependencies();
      }

      // 过滤服务
      if (!services.includes('all')) {
        const filteredServices: any = {};
        services.forEach(service => {
          if (service in basicHealth.services) {
            filteredServices[service] = basicHealth.services[service as keyof typeof basicHealth.services];
          }
        });
        basicHealth.services = filteredServices;
      }

      // 确定整体状态
      basicHealth.status = this.determineOverallStatus(basicHealth);

      return {
        success: true,
        data: basicHealth
      };

    } catch (error) {
      const errorDetails = this.createErrorDetails(
        ErrorType.INTERNAL_ERROR,
        'Health check failed',
        'HEALTH_CHECK_ERROR',
        error
      );

      this.logError(errorDetails);

      return {
        success: false,
        error: errorDetails
      };
    }
  }

  /**
   * 获取系统统计信息
   * @param params 统计参数
   * @param auth 认证上下文
   * @returns 统计信息
   */
  async handleSystemStats(
    params: { timeRange?: string; metrics?: string[] },
    auth?: AuthContext
  ): Promise<ApiResponse<any>> {
    try {
      // 检查权限
      if (auth && !auth.permissions.includes(Permission.SYSTEM_STATS)) {
        return {
          success: false,
          error: {
            type: ErrorType.AUTHORIZATION_ERROR,
            message: 'Insufficient permissions for system stats',
            code: 'SYSTEM_STATS_FORBIDDEN'
          }
        };
      }

      const { timeRange = '1h', metrics = ['requests', 'errors', 'performance'] } = params;
      
      const stats: any = {
        timeRange,
        timestamp: new Date().toISOString(),
        data: {}
      };

      // 请求统计
      if (metrics.includes('requests')) {
        stats.data.requests = {
          total: this.requestMetrics.total,
          successful: this.requestMetrics.successful,
          failed: this.requestMetrics.failed,
          successRate: this.requestMetrics.total > 0 
            ? (this.requestMetrics.successful / this.requestMetrics.total) * 100 
            : 0,
          averageResponseTime: this.getAverageResponseTime()
        };
      }

      // 错误统计
      if (metrics.includes('errors')) {
        stats.data.errors = this.getErrorStats(timeRange);
      }

      // 性能统计
      if (metrics.includes('performance')) {
        stats.data.performance = {
          memory: this.getMemoryMetrics(),
          cpu: this.getCpuMetrics(),
          uptime: Date.now() - this.startTime.getTime()
        };
      }

      // 用户统计
      if (metrics.includes('users')) {
        stats.data.users = await this.getUserStats();
      }

      // 会话统计
      if (metrics.includes('sessions')) {
        stats.data.sessions = await this.getSessionStats();
      }

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      const errorDetails = this.createErrorDetails(
        ErrorType.INTERNAL_ERROR,
        'Failed to get system stats',
        'SYSTEM_STATS_ERROR',
        error
      );

      this.logError(errorDetails);

      return {
        success: false,
        error: errorDetails
      };
    }
  }

  /**
   * 处理错误报告
   * @param params 错误参数
   * @param auth 认证上下文
   * @returns 处理结果
   */
  async handleErrorReport(
    params: { error: any; severity?: string },
    auth?: AuthContext
  ): Promise<ApiResponse<{ reportId: string; status: string }>> {
    try {
      const { error, severity = 'medium' } = params;
      
      const errorDetails: ErrorDetails = {
        type: error.type,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        userId: auth?.user?.userId,
        context: error.context || {}
      };

      // 记录错误
      this.logError(errorDetails);

      // 生成报告ID
      const reportId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 根据严重程度采取不同行动
      if (severity === 'critical') {
        // 发送告警通知
        await this.sendCriticalAlert(errorDetails);
      }

      return {
        success: true,
        data: {
          reportId,
          status: 'recorded'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: ErrorType.INTERNAL_ERROR,
          message: 'Failed to report error',
          code: 'ERROR_REPORT_FAILED'
        }
      };
    }
  }

  // 私有方法

  private async checkApiHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      // 这里应该实际检查API健康状态
      // 简化实现
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      // 这里应该实际检查数据库连接
      // 简化实现
      await new Promise(resolve => setTimeout(resolve, 5));
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        details: {
          connections: 10,
          maxConnections: 100
        }
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkAuthHealth(): Promise<ServiceHealth> {
    try {
      return {
        status: 'up',
        responseTime: 1,
        lastCheck: new Date().toISOString(),
        details: {
          activeSessions: 0,
          tokenValidation: 'working'
        }
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkCacheHealth(): Promise<ServiceHealth> {
    try {
      return {
        status: 'up',
        responseTime: 1,
        lastCheck: new Date().toISOString(),
        details: {
          hitRate: 85.5,
          memoryUsage: '45%'
        }
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkDependencies(): Promise<DependencyHealth[]> {
    // 这里应该检查外部依赖
    return [];
  }

  private getMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    
    return {
      used: memUsage.rss,
      total: totalMem,
      percentage: (memUsage.rss / totalMem) * 100,
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal
      }
    };
  }

  private getCpuMetrics(): CpuMetrics {
    const cpus = require('os').cpus();
    const loadAvg = require('os').loadavg();
    
    return {
      usage: 0, // 需要实际计算CPU使用率
      loadAverage: loadAvg,
      cores: cpus.length
    };
  }

  private getRequestMetrics(): RequestMetrics {
    return {
      total: this.requestMetrics.total,
      successful: this.requestMetrics.successful,
      failed: this.requestMetrics.failed,
      averageResponseTime: this.getAverageResponseTime(),
      requestsPerMinute: this.calculateRequestsPerMinute()
    };
  }

  private getAverageResponseTime(): number {
    if (this.requestMetrics.responseTimes.length === 0) return 0;
    
    const sum = this.requestMetrics.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.requestMetrics.responseTimes.length;
  }

  private calculateRequestsPerMinute(): number {
    // 简化实现
    return this.requestMetrics.total;
  }

  private determineOverallStatus(health: HealthCheckResponse): 'healthy' | 'unhealthy' | 'degraded' {
    const services = Object.values(health.services);
    const downServices = services.filter(s => s.status === 'down').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    
    if (downServices > 0) return 'unhealthy';
    if (degradedServices > 0) return 'degraded';
    return 'healthy';
  }

  private createErrorDetails(
    type: ErrorType,
    message: string,
    code: string,
    error?: any
  ): ErrorDetails {
    return {
      type,
      message,
      code,
      timestamp: new Date().toISOString(),
      stackTrace: error instanceof Error ? error.stack : undefined,
      context: error ? { originalError: error.toString() } : undefined
    };
  }

  private logError(error: ErrorDetails): void {
    this.errorLog.push(error);
    
    // 保持错误日志大小
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-500);
    }
    
    console.error('Error logged:', error);
  }

  private getErrorStats(timeRange: string): any {
    const now = Date.now();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const cutoff = now - timeRangeMs;
    
    const recentErrors = this.errorLog.filter(error => 
      new Date(error.timestamp).getTime() > cutoff
    );
    
    const errorsByType = recentErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: recentErrors.length,
      byType: errorsByType,
      recent: recentErrors.slice(-10)
    };
  }

  private parseTimeRange(timeRange: string): number {
    const ranges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    return ranges[timeRange] || ranges['1h'];
  }

  private async getUserStats(): Promise<any> {
    // 这里应该从实际的用户服务获取统计信息
    return {
      total: 0,
      active: 0,
      new: 0
    };
  }

  private async getSessionStats(): Promise<any> {
    // 这里应该从实际的会话服务获取统计信息
    return {
      active: 0,
      total: 0,
      averageDuration: 0
    };
  }

  private async sendCriticalAlert(error: ErrorDetails): Promise<void> {
    // 这里应该实现实际的告警通知逻辑
    console.error('CRITICAL ERROR ALERT:', error);
  }

  // 公共方法用于记录请求指标
  recordRequest(responseTime: number, success: boolean): void {
    this.requestMetrics.total++;
    this.requestMetrics.responseTimes.push(responseTime);
    
    if (success) {
      this.requestMetrics.successful++;
    } else {
      this.requestMetrics.failed++;
    }
    
    // 保持响应时间数组大小
    if (this.requestMetrics.responseTimes.length > 1000) {
      this.requestMetrics.responseTimes = this.requestMetrics.responseTimes.slice(-500);
    }
  }
}