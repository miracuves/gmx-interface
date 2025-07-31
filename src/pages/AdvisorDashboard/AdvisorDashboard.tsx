import { Trans } from "@lingui/macro";
import { useParams } from "react-router-dom";
import useWallet from "lib/wallets/useWallet";
import { useAdvisorInfo, useAdvisorStats } from "domain/advisors/hooks";
import { AdvisorDashboardData } from "domain/advisors/types";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";
import { AdvisorOverview } from "components/Advisor/AdvisorOverview";
import { AdvisorStats } from "components/Advisor/AdvisorStats";
import { GroupTrading } from "components/Advisor/GroupTrading";
import { LinkedAccounts } from "components/Advisor/LinkedAccounts";
import { RecentActivity } from "components/Advisor/RecentActivity";
import { UserTrading } from "components/Advisor/UserTrading";

import "./AdvisorDashboard.css";

export function AdvisorDashboard() {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const { account } = useWallet();
  
  // Use a fallback address if no wallet is connected
  const effectiveAddress = advisorAddress || account || "0x1234567890123456789012345678901234567890";
  
  console.log("AdvisorDashboard render - advisorAddress:", advisorAddress, "account:", account, "effectiveAddress:", effectiveAddress);
  
  const { advisorInfo, loading: infoLoading, error: infoError } = useAdvisorInfo(effectiveAddress);
  const { stats, loading: statsLoading, error: statsError } = useAdvisorStats(effectiveAddress);

  console.log("AdvisorDashboard data - advisorInfo:", advisorInfo, "stats:", stats, "loading:", infoLoading || statsLoading, "error:", infoError || statsError);

  const loading = infoLoading || statsLoading;
  const error = infoError || statsError;

  if (loading) {
    console.log("AdvisorDashboard - showing loader");
    return <Loader />;
  }

  if (error) {
    console.log("AdvisorDashboard - showing error:", error);
    return (
      <div className="AdvisorDashboard">
        <div className="container">
          <div className="error-message">
            <Trans>Error loading advisor dashboard: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  if (!advisorInfo) {
    console.log("AdvisorDashboard - no advisor info found");
    return (
      <div className="AdvisorDashboard">
        <div className="container">
          <div className="error-message">
            <Trans>Advisor not found</Trans>
          </div>
        </div>
      </div>
    );
  }

  console.log("AdvisorDashboard - rendering main content");

  const dashboardData: AdvisorDashboardData = {
    advisorInfo,
    stats: stats!,
    recentActivity: stats?.recentCommissions || [],
    groupTradingEnabled: true,
  };

  return (
    <div className="AdvisorDashboard">
      <SEO title="Advisor Dashboard" />
      <div className="container">
        <PageTitle title={<Trans>Advisor Dashboard</Trans>} />
        
        <div className="AdvisorDashboard-content">
          <div className="AdvisorDashboard-main">
            <AdvisorOverview advisorInfo={advisorInfo} />
            <AdvisorStats stats={stats!} />
            <UserTrading />
            <GroupTrading advisorId={advisorInfo.advisorId} />
          </div>
          
          <div className="AdvisorDashboard-sidebar">
            <LinkedAccounts linkedAccounts={stats?.linkedAccounts || []} />
            <RecentActivity activity={dashboardData.recentActivity} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 