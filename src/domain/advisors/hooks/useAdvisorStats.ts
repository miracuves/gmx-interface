import { useCallback, useEffect, useState } from "react";
import useWallet from "lib/wallets/useWallet";
import { useChainId } from "lib/chains";
import { AdvisorStats } from "../types";

export function useAdvisorStats(advisorAddress?: string) {
  const { account } = useWallet();
  const { chainId } = useChainId();
  const [stats, setStats] = useState<AdvisorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = advisorAddress || account;

  console.log("useAdvisorStats - address:", address, "advisorAddress:", advisorAddress, "account:", account);

  const fetchStats = useCallback(async () => {
    console.log("useAdvisorStats - fetchStats called with address:", address);
    
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // For now, creating mock data for testing
      const mockAddress = address || "0x1234567890123456789012345678901234567890";
      const mockStats: AdvisorStats = {
        advisorId: mockAddress,
        totalLinkedAccounts: 3,
        activeLinkedAccounts: 2,
        totalCommissions: BigInt(1500000000000000000), // 1.5 ETH
        totalVolume: BigInt(50000000000000000000), // 50 ETH
        monthlyCommissions: BigInt(300000000000000000), // 0.3 ETH
        monthlyVolume: BigInt(10000000000000000000), // 10 ETH
        linkedAccounts: [
          {
            userId: "0x1111111111111111111111111111111111111111",
            advisorId: mockAddress,
            linkedAt: Date.now() - 86400000 * 7, // 7 days ago
            isActive: true,
            totalCommissions: BigInt(500000000000000000), // 0.5 ETH
            totalVolume: BigInt(15000000000000000000), // 15 ETH
          },
          {
            userId: "0x2222222222222222222222222222222222222222",
            advisorId: mockAddress,
            linkedAt: Date.now() - 86400000 * 3, // 3 days ago
            isActive: true,
            totalCommissions: BigInt(700000000000000000), // 0.7 ETH
            totalVolume: BigInt(25000000000000000000), // 25 ETH
          },
          {
            userId: "0x3333333333333333333333333333333333333333",
            advisorId: mockAddress,
            linkedAt: Date.now() - 86400000 * 1, // 1 day ago
            isActive: false,
            totalCommissions: BigInt(300000000000000000), // 0.3 ETH
            totalVolume: BigInt(10000000000000000000), // 10 ETH
          },
        ],
        recentCommissions: [
          {
            advisorId: mockAddress,
            userId: "0x1111111111111111111111111111111111111111",
            tradeId: "0xabc123",
            commissionAmount: BigInt(50000000000000000), // 0.05 ETH
            commissionPercentage: 30,
            tradeVolume: BigInt(1000000000000000000), // 1 ETH
            timestamp: Date.now() - 3600000, // 1 hour ago
            transactionHash: "0xdef456",
          },
          {
            advisorId: mockAddress,
            userId: "0x2222222222222222222222222222222222222222",
            tradeId: "0xghi789",
            commissionAmount: BigInt(75000000000000000), // 0.075 ETH
            commissionPercentage: 30,
            tradeVolume: BigInt(1500000000000000000), // 1.5 ETH
            timestamp: Date.now() - 7200000, // 2 hours ago
            transactionHash: "0xjkl012",
          },
        ],
      };

      console.log("useAdvisorStats - setting mock data:", mockStats);
      setStats(mockStats);
    } catch (err) {
      console.error("useAdvisorStats - error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch advisor stats");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    console.log("useAdvisorStats - useEffect triggered");
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
} 