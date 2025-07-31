import { Trans } from "@lingui/macro";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { shortenAddress } from "lib/legacy";
import { useAdvisorStats } from "domain/advisors/hooks";

import "./UserTrading.css";

export function UserTrading() {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const history = useHistory();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  const { stats, loading, error } = useAdvisorStats(advisorAddress);

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredUsers = stats?.linkedAccounts.filter(user => {
    if (filterStatus === 'all') return true;
    return filterStatus === 'active' ? user.isActive : !user.isActive;
  }) || [];

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleTradeForUser = (userId: string) => {
    // Navigate to the user's trading dashboard with advisor context
    history.push(`/advisor/${advisorAddress}/trade/${userId}`);
  };

  const handleViewUserDashboard = (userId: string) => {
    // Navigate to the user's full dashboard
    history.push(`/advisor/${advisorAddress}/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="UserTrading">
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
      <div className="UserTrading">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <Trans>Error loading user accounts: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.linkedAccounts.length === 0) {
    return (
      <div className="UserTrading">
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">
            <Trans>No Linked Users</Trans>
          </div>
          <div className="empty-description">
            <Trans>
              You don't have any linked users yet. Share your affiliate link to start linking accounts.
            </Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="UserTrading">
      <div className="user-trading-header">
        <h3 className="section-title">
          <Trans>User Trading Management</Trans>
        </h3>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.totalLinkedAccounts}</div>
            <div className="stat-label">
              <Trans>Total Users</Trans>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.activeLinkedAccounts}</div>
            <div className="stat-label">
              <Trans>Active Users</Trans>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-controls">
        <button
          className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <Trans>All Users</Trans>
        </button>
        <button
          className={`filter-button ${filterStatus === 'active' ? 'active' : ''}`}
          onClick={() => setFilterStatus('active')}
        >
          <Trans>Active Users</Trans>
        </button>
        <button
          className={`filter-button ${filterStatus === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilterStatus('inactive')}
        >
          <Trans>Inactive Users</Trans>
        </button>
      </div>

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div
            key={user.userId}
            className={`user-card ${user.isActive ? 'active' : 'inactive'} ${selectedUser === user.userId ? 'selected' : ''}`}
            onClick={() => handleUserSelect(user.userId)}
          >
            <div className="user-header">
              <div className="user-info">
                <div className="user-address">
                  {shortenAddress(user.userId, 6)}
                </div>
                <div className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                </div>
              </div>
              <div className="user-balance">
                <div className="balance-label">
                  <Trans>Volume</Trans>
                </div>
                <div className="balance-value">
                  {formatEth(user.totalVolume)}
                </div>
              </div>
            </div>

            <div className="user-stats">
              <div className="stat-row">
                <div className="stat-label">
                  <Trans>Commissions</Trans>
                </div>
                <div className="stat-value">
                  {formatEth(user.totalCommissions)}
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label">
                  <Trans>Linked Since</Trans>
                </div>
                <div className="stat-value">
                  {formatDate(user.linkedAt)}
                </div>
              </div>
            </div>

            {selectedUser === user.userId && (
              <div className="user-actions">
                <button
                  className="action-button primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTradeForUser(user.userId);
                  }}
                >
                  <span className="action-icon">📈</span>
                  <Trans>Trade for User</Trans>
                </button>
                <button
                  className="action-button secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewUserDashboard(user.userId);
                  }}
                >
                  <span className="action-icon">📊</span>
                  <Trans>View Dashboard</Trans>
                </button>
                <button
                  className="action-button tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement message functionality
                    alert('Message functionality coming soon');
                  }}
                >
                  <span className="action-icon">💬</span>
                  <Trans>Send Message</Trans>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="selected-user-info">
          <div className="info-card">
            <h4 className="info-title">
              <Trans>Selected User Information</Trans>
            </h4>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">
                  <Trans>User Address:</Trans>
                </span>
                <span className="info-value">
                  {selectedUser}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <Trans>Commission Rate:</Trans>
                </span>
                <span className="info-value">
                  30%
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <Trans>Trading Permissions:</Trans>
                </span>
                <span className="info-value">
                  <Trans>Full Access</Trans>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 