import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIConfig, APIResponse, HTTPError, LogLevel } from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * API客户端类，用于与Vibe Coding抽奖系统API进行通信
 */
export class APIClient {
  private bearerToken: string | undefined;
  private httpClient: AxiosInstance;
  private logger: any;

  constructor(bearerToken?: string) {
    this.bearerToken = bearerToken;
    this.logger = console; // 简化日志处理
    
    this.httpClient = axios.create({
      baseURL: process.env.VIBE_CODING_API_URL || 'http://localhost:3001/api/mcp/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置Bearer Token
   */
  setBearerToken(token: string): void {
    this.bearerToken = token;
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 清除Bearer Token
   */
  clearBearerToken(): void {
    this.bearerToken = undefined;
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.httpClient.interceptors.request.use(
      (config: any) => {
        const startTime = Date.now();
        
        // 添加Bearer Token
        if (this.bearerToken) {
          config.headers.Authorization = `Bearer ${this.bearerToken}`;
        }

        // 添加请求ID用于追踪
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        this.logger.debug(`Request [${requestId}]: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data
        });

        // 存储开始时间用于计算响应时间
        (config as any).startTime = startTime;
        
        return config;
      },
      (error: any) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(this.handleError(error));
      }
    );

    // 响应拦截器
    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration = Date.now() - ((response.config as any).startTime || 0);
        const requestId = response.config.headers['X-Request-ID'];
        
        this.logger.debug(`Response [${requestId}]: ${response.status} (${duration}ms)`, {
          status: response.status,
          data: response.data
        });

        return response;
      },
      (error: any) => {
        const duration = Date.now() - ((error.config as any)?.startTime || 0);
        const requestId = error.config?.headers['X-Request-ID'];
        
        this.logger.error(`Response Error [${requestId}]: ${error.response?.status || 'Network Error'} (${duration}ms)`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 处理错误
   */
  private handleError(error: any): HTTPError {
    const httpError: HTTPError = new Error(error.message || 'Unknown error');
    
    if (error.response) {
      // 服务器响应了错误状态码
      httpError.status = error.response.status;
      httpError.response = {
        data: error.response.data,
        status: error.response.status,
        statusText: error.response.statusText
      };
      httpError.message = error.response.data?.message || error.response.statusText || 'Server Error';
    } else if (error.request) {
      // 请求已发出但没有收到响应
      httpError.message = 'Network Error: No response received';
    } else {
      // 其他错误
      httpError.message = error.message || 'Request setup error';
    }

    return httpError;
  }

  /**
   * 通用GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.httpClient.get<APIResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 通用POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.httpClient.post<APIResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 通用PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.httpClient.put<APIResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 通用DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.httpClient.delete<APIResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success === true;
    } catch (error) {
      this.logger.warn('Health check failed:', error);
      return false;
    }
  }

  /**
   * 获取API版本信息
   */
  async getVersion(): Promise<string | null> {
    try {
      const response = await this.get<{ version: string }>('/version');
      return response.data?.version || null;
    } catch (error) {
      this.logger.warn('Failed to get API version:', error);
      return null;
    }
  }
}