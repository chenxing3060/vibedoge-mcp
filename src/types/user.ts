// 用户相关数据模型定义

export interface MCPUser {
  id: string;           // 用户唯一标识
  createdAt: string;    // 创建时间
  lastActiveAt: string; // 最后活跃时间
  sessionToken: string; // 会话令牌
  profile?: UserProfile; // 用户资料
  status: 'active' | 'inactive' | 'suspended';
  metadata: {
    loginCount: number;
    lotteryParticipations: number;
    communityPosts: number;
  };
}

export interface UserProfile {
  nickname?: string;
  avatar?: string;
  preferences: Record<string, any>;
  lotteryProfile?: LotteryProfile;
}

export interface LotteryProfile {
  basicInfo: BasicInfo;
  skillInfo: SkillInfo;
  socialInfo: SocialInfo;
  interactionInfo: InteractionInfo;
  creativeInfo: CreativeInfo;
  contributionInfo: ContributionInfo;
  learningInfo: LearningInfo;
  investmentInfo: InvestmentInfo;
}

export interface BasicInfo {
  nickname?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  birthYear?: number;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  interests?: string[];
}

export interface SkillInfo {
  programmingLanguages?: string[];
  techLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  projectExperience?: string;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  frameworks?: string[];
  tools?: string[];
}

export interface SocialInfo {
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  discordId?: string;
  telegramHandle?: string;
  personalWebsite?: string;
  blogUrl?: string;
}

export interface InteractionInfo {
  wishContent?: string;
  shareReason?: string;
  referralCode?: string;
  favoriteFeature?: string;
  improvementSuggestion?: string;
  communityContribution?: string;
  helpfulContent?: string;
  mentorshipOffer?: boolean;
}

export interface CreativeInfo {
  lotterySlogan?: string;
  luckyNumber?: number;
  personalTags?: string[];
  motto?: string;
  favoriteQuote?: string;
  dreamProject?: string;
  superpower?: string;
  timeTravel?: string;
}

export interface ContributionInfo {
  platformContribution?: number;
  activityLevel?: 'low' | 'medium' | 'high';
  reputationScore?: number;
  communityRole?: string;
  helpfulAnswers?: number;
  tutorialsCreated?: number;
  bugsReported?: number;
  featureRequests?: number;
}

export interface LearningInfo {
  currentLearning?: string[];
  completedCourses?: string[];
  readingList?: string[];
  learningGoals?: string[];
  skillsToImprove?: string[];
  mentors?: string[];
  learningStyle?: string;
  knowledgeSharing?: boolean;
}

export interface InvestmentInfo {
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentExperience?: string;
  favoriteTokens?: string[];
  tradingStrategy?: string;
  portfolioSize?: 'small' | 'medium' | 'large';
  investmentGoals?: string[];
  marketAnalysis?: string;
  defiExperience?: boolean;
}

// 用户生成请求
export interface GenerateUserRequest {
  deviceInfo: {
    platform: string;
    userAgent: string;
    language: string;
    timezone: string;
  };
  metadata: {
    source: string;
    version: string;
  };
}

// 用户生成响应
export interface GenerateUserResponse {
  user: {
    id: string;
    createdAt: string;
    lastActiveAt: string;
    sessionToken: string;
    expiresAt: string;
  };
  config: {
    sessionDuration: number;
    heartbeatInterval: number;
    features: string[];
  };
}