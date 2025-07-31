import { Trans } from "@lingui/macro";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { shortenAddress } from "lib/legacy";
import { useAdvisorStats } from "domain/advisors/hooks";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";

import "./RecentActivityDetail.css";

type CommissionActivity = {
  id: string;
  type: 'commission';
  userId: string;
  amount: bigint;
  tradeVolume: bigint;
  commissionRate: number;
  timestamp: number;
  tradeId: string;
  market: string;
  side: string;
};

type TradeActivity = {
  id: string;
  type: 'trade';
  userId: string;
  tradeVolume: bigint;
  market: string;
  side: string;
  leverage: number;
  pnl: bigint;
  timestamp: number;
  tradeId: string;
};

type WithdrawalActivity = {
  id: string;
  type: 'withdrawal';
  userId: string;
  amount: bigint;
  timestamp: number;
  transactionHash: string;
};

type Activity = CommissionActivity | TradeActivity | WithdrawalActivity;

export function RecentActivityDetail() {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const history = useHistory();
  const [filterType, setFilterType] = useState<'all' | 'commissions' | 'trades' | 'withdrawals'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const { stats, loading, error } = useAdvisorStats(advisorAddress);

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(4)} ETH`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Mock data for different activity types
  const mockActivities = {
    commissions: [
      {
        id: '1',
        type: 'commission' as const,
        userId: '0x1234567890123456789012345678901234567890',
        amount: BigInt('500000000000000000'), // 0.5 ETH
        tradeVolume: BigInt('5000000000000000000'), // 5 ETH
        commissionRate: 10,
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        tradeId: 'trade_001',
        market: 'BTC/USD',
        side: 'long'
      },
      {
        id: '2',
        type: 'commission' as const,
        userId: '0x2345678901234567890123456789012345678901',
        amount: BigInt('300000000000000000'), // 0.3 ETH
        tradeVolume: BigInt('3000000000000000000'), // 3 ETH
        commissionRate: 10,
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        tradeId: 'trade_002',
        market: 'ETH/USD',
        side: 'short'
      }
    ] as CommissionActivity[],
    trades: [
      {
        id: '3',
        type: 'trade' as const,
        userId: '0x1234567890123456789012345678901234567890',
        tradeVolume: BigInt('2000000000000000000'), // 2 ETH
        market: 'SOL/USD',
        side: 'long',
        leverage: 3,
        pnl: BigInt('150000000000000000'), // 0.15 ETH profit
        timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        tradeId: 'trade_003'
      },
      {
        id: '4',
        type: 'trade' as const,
        userId: '0x3456789012345678901234567890123456789012',
        tradeVolume: BigInt('1500000000000000000'), // 1.5 ETH
        market: 'AVAX/USD',
        side: 'short',
        leverage: 2,
        pnl: BigInt('-50000000000000000'), // 0.05 ETH loss
        timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
        tradeId: 'trade_004'
      }
    ] as TradeActivity[],
    withdrawals: [
      {
        id: '5',
        type: 'withdrawal' as const,
        userId: '0x1234567890123456789012345678901234567890',
        amount: BigInt('1000000000000000000'), // 1 ETH
        timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        transactionHash: '0xabc123def456ghi789jkl012mno345pqr678stu901'
      }
    ] as WithdrawalActivity[]
  };

  const allActivities: Activity[] = [
    ...mockActivities.commissions,
    ...mockActivities.trades,
    ...mockActivities.withdrawals
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredActivities = allActivities.filter(activity => {
    if (filterType !== 'all' && activity.type !== filterType.slice(0, -1)) return false;
    
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        return activityDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= monthAgo;
      default:
        return true;
    }
  });

  const handleBackToAdvisor = () => {
    history.push(`/advisor/${advisorAddress}`);
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="RecentActivityDetail">
        <div className="container">
          <div className="error-message">
            <Trans>Error loading activity data: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="RecentActivityDetail">
      <SEO title="Recent Activity Detail" />
      <div className="container">
        <div className="header-section">
          <div className="navigation-buttons">
            <button 
              className="back-button"
              onClick={handleBackToAdvisor}
            >
              ← <Trans>Back to Advisor Dashboard</Trans>
            </button>
          </div>
          <PageTitle title={<Trans>Recent Activity Detail</Trans>} />
        </div>

        <div className="activity-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">
                  {mockActivities.commissions.reduce((sum, c) => sum + Number(c.amount), 0).toFixed(4)} ETH
                </div>
                <div className="stat-label">
                  <Trans>Total Commissions</Trans>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{mockActivities.trades.length}</div>
                <div className="stat-label">
                  <Trans>Total Trades</Trans>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">
                  {new Set([...mockActivities.commissions, ...mockActivities.trades].map(a => a.userId)).size}
                </div>
                <div className="stat-label">
                  <Trans>Active Users</Trans>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-value">{allActivities.length}</div>
                <div className="stat-label">
                  <Trans>Total Activities</Trans>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">
              <Trans>Activity Type</Trans>
            </label>
            <div className="filter-buttons">
              <button
                className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                <Trans>All</Trans>
              </button>
              <button
                className={`filter-button ${filterType === 'commissions' ? 'active' : ''}`}
                onClick={() => setFilterType('commissions')}
              >
                <Trans>Commissions</Trans>
              </button>
              <button
                className={`filter-button ${filterType === 'trades' ? 'active' : ''}`}
                onClick={() => setFilterType('trades')}
              >
                <Trans>Trades</Trans>
              </button>
              <button
                className={`filter-button ${filterType === 'withdrawals' ? 'active' : ''}`}
                onClick={() => setFilterType('withdrawals')}
              >
                <Trans>Withdrawals</Trans>
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <Trans>Time Period</Trans>
            </label>
            <div className="filter-buttons">
              <button
                className={`filter-button ${timeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTimeFilter('all')}
              >
                <Trans>All Time</Trans>
              </button>
              <button
                className={`filter-button ${timeFilter === 'today' ? 'active' : ''}`}
                onClick={() => setTimeFilter('today')}
              >
                <Trans>Today</Trans>
              </button>
              <button
                className={`filter-button ${timeFilter === 'week' ? 'active' : ''}`}
                onClick={() => setTimeFilter('week')}
              >
                <Trans>This Week</Trans>
              </button>
              <button
                className={`filter-button ${timeFilter === 'month' ? 'active' : ''}`}
                onClick={() => setTimeFilter('month')}
              >
                <Trans>This Month</Trans>
              </button>
            </div>
          </div>
        </div>

        <div className="activities-section">
          <div className="activities-header">
            <h3 className="section-title">
              <Trans>Activity History</Trans>
            </h3>
            <div className="activities-count">
              {filteredActivities.length} activities
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">
                <Trans>No Activities Found</Trans>
              </div>
              <div className="empty-description">
                <Trans>
                  No activities match your current filters. Try adjusting the filters to see more results.
                </Trans>
              </div>
            </div>
          ) : (
            <div className="activities-list">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className={`activity-card ${activity.type}`}>
                  <div className="activity-header">
                    <div className="activity-type">
                      {activity.type === 'commission' && <span className="type-icon">💰</span>}
                      {activity.type === 'trade' && <span className="type-icon">📈</span>}
                      {activity.type === 'withdrawal' && <span className="type-icon">💸</span>}
                      <span className="type-label">
                        {activity.type === 'commission' && <Trans>Commission</Trans>}
                        {activity.type === 'trade' && <Trans>Trade</Trans>}
                        {activity.type === 'withdrawal' && <Trans>Withdrawal</Trans>}
                      </span>
                    </div>
                    <div className="activity-time">
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>

                  <div className="activity-content">
                    <div className="activity-user">
                      <span className="user-label">
                        <Trans>User:</Trans>
                      </span>
                      <span className="user-address">
                        {shortenAddress(activity.userId, 8)}
                      </span>
                    </div>

                    {activity.type === 'commission' && (
                      <div className="activity-details">
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Commission Amount:</Trans>
                          </span>
                          <span className="detail-value positive">
                            +{formatEth(activity.amount)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Trade Volume:</Trans>
                          </span>
                          <span className="detail-value">
                            {formatEth(activity.tradeVolume)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Commission Rate:</Trans>
                          </span>
                          <span className="detail-value">
                            {activity.commissionRate}%
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Market:</Trans>
                          </span>
                          <span className="detail-value">
                            {activity.market} ({activity.side})
                          </span>
                        </div>
                      </div>
                    )}

                    {activity.type === 'trade' && (
                      <div className="activity-details">
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Trade Volume:</Trans>
                          </span>
                          <span className="detail-value">
                            {formatEth(activity.tradeVolume)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Market:</Trans>
                          </span>
                          <span className="detail-value">
                            {activity.market} ({activity.side})
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Leverage:</Trans>
                          </span>
                          <span className="detail-value">
                            {activity.leverage}x
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>PnL:</Trans>
                          </span>
                          <span className={`detail-value ${Number(activity.pnl) >= 0 ? 'positive' : 'negative'}`}>
                            {Number(activity.pnl) >= 0 ? '+' : ''}{formatEth(activity.pnl)}
                          </span>
                        </div>
                      </div>
                    )}

                    {activity.type === 'withdrawal' && (
                      <div className="activity-details">
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Withdrawal Amount:</Trans>
                          </span>
                          <span className="detail-value negative">
                            -{formatEth(activity.amount)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <Trans>Transaction Hash:</Trans>
                          </span>
                          <span className="detail-value hash">
                            {shortenAddress(activity.transactionHash, 12)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="activity-footer">
                    <div className="activity-id">
                      <Trans>ID:</Trans> {activity.type === 'withdrawal' ? activity.id : activity.tradeId}
                    </div>
                    <div className="activity-date">
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 