import { Trans } from "@lingui/macro";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { shortenAddress } from "lib/legacy";
import { useAdvisorStats } from "domain/advisors/hooks";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";

import "./LinkedAccountsDetail.css";

export function LinkedAccountsDetail() {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const history = useHistory();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'commissions' | 'date' | 'name'>('volume');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  
  const { stats, loading, error } = useAdvisorStats(advisorAddress);

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(4)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Mock data for account activities
  const mockAccountActivities = {
    '0x1234567890123456789012345678901234567890': [
      {
        id: '1',
        type: 'trade',
        market: 'BTC/USD',
        side: 'long',
        volume: BigInt('2000000000000000000'), // 2 ETH
        pnl: BigInt('150000000000000000'), // 0.15 ETH profit
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        tradeId: 'trade_001'
      },
      {
        id: '2',
        type: 'commission',
        amount: BigInt('500000000000000000'), // 0.5 ETH
        timestamp: Date.now() - 4 * 60 * 60 * 1000,
        tradeId: 'trade_002'
      },
      {
        id: '3',
        type: 'withdrawal',
        amount: BigInt('1000000000000000000'), // 1 ETH
        timestamp: Date.now() - 6 * 60 * 60 * 1000,
        transactionHash: '0xabc123def456ghi789jkl012mno345pqr678stu901'
      }
    ],
    '0x2345678901234567890123456789012345678901': [
      {
        id: '4',
        type: 'trade',
        market: 'ETH/USD',
        side: 'short',
        volume: BigInt('1500000000000000000'), // 1.5 ETH
        pnl: BigInt('-50000000000000000'), // 0.05 ETH loss
        timestamp: Date.now() - 1 * 60 * 60 * 1000,
        tradeId: 'trade_003'
      },
      {
        id: '5',
        type: 'commission',
        amount: BigInt('300000000000000000'), // 0.3 ETH
        timestamp: Date.now() - 3 * 60 * 60 * 1000,
        tradeId: 'trade_004'
      }
    ]
  };

  const handleBackToAdvisor = () => {
    history.push(`/advisor/${advisorAddress}`);
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(selectedAccount === accountId ? null : accountId);
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="LinkedAccountsDetail">
        <div className="container">
          <div className="error-message">
            <Trans>Error loading accounts data: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  const filteredAccounts = stats?.linkedAccounts.filter(account => {
    if (filterStatus === 'all') return true;
    return filterStatus === 'active' ? account.isActive : !account.isActive;
  }) || [];

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return Number(b.totalVolume) - Number(a.totalVolume);
      case 'commissions':
        return Number(b.totalCommissions) - Number(a.totalCommissions);
      case 'date':
        return b.linkedAt - a.linkedAt;
      case 'name':
        return a.userId.localeCompare(b.userId);
      default:
        return 0;
    }
  });

  const selectedAccountData = selectedAccount ? stats?.linkedAccounts.find(acc => acc.userId === selectedAccount) : null;
  const selectedAccountActivities = selectedAccount ? mockAccountActivities[selectedAccount] || [] : [];

  return (
    <div className="LinkedAccountsDetail">
      <SEO title="Linked Accounts Detail" />
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
          <PageTitle title={<Trans>Linked Accounts Detail</Trans>} />
        </div>

        <div className="accounts-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats?.totalLinkedAccounts || 0}</div>
                <div className="stat-label">
                  <Trans>Total Accounts</Trans>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats?.activeLinkedAccounts || 0}</div>
                <div className="stat-label">
                  <Trans>Active Accounts</Trans>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatEth(stats?.linkedAccounts.reduce((sum, acc) => sum + acc.totalCommissions, BigInt(0)) || BigInt(0))}
                </div>
                <div className="stat-label">
                  <Trans>Total Commissions</Trans>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatEth(stats?.linkedAccounts.reduce((sum, acc) => sum + acc.totalVolume, BigInt(0)) || BigInt(0))}
                </div>
                <div className="stat-label">
                  <Trans>Total Volume</Trans>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">
              <Trans>Account Status</Trans>
            </label>
            <div className="filter-buttons">
              <button
                className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <Trans>All Accounts</Trans>
              </button>
              <button
                className={`filter-button ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                <Trans>Active Only</Trans>
              </button>
              <button
                className={`filter-button ${filterStatus === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilterStatus('inactive')}
              >
                <Trans>Inactive Only</Trans>
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <Trans>Sort By</Trans>
            </label>
            <div className="filter-buttons">
              <button
                className={`filter-button ${sortBy === 'volume' ? 'active' : ''}`}
                onClick={() => setSortBy('volume')}
              >
                <Trans>Volume</Trans>
              </button>
              <button
                className={`filter-button ${sortBy === 'commissions' ? 'active' : ''}`}
                onClick={() => setSortBy('commissions')}
              >
                <Trans>Commissions</Trans>
              </button>
              <button
                className={`filter-button ${sortBy === 'date' ? 'active' : ''}`}
                onClick={() => setSortBy('date')}
              >
                <Trans>Date</Trans>
              </button>
              <button
                className={`filter-button ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => setSortBy('name')}
              >
                <Trans>Name</Trans>
              </button>
            </div>
          </div>
        </div>

        <div className="accounts-section">
          <div className="accounts-header">
            <h3 className="section-title">
              <Trans>Linked Accounts</Trans>
            </h3>
            <div className="accounts-count">
              {sortedAccounts.length} accounts
            </div>
          </div>

          {sortedAccounts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">
                <Trans>No Accounts Found</Trans>
              </div>
              <div className="empty-description">
                <Trans>
                  No accounts match your current filters. Try adjusting the filters to see more results.
                </Trans>
              </div>
            </div>
          ) : (
            <div className="accounts-grid">
              {sortedAccounts.map((account) => (
                <div
                  key={account.userId}
                  className={`account-card ${account.isActive ? 'active' : 'inactive'} ${selectedAccount === account.userId ? 'selected' : ''}`}
                  onClick={() => handleAccountSelect(account.userId)}
                >
                  <div className="account-header">
                    <div className="account-info">
                      <div className="account-address">
                        {shortenAddress(account.userId, 8)}
                      </div>
                      <div className={`account-status ${account.isActive ? 'active' : 'inactive'}`}>
                        <span className="status-indicator"></span>
                        {account.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                      </div>
                    </div>
                    <div className="account-balance">
                      <div className="balance-label">
                        <Trans>Volume</Trans>
                      </div>
                      <div className="balance-value">
                        {formatEth(account.totalVolume)}
                      </div>
                    </div>
                  </div>

                  <div className="account-stats">
                    <div className="stat-row">
                      <div className="stat-label">
                        <Trans>Commissions</Trans>
                      </div>
                      <div className="stat-value">
                        {formatEth(account.totalCommissions)}
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">
                        <Trans>Linked Since</Trans>
                      </div>
                      <div className="stat-value">
                        {formatDate(account.linkedAt)}
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">
                        <Trans>Commission Rate</Trans>
                      </div>
                      <div className="stat-value">
                        30%
                      </div>
                    </div>
                  </div>

                  {selectedAccount === account.userId && (
                    <div className="account-details">
                      <div className="details-header">
                        <h4 className="details-title">
                          <Trans>Account Details</Trans>
                        </h4>
                      </div>
                      
                      <div className="details-content">
                        <div className="detail-item">
                          <span className="detail-label">
                            <Trans>Full Address:</Trans>
                          </span>
                          <span className="detail-value hash">
                            {account.userId}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            <Trans>Linked Date:</Trans>
                          </span>
                          <span className="detail-value">
                            {formatDateTime(account.linkedAt)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            <Trans>Total Trades:</Trans>
                          </span>
                          <span className="detail-value">
                            24
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            <Trans>Win Rate:</Trans>
                          </span>
                          <span className="detail-value">
                            75%
                          </span>
                        </div>
                      </div>

                      <div className="recent-activities">
                        <h5 className="activities-title">
                          <Trans>Recent Activities</Trans>
                        </h5>
                        <div className="activities-list">
                          {selectedAccountActivities.map((activity) => (
                            <div key={activity.id} className={`activity-item ${activity.type}`}>
                              <div className="activity-icon">
                                {activity.type === 'trade' && '📈'}
                                {activity.type === 'commission' && '💰'}
                                {activity.type === 'withdrawal' && '💸'}
                              </div>
                              <div className="activity-content">
                                <div className="activity-title">
                                  {activity.type === 'trade' && `${activity.market} ${activity.side}`}
                                  {activity.type === 'commission' && <Trans>Commission Earned</Trans>}
                                  {activity.type === 'withdrawal' && <Trans>Withdrawal</Trans>}
                                </div>
                                <div className="activity-amount">
                                  {activity.type === 'trade' && (
                                    <span className={`amount ${Number(activity.pnl) >= 0 ? 'positive' : 'negative'}`}>
                                      {Number(activity.pnl) >= 0 ? '+' : ''}{formatEth(activity.pnl)}
                                    </span>
                                  )}
                                  {activity.type === 'commission' && (
                                    <span className="amount positive">
                                      +{formatEth(activity.amount)}
                                    </span>
                                  )}
                                  {activity.type === 'withdrawal' && (
                                    <span className="amount negative">
                                      -{formatEth(activity.amount)}
                                    </span>
                                  )}
                                </div>
                                <div className="activity-time">
                                  {formatDateTime(activity.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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