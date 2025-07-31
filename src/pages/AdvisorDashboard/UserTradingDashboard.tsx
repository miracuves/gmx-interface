import { Trans } from "@lingui/macro";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { shortenAddress } from "lib/legacy";
import { useAdvisorStats } from "domain/advisors/hooks";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";

import "./UserTradingDashboard.css";

export function UserTradingDashboard() {
  const { advisorAddress, userId } = useParams<{ advisorAddress?: string; userId?: string }>();
  const history = useHistory();
  const [selectedMarket, setSelectedMarket] = useState<string>("BTC");
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [tradeAmount, setTradeAmount] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(2);
  
  const { stats, loading, error } = useAdvisorStats(advisorAddress);

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  const selectedUser = stats?.linkedAccounts.find(user => user.userId === userId);

  const handleBackToAdvisor = () => {
    history.push(`/advisor/${advisorAddress}`);
  };

  const handleBackToUserList = () => {
    history.push(`/advisor/${advisorAddress}`);
  };

  const handleTrade = () => {
    // TODO: Implement actual trading logic
    alert(`Trading ${tradeAmount} ${selectedMarket} ${tradeType} for user ${userId}`);
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="UserTradingDashboard">
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
      <div className="UserTradingDashboard">
        <div className="container">
          <div className="error-message">
            <Trans>User not found</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="UserTradingDashboard">
      <SEO title="User Trading Dashboard" />
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
              className="back-button secondary"
              onClick={handleBackToUserList}
            >
              ← <Trans>Back to User List</Trans>
            </button>
          </div>
          <PageTitle title={<Trans>User Trading Dashboard</Trans>} />
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
            </div>
          </div>
        </div>

        <div className="trading-section">
          <div className="trading-card">
            <h3 className="card-title">
              <Trans>Execute Trade for User</Trans>
            </h3>
            
            <div className="trading-form">
              <div className="form-group">
                <label className="form-label">
                  <Trans>Market</Trans>
                </label>
                <select 
                  className="form-select"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  <option value="BTC">BTC/USD</option>
                  <option value="ETH">ETH/USD</option>
                  <option value="SOL">SOL/USD</option>
                  <option value="AVAX">AVAX/USD</option>
                  <option value="ARB">ARB/USD</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Trans>Trade Type</Trans>
                </label>
                <div className="trade-type-buttons">
                  <button
                    className={`trade-type-button ${tradeType === 'long' ? 'active' : ''}`}
                    onClick={() => setTradeType('long')}
                  >
                    <span className="trade-icon">📈</span>
                    <Trans>Long</Trans>
                  </button>
                  <button
                    className={`trade-type-button ${tradeType === 'short' ? 'active' : ''}`}
                    onClick={() => setTradeType('short')}
                  >
                    <span className="trade-icon">📉</span>
                    <Trans>Short</Trans>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Trans>Amount (USD)</Trans>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="Enter trade amount"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Trans>Leverage</Trans>
                </label>
                <div className="leverage-slider">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="leverage-range"
                  />
                  <span className="leverage-value">{leverage}x</span>
                </div>
              </div>

              <div className="trade-summary">
                <h4 className="summary-title">
                  <Trans>Trade Summary</Trans>
                </h4>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="summary-label">
                      <Trans>Market:</Trans>
                    </span>
                    <span className="summary-value">{selectedMarket}/USD</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      <Trans>Type:</Trans>
                    </span>
                    <span className={`summary-value ${tradeType === 'long' ? 'positive' : 'negative'}`}>
                      {tradeType === 'long' ? '📈 Long' : '📉 Short'}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      <Trans>Amount:</Trans>
                    </span>
                    <span className="summary-value">${tradeAmount || '0'}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      <Trans>Leverage:</Trans>
                    </span>
                    <span className="summary-value">{leverage}x</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      <Trans>Position Size:</Trans>
                    </span>
                    <span className="summary-value">${(Number(tradeAmount || 0) * leverage).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="trade-button"
                  onClick={handleTrade}
                  disabled={!tradeAmount || Number(tradeAmount) <= 0}
                >
                  <span className="button-icon">📊</span>
                  <Trans>Execute Trade</Trans>
                </button>
                <button
                  className="cancel-button"
                  onClick={handleBackToUserList}
                >
                  <Trans>Cancel</Trans>
                </button>
              </div>
            </div>
          </div>

          <div className="user-positions-card">
            <h3 className="card-title">
              <Trans>User's Current Positions</Trans>
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
                    <span className="stat-label">PnL:</span>
                    <span className="stat-value positive">+$450</span>
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
                    <span className="stat-label">PnL:</span>
                    <span className="stat-value negative">-$120</span>
                  </div>
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