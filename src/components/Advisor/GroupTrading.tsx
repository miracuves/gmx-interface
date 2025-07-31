import { Trans } from "@lingui/macro";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { shortenAddress } from "lib/legacy";
import { useAdvisorStats } from "domain/advisors/hooks";

import "./GroupTrading.css";

type Props = {
  advisorId: string;
};

export function GroupTrading({ advisorId }: Props) {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const { stats, loading, error } = useAdvisorStats(advisorAddress);
  
  const [formData, setFormData] = useState({
    action: "open",
    market: "",
    side: "long",
    sizePercentage: 10,
    leverage: 1,
    stopLoss: "",
    takeProfit: "",
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement group trading logic
    console.log("Group trading request:", { 
      advisorId, 
      selectedUsers, 
      ...formData 
    });
  };

  const handleReset = () => {
    setFormData({
      action: "open",
      market: "",
      side: "long",
      sizePercentage: 10,
      leverage: 1,
      stopLoss: "",
      takeProfit: "",
    });
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      const allUserIds = stats?.linkedAccounts.map(user => user.userId) || [];
      setSelectedUsers(allUserIds);
      setSelectAll(true);
    }
  };

  const activeUsers = stats?.linkedAccounts.filter(user => user.isActive) || [];
  const totalUsers = activeUsers.length;
  const selectedCount = selectedUsers.length;

  if (loading) {
    return (
      <div className="GroupTrading">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <Trans>Loading user accounts...</Trans>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="GroupTrading">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <Trans>Error loading user accounts: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="GroupTrading">
      <div className="group-trading-header">
        <h2 className="group-trading-title">
          <Trans>Group Trading</Trans>
        </h2>
        <div className="group-trading-status">
          <Trans>Ready</Trans>
        </div>
      </div>

      <div className="user-selection-section">
        <div className="selection-header">
          <h3 className="selection-title">
            <Trans>Select Users for Group Trading</Trans>
          </h3>
          <div className="selection-summary">
            <span className="selected-count">
              {selectedCount} of {totalUsers} users selected
            </span>
            <button
              type="button"
              className={`select-all-button ${selectAll ? 'active' : ''}`}
              onClick={handleSelectAll}
            >
              {selectAll ? <Trans>Deselect All</Trans> : <Trans>Select All</Trans>}
            </button>
          </div>
        </div>

        {totalUsers === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">
              <Trans>No Active Users</Trans>
            </div>
            <div className="empty-description">
              <Trans>
                You don't have any active linked users. Group trading requires at least one active user account.
              </Trans>
            </div>
          </div>
        ) : (
          <div className="users-grid">
            {activeUsers.map((user) => (
              <div
                key={user.userId}
                className={`user-card ${selectedUsers.includes(user.userId) ? 'selected' : ''}`}
                onClick={() => handleUserToggle(user.userId)}
              >
                <div className="user-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.userId)}
                    onChange={() => handleUserToggle(user.userId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="user-info">
                  <div className="user-address">
                    {shortenAddress(user.userId, 6)}
                  </div>
                  <div className="user-balance">
                    <span className="balance-label">
                      <Trans>Balance:</Trans>
                    </span>
                    <span className="balance-value">
                      {formatEth(user.totalVolume)}
                    </span>
                  </div>
                </div>
                <div className="user-status">
                  <span className="status-indicator active"></span>
                  <span className="status-text">
                    <Trans>Active</Trans>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="trading-form">
        <div className="form-group">
          <label className="form-label">
            <Trans>Action</Trans>
          </label>
          <select
            className="form-select"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
          >
            <option value="open">
              <Trans>Open Position</Trans>
            </option>
            <option value="close">
              <Trans>Close Position</Trans>
            </option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Trans>Market</Trans>
          </label>
          <select
            className="form-select"
            value={formData.market}
            onChange={(e) => setFormData({ ...formData, market: e.target.value })}
            required
          >
            <option value="">
              <Trans>Select Market</Trans>
            </option>
            <option value="BTC/USD">BTC/USD</option>
            <option value="ETH/USD">ETH/USD</option>
            <option value="SOL/USD">SOL/USD</option>
            <option value="AVAX/USD">AVAX/USD</option>
            <option value="ARB/USD">ARB/USD</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Trans>Side</Trans>
          </label>
          <div className="side-buttons">
            <button
              type="button"
              className={`side-button ${formData.side === 'long' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, side: 'long' })}
            >
              <span className="side-icon">📈</span>
              <Trans>Long</Trans>
            </button>
            <button
              type="button"
              className={`side-button ${formData.side === 'short' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, side: 'short' })}
            >
              <span className="side-icon">📉</span>
              <Trans>Short</Trans>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Trans>Size (% of balance)</Trans>
          </label>
          <div className="size-slider">
            <input
              type="range"
              min="1"
              max="100"
              value={formData.sizePercentage}
              onChange={(e) => setFormData({ ...formData, sizePercentage: Number(e.target.value) })}
              className="size-range"
            />
            <span className="size-value">{formData.sizePercentage}%</span>
          </div>
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
              step="0.1"
              value={formData.leverage}
              onChange={(e) => setFormData({ ...formData, leverage: Number(e.target.value) })}
              className="leverage-range"
            />
            <span className="leverage-value">{formData.leverage}x</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <Trans>Stop Loss</Trans>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="Optional"
              value={formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Trans>Take Profit</Trans>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="Optional"
              value={formData.takeProfit}
              onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
            />
          </div>
        </div>
      </form>

      <div className="trading-summary">
        <h3 className="summary-title">
          <Trans>Trade Summary</Trans>
        </h3>
        <div className="summary-details">
          <div className="summary-row">
            <span className="summary-label">
              <Trans>Selected Users:</Trans>
            </span>
            <span className="summary-value">{selectedCount} users</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">
              <Trans>Market:</Trans>
            </span>
            <span className="summary-value">{formData.market || 'Not selected'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">
              <Trans>Side:</Trans>
            </span>
            <span className={`summary-value ${formData.side === 'long' ? 'positive' : 'negative'}`}>
              {formData.side === 'long' ? '📈 Long' : '📉 Short'}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">
              <Trans>Size:</Trans>
            </span>
            <span className="summary-value">{formData.sizePercentage}% of balance</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">
              <Trans>Leverage:</Trans>
            </span>
            <span className="summary-value">{formData.leverage}x</span>
          </div>
        </div>
      </div>

      <div className="trading-actions">
        <button type="button" className="reset-button" onClick={handleReset}>
          <Trans>Reset</Trans>
        </button>
        <button 
          type="submit" 
          className="execute-button" 
          onClick={handleSubmit}
          disabled={selectedCount === 0 || !formData.market}
        >
          <span>⚡</span>
          <Trans>Execute Group Trade</Trans>
        </button>
      </div>

      <div className="trading-info">
        <div className="info-title">
          <Trans>Group Trading Info</Trans>
        </div>
        <p className="info-text">
          <Trans>
            Execute trades across selected user accounts simultaneously. 
            This action will apply the specified parameters to all selected active linked accounts. 
            Please ensure all parameters are correct before executing.
          </Trans>
        </p>
      </div>
    </div>
  );
} 