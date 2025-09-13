import { randomBytes, createHash, timingSafeEqual } from 'crypto';

/**
 * 安全工具类
 * 提供密码哈希、随机ID生成、数据验证等安全功能
 */
export class SecurityUtils {
  /**
   * 生成随机用户ID
   * @returns 32位随机用户ID
   */
  static generateUserId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * 生成随机会话ID
   * @returns 64位随机会话ID
   */
  static generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 生成随机设备ID
   * @returns 32位随机设备ID
   */
  static generateDeviceId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * 生成随机API密钥
   * @returns 64位随机API密钥
   */
  static generateApiKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 生成随机盐值
   * @param length 盐值长度（字节数，默认16）
   * @returns 随机盐值
   */
  static generateSalt(length: number = 16): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * 哈希密码
   * @param password 原始密码
   * @param salt 盐值（可选，不提供则自动生成）
   * @returns 哈希结果对象
   */
  static hashPassword(password: string, salt?: string): {
    hash: string;
    salt: string;
  } {
    const actualSalt = salt || this.generateSalt();
    const hash = createHash('sha256')
      .update(password + actualSalt)
      .digest('hex');
    
    return { hash, salt: actualSalt };
  }

  /**
   * 验证密码
   * @param password 原始密码
   * @param hash 存储的哈希值
   * @param salt 存储的盐值
   * @returns 是否匹配
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    
    // 使用时间安全的比较函数防止时序攻击
    return timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  }

  /**
   * 生成数据签名
   * @param data 要签名的数据
   * @param secret 签名密钥
   * @returns 签名字符串
   */
  static signData(data: string, secret: string): string {
    return createHash('sha256')
      .update(data + secret)
      .digest('hex');
  }

  /**
   * 验证数据签名
   * @param data 原始数据
   * @param signature 签名
   * @param secret 签名密钥
   * @returns 是否有效
   */
  static verifySignature(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.signData(data, secret);
    
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @param charset 字符集（默认为字母数字）
   * @returns 随机字符串
   */
  static generateRandomString(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    const bytes = randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    
    return result;
  }

  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @returns 是否有效
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证用户名格式
   * @param username 用户名
   * @returns 是否有效
   */
  static isValidUsername(username: string): boolean {
    // 用户名：3-20位，只能包含字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 验证结果
   */
  static validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length < 8) {
      issues.push('密码长度至少8位');
    } else {
      score += 1;
    }

    // 包含小写字母
    if (!/[a-z]/.test(password)) {
      issues.push('密码必须包含小写字母');
    } else {
      score += 1;
    }

    // 包含大写字母
    if (!/[A-Z]/.test(password)) {
      issues.push('密码必须包含大写字母');
    } else {
      score += 1;
    }

    // 包含数字
    if (!/\d/.test(password)) {
      issues.push('密码必须包含数字');
    } else {
      score += 1;
    }

    // 包含特殊字符
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('密码必须包含特殊字符');
    } else {
      score += 1;
    }

    return {
      valid: issues.length === 0,
      score,
      issues
    };
  }

  /**
   * 清理和验证输入数据
   * @param input 输入字符串
   * @param maxLength 最大长度
   * @returns 清理后的字符串
   */
  static sanitizeInput(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>"'&]/g, ''); // 移除潜在的XSS字符
  }

  /**
   * 生成CSRF令牌
   * @returns CSRF令牌
   */
  static generateCSRFToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 验证CSRF令牌
   * @param token 提供的令牌
   * @param expectedToken 期望的令牌
   * @returns 是否有效
   */
  static verifyCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  }

  /**
   * 生成安全的随机数
   * @param min 最小值
   * @param max 最大值
   * @returns 随机数
   */
  static secureRandomInt(min: number, max: number): number {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % range);

    let randomValue;
    do {
      const randomBytes = require('crypto').randomBytes(bytesNeeded);
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = randomValue * 256 + randomBytes[i];
      }
    } while (randomValue >= threshold);

    return min + (randomValue % range);
  }
}

/**
 * 速率限制器
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * 检查是否允许请求
   * @param identifier 标识符（如IP地址、用户ID）
   * @returns 是否允许
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 获取或创建请求记录
    let requests = this.requests.get(identifier) || [];
    
    // 清理过期的请求记录
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // 检查是否超过限制
    if (requests.length >= this.maxRequests) {
      return false;
    }

    // 记录新请求
    requests.push(now);
    this.requests.set(identifier, requests);

    return true;
  }

  /**
   * 清理过期的记录
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}