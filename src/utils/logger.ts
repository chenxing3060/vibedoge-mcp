import winston from 'winston';
import { LogLevel } from '../types/index.js';

/**
 * 日志记录器类
 */
export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string = 'App', level: LogLevel = 'info') {
    this.context = context;
    
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
          const stackStr = stack ? `\n${stack}` : '';
          return `${timestamp} [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}${stackStr}`;
        })
      ),
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true
        })
      ],
      exitOnError: false
    });
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  /**
   * 调试日志
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * 信息日志
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * 警告日志
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * 错误日志
   */
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * 创建子日志记录器
   */
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.logger.level as LogLevel);
  }
}