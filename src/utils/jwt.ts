import { JWTPayload } from '../types/session.js';

/**
 * JWT工具类
 * 提供JWT token的生成、验证和解析功能
 */
export class JWTUtils {
  private static readonly SECRET_KEY = process.env.JWT_SECRET || 'vibe-coding-mcp-secret';
  private static readonly ALGORITHM = 'HS256';
  private static readonly DEFAULT_EXPIRES_IN = '24h';

  /**
   * 生成JWT token
   * @param payload JWT载荷数据
   * @param expiresIn 过期时间（默认24小时）
   * @returns JWT token字符串
   */
  static generateToken(payload: JWTPayload, expiresIn: string = this.DEFAULT_EXPIRES_IN): string {
    const header = {
      alg: this.ALGORITHM,
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = this.parseExpiresIn(expiresIn);
    
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + exp,
      iss: 'vibe-coding-mcp'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * 验证JWT token
   * @param token JWT token字符串
   * @returns 验证结果和解析的载荷
   */
  static verifyToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      
      // 验证签名
      const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // 解析载荷
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JWTPayload & {
        iat: number;
        exp: number;
        iss: string;
      };

      // 检查过期时间
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      // 检查发行者
      if (payload.iss !== 'vibe-coding-mcp') {
        return { valid: false, error: 'Invalid issuer' };
      }

      return {
        valid: true,
        payload: {
          userId: payload.userId,
          sessionId: payload.sessionId,
          deviceId: payload.deviceId,
          permissions: payload.permissions
        }
      };
    } catch (error) {
      return { valid: false, error: 'Token parsing failed' };
    }
  }

  /**
   * 解析JWT token（不验证签名）
   * @param token JWT token字符串
   * @returns 解析的载荷
   */
  static parseToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JWTPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查token是否即将过期
   * @param token JWT token字符串
   * @param thresholdMinutes 阈值分钟数（默认30分钟）
   * @returns 是否即将过期
   */
  static isTokenExpiringSoon(token: string, thresholdMinutes: number = 30): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as { exp?: number };
      if (!payload.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const threshold = thresholdMinutes * 60;
      
      return payload.exp - now <= threshold;
    } catch (error) {
      return true;
    }
  }

  /**
   * Base64 URL编码
   */
  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL解码
   */
  private static base64UrlDecode(str: string): string {
    // 补充padding
    str += '='.repeat((4 - str.length % 4) % 4);
    // 替换URL安全字符
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(str, 'base64').toString();
  }

  /**
   * 创建HMAC签名
   */
  private static createSignature(data: string): string {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.SECRET_KEY);
    hmac.update(data);
    return this.base64UrlEncode(hmac.digest('base64'));
  }

  /**
   * 解析过期时间字符串
   */
  private static parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiresIn format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: throw new Error('Invalid time unit');
    }
  }
}

/**
 * JWT中间件类型
 */
export interface JWTMiddleware {
  /**
   * 验证请求中的JWT token
   */
  authenticate(authHeader?: string): {
    success: boolean;
    payload?: JWTPayload;
    error?: string;
  };
}

/**
 * JWT中间件实现
 */
export class JWTAuthMiddleware implements JWTMiddleware {
  /**
   * 验证请求中的JWT token
   * @param authHeader Authorization头部值
   * @returns 验证结果
   */
  authenticate(authHeader?: string): {
    success: boolean;
    payload?: JWTPayload;
    error?: string;
  } {
    if (!authHeader) {
      return { success: false, error: 'Authorization header missing' };
    }

    if (!authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Invalid authorization format' };
    }

    const token = authHeader.substring(7);
    const result = JWTUtils.verifyToken(token);

    if (!result.valid) {
      return { success: false, error: result.error };
    }

    return { success: true, payload: result.payload };
  }
}