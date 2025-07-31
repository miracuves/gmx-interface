import { useCallback, useEffect, useState } from "react";
import useWallet from "lib/wallets/useWallet";
import { useChainId } from "lib/chains";
import { AdvisorInfo } from "../types";

export function useAdvisorInfo(advisorAddress?: string) {
  const { account } = useWallet();
  const { chainId } = useChainId();
  const [advisorInfo, setAdvisorInfo] = useState<AdvisorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = advisorAddress || account;

  console.log("useAdvisorInfo - address:", address, "advisorAddress:", advisorAddress, "account:", account);

  const fetchAdvisorInfo = useCallback(async () => {
    console.log("useAdvisorInfo - fetchAdvisorInfo called with address:", address);
    
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // For now, creating mock data for testing
      const mockAddress = address || "0x1234567890123456789012345678901234567890";
      const mockAdvisorInfo: AdvisorInfo = {
        advisorId: mockAddress,
        advisorAddress: mockAddress,
        affiliateLink: `${window.location.origin}/link-advisor/${mockAddress}`,
        totalLinkedAccounts: 3, // Mock data for testing
        totalCommissions: BigInt(1500000000000000000), // 1.5 ETH
        totalVolume: BigInt(50000000000000000000), // 50 ETH
        isActive: true,
        createdAt: Date.now(),
      };

      console.log("useAdvisorInfo - setting mock data:", mockAdvisorInfo);
      setAdvisorInfo(mockAdvisorInfo);
    } catch (err) {
      console.error("useAdvisorInfo - error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch advisor info");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    console.log("useAdvisorInfo - useEffect triggered");
    fetchAdvisorInfo();
  }, [fetchAdvisorInfo]);

  return {
    advisorInfo,
    loading,
    error,
    refetch: fetchAdvisorInfo,
  };
} 