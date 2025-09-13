// 导出所有工具
// 用户管理工具
export { GenerateUserTool, handleGenerateUser, GetUserTool, handleGetUser, UpdateUserProfileTool, handleUpdateUserProfile } from './user-management.js';

// 会话管理工具
export { ValidateSessionTool, handleValidateSession, RefreshSessionTool, handleRefreshSession, HeartbeatTool, handleHeartbeat, LogoutTool, handleLogout } from './session-management.js';

// 抽奖相关工具
export { UploadUserProfileTool, handleUploadUserProfile } from './upload-user-profile.js';
export { ParticipateLotteryTool, handleParticipateLottery } from './participate-lottery.js';
export { GetLotteryResultTool, handleGetLotteryResult } from './get-lottery-result.js';
export { GetUserStatsToolTool, handleGetUserStats } from './get-user-stats.js';
export { GetLotteryHistoryTool, handleGetLotteryHistory } from './get-lottery-history.js';
// 健康检查和错误处理工具
export { HealthCheckTool, SystemStatsTool, ErrorReportTool, HealthCheckHandler } from './health-check.js';

// 导出所有响应类型
export type {
  HealthCheckResponse,
  ServiceHealth,
  MemoryMetrics,
  CpuMetrics,
  RequestMetrics,
  DependencyHealth,
  ErrorDetails
} from './health-check.js';

// 导出参数和响应类型
export type { UploadUserProfileParams, UploadUserProfileResponse } from './upload-user-profile.js';
export type { ParticipateLotteryParams, ParticipateLotteryResponse } from './participate-lottery.js';
export type { GetLotteryResultParams, GetLotteryResultResponse } from './get-lottery-result.js';
export type { GetUserStatsParams, GetUserStatsResponse } from './get-user-stats.js';
export type { GetLotteryHistoryParams, GetLotteryHistoryResponse } from './get-lottery-history.js';
export type { HealthCheckParams, HealthCheckResponse } from './health-check.js';