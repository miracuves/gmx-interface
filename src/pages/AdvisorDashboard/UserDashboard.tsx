import { Trans } from "@lingui/macro";
import { useParams, useHistory } from "react-router-dom";
import { shortenAddress } from "lib/legacy";
import { useAdvisorStats } from "domain/advisors/hooks";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";

import "./UserDashboard.css";

export function UserDashboard() {
  const { advisorAddress, userId } = useParams<{ advisorAddress?: string; userId?: string }>();
  const history = useHistory();
  
  const { stats, loading, error } = useAdvisorStats(advisorAddress);

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const selectedUser = stats?.linkedAccounts.find(user => user.userId === userId);

  const handleBackToAdvisor = () => {
    history.push(`/advisor/${advisorAddress}`);
  };

  const handleTradeForUser = () => {
    history.push(`/advisor/${advisorAddress}/trade/${userId}`);
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="UserDashboard">
        <div className="container">
          <div className="error-message">
            <Trans>Error loading user data: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="UserDashboard">
        <div className="container">
          <div className="error-message">
            <Trans>User not found</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="UserDashboard">
      <SEO title="User Dashboard" />
      <div className="container">
        <div className="header-section">
          <div className="navigation-buttons">
            <button 
              className="back-button"
              onClick={handleBackToAdvisor}
            >
              ← <Trans>Back to Advisor Dashboard</Trans>
            </button>
            <button 
              className="trade-button"
              onClick={handleTradeForUser}
            >
              📈 <Trans>Trade for User</Trans>
            </button>
          </div>
          <PageTitle title={<Trans>User Dashboard</Trans>} />
        </div>

        <div className="user-info-section">
          <div className="user-info-card">
            <div className="user-header">
              <div className="user-avatar">
                👤
              </div>
              <div className="user-details">
                <h3 className="user-name">
                  {shortenAddress(selectedUser.userId, 8)}
                </h3>
                <div className="user-status">
                  <span className={`status-indicator ${selectedUser.isActive ? 'active' : 'inactive'}`}></span>
                  {selectedUser.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                </div>
                <div className="user-address">
                  <Trans>Address:</Trans> {selectedUser.userId}
                </div>
              </div>
            </div>
            <div className="user-stats">
              <div className="stat-item">
                <div className="stat-label">
                  <Trans>Total Volume</Trans>
                </div>
                <div className="stat-value">
                  {formatEth(selectedUser.totalVolume)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">
                  <Trans>Total Commissions</Trans>
                </div>
                <div className="stat-value">
                  {formatEth(selectedUser.totalCommissions)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">
                  <Trans>Commission Rate</Trans>
                </div>
                <div className="stat-value">
                  30%
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">
                  <Trans>Linked Since</Trans>
                </div>
                <div className="stat-value">
                  {formatDate(selectedUser.linkedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-grid">
            <div className="trading-activity-card">
              <h3 className="card-title">
                <Trans>Recent Trading Activity</Trans>
              </h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">📈</div>
                  <div className="activity-details">
                    <div className="activity-title">BTC/USD Long</div>
                    <div className="activity-info">$5,000 • 3x Leverage</div>
                    <div className="activity-time">2 hours ago</div>
                  </div>
                  <div className="activity-pnl positive">+$450</div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📉</div>
                  <div className="activity-details">
                    <div className="activity-title">ETH/USD Short</div>
                    <div className="activity-info">$3,200 • 2x Leverage</div>
                    <div className="activity-time">1 day ago</div>
                  </div>
                  <div className="activity-pnl negative">-$120</div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📈</div>
                  <div className="activity-details">
                    <div className="activity-title">SOL/USD Long</div>
                    <div className="activity-info">$2,100 • 5x Leverage</div>
                    <div className="activity-time">3 days ago</div>
                  </div>
                  <div className="activity-pnl positive">+$320</div>
                </div>
              </div>
            </div>

            <div className="positions-card">
              <h3 className="card-title">
                <Trans>Current Positions</Trans>
              </h3>
              <div className="positions-list">
                <div className="position-item">
                  <div className="position-header">
                    <div className="position-market">BTC/USD</div>
                    <div className="position-type long">📈 Long</div>
                  </div>
                  <div className="position-details">
                    <div className="position-stat">
                      <span className="stat-label">Size:</span>
                      <span className="stat-value">$5,000</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">Leverage:</span>
                      <span className="stat-value">3x</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">Entry Price:</span>
                      <span className="stat-value">$43,250</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">Current Price:</span>
                      <span className="stat-value">$44,100</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">PnL:</span>
                      <span className="stat-value positive">+$450 (2.0%)</span>
                    </div>
                  </div>
                </div>
                <div className="position-item">
                  <div className="position-header">
                    <div className="position-market">ETH/USD</div>
                    <div className="position-type short">📉 Short</div>
                  </div>
                  <div className="position-details">
                    <div className="position-stat">
                      <span className="stat-label">Size:</span>
                      <span className="stat-value">$3,200</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">Leverage:</span>
                      <span className="stat-value">2x</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">Entry Price:</span>
                      <span className="stat-value">$2,650</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">Current Price:</span>
                      <span className="stat-value">$2,680</span>
                    </div>
                    <div className="position-stat">
                      <span className="stat-label">PnL:</span>
                      <span className="stat-value negative">-$120 (-1.1%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <h3 className="card-title">
                <Trans>Performance Metrics</Trans>
              </h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">
                    <Trans>Total Trades</Trans>
                  </div>
                  <div className="metric-value">24</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">
                    <Trans>Win Rate</Trans>
                  </div>
                  <div className="metric-value">75%</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">
                    <Trans>Avg Trade Size</Trans>
                  </div>
                  <div className="metric-value">$3,200</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">
                    <Trans>Best Trade</Trans>
                  </div>
                  <div className="metric-value positive">+$850</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">
                    <Trans>Worst Trade</Trans>
                  </div>
                  <div className="metric-value negative">-$320</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">
                    <Trans>Total PnL</Trans>
                  </div>
                  <div className="metric-value positive">+$2,450</div>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3 className="card-title">
                <Trans>User Settings</Trans>
              </h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <Trans>Trading Permissions</Trans>
                    </div>
                    <div className="setting-description">
                      <Trans>Advisor can trade on behalf of user</Trans>
                    </div>
                  </div>
                  <div className="setting-status active">
                    <Trans>Enabled</Trans>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <Trans>Commission Rate</Trans>
                    </div>
                    <div className="setting-description">
                      <Trans>Percentage of profits shared with advisor</Trans>
                    </div>
                  </div>
                  <div className="setting-status">30%</div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <Trans>Risk Level</Trans>
                    </div>
                    <div className="setting-description">
                      <Trans>Maximum leverage allowed</Trans>
                    </div>
                  </div>
                  <div className="setting-status">10x</div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <Trans>Auto-Close</Trans>
                    </div>
                    <div className="setting-description">
                      <Trans>Automatically close positions at loss threshold</Trans>
                    </div>
                  </div>
                  <div className="setting-status">-20%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 