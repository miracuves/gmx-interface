export declare class DatabaseService {
    private logger;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get users(): {
        create: (data: any) => Promise<any>;
        findById: (id: string) => Promise<{
            id: string;
            walletAddress: string;
            role: string;
        }>;
        findByWallet: (wallet: string) => Promise<{
            id: string;
            walletAddress: string;
            role: string;
        }>;
        findByReferralCode: (code: string) => Promise<{
            id: string;
            referralCode: string;
        }>;
        update: (id: string, data: any) => Promise<any>;
    };
    get trades(): {
        create: (data: any) => Promise<any>;
        findById: (id: string) => Promise<{
            id: string;
            sizeUsd: string;
            status: string;
        }>;
        getUserStats: (userId: string) => Promise<{
            totalTrades: number;
            totalVolume: bigint;
            totalPnL: bigint;
            winRate: number;
            averageLeverage: number;
        }>;
    };
    get staking(): {
        getUserStaking: (userId: string) => Promise<{
            stakedGMX: bigint;
            stakedGLP: bigint;
            pendingRewards: bigint;
            totalEarned: bigint;
        }>;
    };
    get referrals(): {
        getUserReferrals: (userId: string) => Promise<{
            referralCode: string;
            referredUsers: number;
            totalCommissions: bigint;
            activeReferrals: number;
        }>;
    };
    get advisors(): {
        create: (data: any) => Promise<any>;
        findById: (id: string) => Promise<{
            id: string;
            advisorCode: string;
            commissionRate: number;
        }>;
        findByUserId: (userId: string) => Promise<{
            id: string;
            userId: string;
            advisorCode: string;
        }>;
        findByCode: (code: string) => Promise<{
            id: string;
            advisorCode: string;
            commissionRate: number;
        }>;
        update: (id: string, data: any) => Promise<any>;
    };
    get advisorClients(): {
        create: (data: any) => Promise<any>;
        findByClient: (clientId: string) => Promise<{
            id: string;
            clientId: string;
            advisorId: string;
        }>;
        findByAdvisor: (advisorId: string) => Promise<{
            id: string;
            clientId: string;
            advisorId: string;
            isActive: boolean;
        }[]>;
        findByClientAndAdvisor: (clientId: string, advisorId: string) => Promise<{
            id: string;
            clientId: string;
            advisorId: string;
            isActive: boolean;
        }>;
        update: (id: string, data: any) => Promise<any>;
    };
    get groupTrades(): {
        create: (data: any) => Promise<any>;
        findByAdvisor: (advisorId: string) => Promise<{
            id: string;
            advisorId: string;
            marketId: string;
            successCount: number;
            totalCount: number;
        }[]>;
    };
    get commissions(): {
        create: (data: any) => Promise<any>;
        getAdvisorEarnings: (advisorId: string, period: string) => Promise<{
            total: bigint;
            breakdown: never[];
            clientCount: number;
            tradeCount: number;
            average: number;
        }>;
    };
    get subAccounts(): {
        create: (data: any) => Promise<any>;
    };
    get accountHistory(): {
        findByUser: (userId: string) => Promise<{
            id: string;
            userId: string;
            action: string;
            timestamp: Date;
        }[]>;
    };
}
//# sourceMappingURL=DatabaseService.d.ts.map