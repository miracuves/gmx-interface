export type AdvisorInfo = {
  advisorId: string;
  advisorAddress: string;
  affiliateLink: string;
  totalLinkedAccounts: number;
  totalCommissions: bigint;
  totalVolume: bigint;
  isActive: boolean;
  createdAt: number;
};

export type UserAdvisorLink = {
  userId: string;
  advisorId: string;
  linkedAt: number;
  isActive: boolean;
  totalCommissions: bigint;
  totalVolume: bigint;
};

export type AdvisorCommission = {
  advisorId: string;
  userId: string;
  tradeId: string;
  commissionAmount: bigint;
  commissionPercentage: number; // e.g., 30 for 30%
  tradeVolume: bigint;
  timestamp: number;
  transactionHash: string;
};

export type AdvisorStats = {
  advisorId: string;
  totalLinkedAccounts: number;
  activeLinkedAccounts: number;
  totalCommissions: bigint;
  totalVolume: bigint;
  monthlyCommissions: bigint;
  monthlyVolume: bigint;
  linkedAccounts: UserAdvisorLink[];
  recentCommissions: AdvisorCommission[];
};

export type GroupTradeRequest = {
  advisorId: string;
  action: 'open' | 'close';
  market: string;
  side: 'long' | 'short';
  sizePercentage?: number; // percentage of available balance
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  targetAccounts?: string[]; // specific accounts, if empty applies to all
};

export type GroupTradeResult = {
  successCount: number;
  failureCount: number;
  totalVolume: bigint;
  totalCommissions: bigint;
  results: {
    userId: string;
    success: boolean;
    error?: string;
    volume?: bigint;
    commission?: bigint;
  }[];
};

export type AdvisorDashboardData = {
  advisorInfo: AdvisorInfo;
  stats: AdvisorStats;
  recentActivity: AdvisorCommission[];
  groupTradingEnabled: boolean;
}; 