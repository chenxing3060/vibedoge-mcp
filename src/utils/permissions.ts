/**
 * 权限定义
 */
export enum Permission {
  // 用户管理权限
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  
  // 会话管理权限
  SESSION_READ = 'session:read',
  SESSION_WRITE = 'session:write',
  SESSION_DELETE = 'session:delete',
  
  // 抽奖系统权限
  LOTTERY_READ = 'lottery:read',
  LOTTERY_WRITE = 'lottery:write',
  LOTTERY_PARTICIPATE = 'lottery:participate',
  LOTTERY_ADMIN = 'lottery:admin',
  
  // 系统管理权限
  SYSTEM_HEALTH = 'system:health',
  SYSTEM_STATS = 'system:stats',
  SYSTEM_ADMIN = 'system:admin',
  
  // 数据访问权限
  DATA_READ = 'data:read',
  DATA_WRITE = 'data:write',
  DATA_DELETE = 'data:delete',
  
  // API访问权限
  API_ACCESS = 'api:access',
  API_ADMIN = 'api:admin'
}

/**
 * 角色定义
 */
export enum Role {
  GUEST = 'guest',
  USER = 'user',
  PREMIUM_USER = 'premium_user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

/**
 * 角色权限映射
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.GUEST]: [
    Permission.LOTTERY_READ,
    Permission.SYSTEM_HEALTH
  ],
  
  [Role.USER]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.SESSION_READ,
    Permission.SESSION_WRITE,
    Permission.LOTTERY_READ,
    Permission.LOTTERY_PARTICIPATE,
    Permission.SYSTEM_HEALTH,
    Permission.API_ACCESS
  ],
  
  [Role.PREMIUM_USER]: [
    ...ROLE_PERMISSIONS[Role.USER],
    Permission.DATA_READ,
    Permission.SYSTEM_STATS
  ],
  
  [Role.MODERATOR]: [
    ...ROLE_PERMISSIONS[Role.PREMIUM_USER],
    Permission.USER_DELETE,
    Permission.SESSION_DELETE,
    Permission.LOTTERY_WRITE,
    Permission.DATA_WRITE
  ],
  
  [Role.ADMIN]: [
    ...ROLE_PERMISSIONS[Role.MODERATOR],
    Permission.LOTTERY_ADMIN,
    Permission.SYSTEM_ADMIN,
    Permission.DATA_DELETE,
    Permission.API_ADMIN
  ],
  
  [Role.SUPER_ADMIN]: [
    ...Object.values(Permission)
  ]
};

/**
 * 权限管理器
 */
export class PermissionManager {
  /**
   * 检查用户是否具有指定权限
   * @param userPermissions 用户权限列表
   * @param requiredPermission 需要的权限
   * @returns 是否具有权限
   */
  static hasPermission(userPermissions: string[], requiredPermission: Permission): boolean {
    return userPermissions.includes(requiredPermission);
  }

  /**
   * 检查用户是否具有任一权限
   * @param userPermissions 用户权限列表
   * @param requiredPermissions 需要的权限列表（任一即可）
   * @returns 是否具有权限
   */
  static hasAnyPermission(userPermissions: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * 检查用户是否具有所有权限
   * @param userPermissions 用户权限列表
   * @param requiredPermissions 需要的权限列表（全部必须）
   * @returns 是否具有权限
   */
  static hasAllPermissions(userPermissions: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * 根据角色获取权限列表
   * @param role 用户角色
   * @returns 权限列表
   */
  static getPermissionsByRole(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * 根据多个角色获取合并的权限列表
   * @param roles 用户角色列表
   * @returns 权限列表
   */
  static getPermissionsByRoles(roles: Role[]): Permission[] {
    const permissions = new Set<Permission>();
    
    roles.forEach(role => {
      const rolePermissions = this.getPermissionsByRole(role);
      rolePermissions.forEach(permission => permissions.add(permission));
    });
    
    return Array.from(permissions);
  }

  /**
   * 检查角色是否具有指定权限
   * @param role 用户角色
   * @param requiredPermission 需要的权限
   * @returns 是否具有权限
   */
  static roleHasPermission(role: Role, requiredPermission: Permission): boolean {
    const permissions = this.getPermissionsByRole(role);
    return permissions.includes(requiredPermission);
  }

  /**
   * 获取用户可访问的资源列表
   * @param userPermissions 用户权限列表
   * @returns 可访问的资源
   */
  static getAccessibleResources(userPermissions: string[]): {
    users: boolean;
    sessions: boolean;
    lottery: boolean;
    system: boolean;
    data: boolean;
    api: boolean;
  } {
    return {
      users: this.hasAnyPermission(userPermissions, [
        Permission.USER_READ,
        Permission.USER_WRITE,
        Permission.USER_DELETE
      ]),
      sessions: this.hasAnyPermission(userPermissions, [
        Permission.SESSION_READ,
        Permission.SESSION_WRITE,
        Permission.SESSION_DELETE
      ]),
      lottery: this.hasAnyPermission(userPermissions, [
        Permission.LOTTERY_READ,
        Permission.LOTTERY_WRITE,
        Permission.LOTTERY_PARTICIPATE,
        Permission.LOTTERY_ADMIN
      ]),
      system: this.hasAnyPermission(userPermissions, [
        Permission.SYSTEM_HEALTH,
        Permission.SYSTEM_STATS,
        Permission.SYSTEM_ADMIN
      ]),
      data: this.hasAnyPermission(userPermissions, [
        Permission.DATA_READ,
        Permission.DATA_WRITE,
        Permission.DATA_DELETE
      ]),
      api: this.hasAnyPermission(userPermissions, [
        Permission.API_ACCESS,
        Permission.API_ADMIN
      ])
    };
  }

  /**
   * 验证权限字符串格式
   * @param permission 权限字符串
   * @returns 是否有效
   */
  static isValidPermission(permission: string): boolean {
    return Object.values(Permission).includes(permission as Permission);
  }

  /**
   * 验证角色字符串格式
   * @param role 角色字符串
   * @returns 是否有效
   */
  static isValidRole(role: string): boolean {
    return Object.values(Role).includes(role as Role);
  }

  /**
   * 获取权限的层级关系
   * @param permission 权限
   * @returns 权限层级信息
   */
  static getPermissionHierarchy(permission: Permission): {
    category: string;
    action: string;
    level: 'read' | 'write' | 'delete' | 'admin';
  } {
    const [category, action] = permission.split(':');
    
    let level: 'read' | 'write' | 'delete' | 'admin';
    if (action === 'read') level = 'read';
    else if (action === 'write') level = 'write';
    else if (action === 'delete') level = 'delete';
    else level = 'admin';
    
    return { category, action, level };
  }

  /**
   * 检查权限是否包含另一个权限
   * @param higherPermission 高级权限
   * @param lowerPermission 低级权限
   * @returns 是否包含
   */
  static permissionIncludes(higherPermission: Permission, lowerPermission: Permission): boolean {
    const higher = this.getPermissionHierarchy(higherPermission);
    const lower = this.getPermissionHierarchy(lowerPermission);
    
    // 必须是同一类别
    if (higher.category !== lower.category) {
      return false;
    }
    
    // 权限级别检查
    const levelOrder = ['read', 'write', 'delete', 'admin'];
    const higherIndex = levelOrder.indexOf(higher.level);
    const lowerIndex = levelOrder.indexOf(lower.level);
    
    return higherIndex >= lowerIndex;
  }
}

/**
 * 权限装饰器（用于方法级权限控制）
 */
export function RequirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // 这里应该从上下文中获取用户权限
      // 实际实现中需要根据具体的认证机制来获取用户信息
      const userPermissions = this.getUserPermissions?.() || [];
      
      if (!PermissionManager.hasPermission(userPermissions, permission)) {
        throw new Error(`Permission denied: ${permission} required`);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 角色装饰器（用于方法级角色控制）
 */
export function RequireRole(role: Role) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // 这里应该从上下文中获取用户角色
      const userRole = this.getUserRole?.();
      
      if (userRole !== role) {
        throw new Error(`Role denied: ${role} required`);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: Permission[];
  userPermissions?: string[];
}

/**
 * 权限检查器
 */
export class PermissionChecker {
  /**
   * 执行权限检查
   * @param userPermissions 用户权限
   * @param requiredPermissions 需要的权限
   * @param requireAll 是否需要全部权限
   * @returns 检查结果
   */
  static check(
    userPermissions: string[],
    requiredPermissions: Permission[],
    requireAll: boolean = false
  ): PermissionCheckResult {
    const hasPermission = requireAll
      ? PermissionManager.hasAllPermissions(userPermissions, requiredPermissions)
      : PermissionManager.hasAnyPermission(userPermissions, requiredPermissions);
    
    if (hasPermission) {
      return { allowed: true };
    }
    
    const missingPermissions = requiredPermissions.filter(permission => 
      !userPermissions.includes(permission)
    );
    
    return {
      allowed: false,
      reason: requireAll 
        ? `Missing required permissions: ${missingPermissions.join(', ')}`
        : `Missing any of required permissions: ${requiredPermissions.join(', ')}`,
      requiredPermissions,
      userPermissions
    };
  }
}