// 基础信息接口
export interface BasicInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

// 技能信息接口
export interface SkillInfo {
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
  experienceYears: number;
  specialties: string[];
  certifications?: string[];
  portfolioUrl?: string;
  githubUrl?: string;
}

// 社交信息接口
export interface SocialInfo {
  twitterHandle?: string;
  linkedinUrl?: string;
  discordUsername?: string;
  telegramUsername?: string;
  wechatId?: string;
  personalWebsite?: string;
  blogUrl?: string;
}

// 互动信息接口
export interface InteractionInfo {
  communityParticipation: number;
  helpfulnessScore: number;
  mentorshipHours?: number;
  eventAttendance: number;
  forumPosts?: number;
  codeReviews?: number;
}

// 创意信息接口
export interface CreativeInfo {
  projectsCompleted: number;
  innovationScore: number;
  designSkills?: string[];
  creativePortfolio?: string[];
  awards?: string[];
  publications?: string[];
}

// 贡献信息接口
export interface ContributionInfo {
  openSourceContributions: number;
  communityContributions: number;
  knowledgeSharing: number;
  volunteerHours?: number;
  donations?: number;
  menteeCount?: number;
}

// 学习信息接口
export interface LearningInfo {
  coursesCompleted: number;
  learningGoals: string[];
  currentLearning?: string[];
  preferredLearningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  skillsToImprove?: string[];
  learningTime?: number; // hours per week
}

// 投资信息接口
export interface InvestmentInfo {
  investmentExperience: number;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentGoals?: string[];
  portfolioValue?: number;
  cryptoExperience?: boolean;
  tradingFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
}

// 用户资料数据接口
export interface UserProfileData {
  userId: string;
  basicInfo: BasicInfo;
  skillInfo: SkillInfo;
  socialInfo?: SocialInfo | undefined;
  interactionInfo?: InteractionInfo | undefined;
  creativeInfo?: CreativeInfo | undefined;
  contributionInfo?: ContributionInfo | undefined;
  learningInfo?: LearningInfo | undefined;
  investmentInfo?: InvestmentInfo | undefined;
}

// 抽奖参与数据接口
export interface LotteryParticipationData {
  userId: string;
  lotteryId: string;
  participationType: 'normal' | 'skill' | 'creative';
  additionalData?: {
    skillChallenge?: string;
    creativeSubmission?: string;
  };
}

// API响应格式接口
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// MCP工具定义接口
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

// 工具调用记录接口
export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  calledAt: Date;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
}

// API配置接口
export interface APIConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
    'Authorization'?: string;
  };
}

// MCP服务器配置接口
export interface MCPServerConfig {
  name: string;
  version: string;
  apiBaseURL: string;
  defaultTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
}

// 用户资料上传响应接口
export interface UserProfileUploadResponse {
  success: boolean;
  profileId: string;
  completeness: number;
  bonusWeight: number;
}

export interface LotteryResultResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UserHistoryResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface LotteryActivitiesResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface LotteryStatsResponse {
  success: boolean;
  message: string;
  data?: any;
}

// 抽奖参与响应接口
export interface LotteryParticipationResponse {
  success: boolean;
  participationId: string;
  ticketNumber: string;
  winningProbability: number;
}

// 抽奖结果接口
export interface LotteryResult {
  success: boolean;
  lotteryId: string;
  status: string;
  winners: Array<{
    userId: string;
    ticketNumber: string;
    prize: string;
    winningTime: string;
  }>;
  totalParticipants: number;
  drawTime: string;
}

// 用户历史记录接口
export interface UserHistory {
  success: boolean;
  totalParticipations: number;
  totalWins: number;
  winRate: number;
  history: Array<{
    lotteryId: string;
    lotteryName: string;
    participatedAt: string;
    result: 'pending' | 'won' | 'lost';
    prize?: string;
  }>;
}

// 抽奖活动接口
export interface LotteryActivity {
  lotteryId: string;
  name: string;
  description: string;
  type: 'normal' | 'skill' | 'creative';
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  prizes: Array<{
    rank: number;
    description: string;
    value: string;
    quantity: number;
  }>;
  participantCount: number;
  maxParticipants?: number;
}

// 抽奖活动列表响应接口
export interface LotteryActivitiesResponse {
  success: boolean;
  activities: LotteryActivity[];
}

// 抽奖统计信息接口
export interface LotteryStats {
  success: boolean;
  totalParticipants: number;
  averageWeight: number;
  participationTrend: Array<{
    date: string;
    count: number;
  }>;
  topContributors: Array<{
    userId: string;
    username: string;
    weight: number;
    contributions: number;
  }>;
}

// 工具参数接口
export interface UploadUserProfileParams {
  userId: string;
  basicInfo: BasicInfo;
  skillInfo: SkillInfo;
  socialInfo?: SocialInfo;
  interactionInfo?: InteractionInfo;
  creativeInfo?: CreativeInfo;
  contributionInfo?: ContributionInfo;
  learningInfo?: LearningInfo;
  investmentInfo?: InvestmentInfo;
  bearerToken: string;
}

export interface ParticipateLotteryParams {
  userId: string;
  activityId: string;
  participationType: 'normal' | 'skill' | 'creative';
  skillChallenge?: string;
  creativeSubmission?: string;
  additionalData?: any;
}

export interface GetLotteryResultParams {
  activityId: string;
  userId?: string;
}

export interface GetUserHistoryParams {
  userId: string;
  page?: number;
  limit?: number;
  status?: 'all' | 'won' | 'lost' | 'pending';
  startDate?: string;
  endDate?: string;
}

export interface ListLotteryActivitiesParams {
  status?: 'active' | 'upcoming' | 'ended' | 'all';
  category?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetLotteryStatsParams {
  activityId?: string;
  userId?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

// HTTP错误接口
export interface HTTPError extends Error {
  status?: number;
  response?: {
    data?: any;
    status: number;
    statusText: string;
  };
}

// 日志级别类型
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 工具执行结果接口
export interface ToolExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string | undefined;
    details?: any;
  };
}