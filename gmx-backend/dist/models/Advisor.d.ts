export interface Advisor {
    id: string;
    userId: string;
    advisorCode: string;
    commissionRate: number;
    description?: string;
    totalEarnings: bigint;
    totalVolume: bigint;
    totalClients: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Client {
    id: string;
    advisorId: string;
    clientId: string;
    linkedAt: Date;
    isActive: boolean;
    commissionRate: number;
    unlinkedAt?: Date;
    user?: {
        id: string;
        walletAddress: string;
        email: string;
    };
    tradingStats?: any;
}
export interface GroupTradeData {
    advisorId: string;
    marketId: string;
    orderType: 'market' | 'limit' | 'stop' | 'take_profit';
    side: 'long' | 'short';
    sizeUsd: bigint;
    leverage: number;
    price?: bigint;
    stopLoss?: bigint;
    takeProfit?: bigint;
    commissionRate: number;
}
export interface GroupTradeResult {
    groupTradeId: string;
    results: GroupTradeResultItem[];
    successCount: number;
    totalCount: number;
}
export interface GroupTradeResultItem {
    clientId: string;
    success: boolean;
    orderId?: string;
    txHash?: string;
    error?: string;
}
export interface AdvisorRegistration {
    userId: string;
    commissionRate?: number;
    description?: string;
}
export interface AdvisorStats {
    advisorId: string;
    totalClients: number;
    activeClients: number;
    totalEarnings: bigint;
    totalVolume: bigint;
    monthlyEarnings: bigint;
    monthlyVolume: bigint;
    averageCommission: number;
    successRate: number;
}
export interface AdvisorCommission {
    id: string;
    advisorId: string;
    orderId: string;
    commissionAmount: bigint;
    commissionRate: number;
    tradeVolume: bigint;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: Date;
    paidAt?: Date;
}
export interface AdvisorEarningsReport {
    advisorId: string;
    period: string;
    totalEarnings: bigint;
    commissionBreakdown: CommissionBreakdown[];
    clientCount: number;
    tradeCount: number;
    averageCommission: number;
}
export interface CommissionBreakdown {
    clientId: string;
    clientWallet: string;
    totalCommissions: bigint;
    tradeCount: number;
    averageCommission: number;
}
export interface GroupTradeHistory {
    id: string;
    advisorId: string;
    marketId: string;
    orderType: string;
    side: string;
    sizeUsd: bigint;
    leverage: number;
    commissionRate: number;
    results: GroupTradeResultItem[];
    successCount: number;
    totalCount: number;
    createdAt: Date;
}
export interface AdvisorFilters {
    isActive?: boolean;
    minCommissionRate?: number;
    maxCommissionRate?: number;
    minClients?: number;
    maxClients?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface AdvisorAnalytics {
    totalAdvisors: number;
    activeAdvisors: number;
    totalClients: number;
    totalVolume: bigint;
    totalCommissions: bigint;
    averageCommissionRate: number;
    topAdvisors: TopAdvisor[];
    advisorGrowth: AdvisorGrowthData[];
}
export interface TopAdvisor {
    advisorId: string;
    advisorCode: string;
    walletAddress: string;
    totalEarnings: bigint;
    totalClients: number;
    successRate: number;
}
export interface AdvisorGrowthData {
    date: string;
    newAdvisors: number;
    activeAdvisors: number;
    totalClients: number;
}
//# sourceMappingURL=Advisor.d.ts.map