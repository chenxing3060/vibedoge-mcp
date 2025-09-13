// API响应相关数据模型定义

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 抽奖相关响应
export interface ParticipationResult {
  participationId: string;
  ticketNumber: string;
  winningProbability: number;
}

export interface LotteryResult {
  lotteryId: string;
  status: 'pending' | 'completed' | 'cancelled';
  winners: Array<{
    userId: string;
    nickname: string;
    prize: string;
    winningTime: string;
  }>;
  totalParticipants: number;
  drawTime: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  qualityScore: number;
}