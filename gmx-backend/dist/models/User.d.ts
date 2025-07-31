export type UserRole = 'user' | 'advisor' | 'admin';
export interface User {
    id: string;
    email: string;
    walletAddress: string;
    role: UserRole;
    referralCode?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserProfile extends User {
    tradingStats: TradingStats;
    stakingInfo: StakingInfo;
    referralInfo: ReferralInfo;
}
export interface UserRegistration {
    email: string;
    walletAddress: string;
    referralCode?: string;
}
export interface AuthToken {
    token: string;
    user: {
        id: string;
        email: string;
        walletAddress: string;
        role: UserRole;
    };
}
export interface TradingStats {
    totalTrades: number;
    totalVolume: bigint;
    totalPnL: bigint;
    winRate: number;
    averageLeverage: number;
    openPositions: number;
    closedPositions: number;
    totalFees: bigint;
}
export interface StakingInfo {
    stakedGMX: bigint;
    stakedGLP: bigint;
    pendingRewards: bigint;
    totalEarned: bigint;
    stakingAPY: number;
    glpAPY: number;
    vestingInfo: VestingInfo;
}
export interface VestingInfo {
    totalVested: bigint;
    totalClaimed: bigint;
    pendingVesting: bigint;
    nextVestingDate: Date;
}
export interface ReferralInfo {
    referralCode: string;
    referredUsers: number;
    totalCommissions: bigint;
    activeReferrals: number;
    referralTree: ReferralTree;
    commissionHistory: CommissionHistory[];
}
export interface ReferralTree {
    level1: ReferralEntry[];
    level2: ReferralEntry[];
    level3: ReferralEntry[];
    totalLevels: number;
}
export interface ReferralEntry {
    userId: string;
    walletAddress: string;
    joinedAt: Date;
    totalVolume: bigint;
    totalCommissions: bigint;
    isActive: boolean;
}
export interface CommissionHistory {
    id: string;
    tradeId: string;
    commissionAmount: bigint;
    commissionPercentage: number;
    tradeVolume: bigint;
    timestamp: Date;
    status: 'pending' | 'paid' | 'cancelled';
}
export interface SubAccount {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface AccountHistory {
    id: string;
    userId: string;
    action: string;
    details: any;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}
export interface UserSettings {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    tradingAlerts: boolean;
    liquidationAlerts: boolean;
    rewardAlerts: boolean;
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserSession {
    id: string;
    userId: string;
    token: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    createdAt: Date;
    lastActivity: Date;
}
export interface LoginCredentials {
    walletAddress: string;
    signature: string;
    message: string;
}
export interface ProfileUpdates {
    email?: string;
    referralCode?: string;
    settings?: Partial<UserSettings>;
}
export interface UserFilters {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    topReferrers: TopReferrer[];
    userGrowth: UserGrowthData[];
}
export interface TopReferrer {
    userId: string;
    walletAddress: string;
    referredCount: number;
    totalCommissions: bigint;
}
export interface UserGrowthData {
    date: string;
    newUsers: number;
    activeUsers: number;
}
//# sourceMappingURL=User.d.ts.map