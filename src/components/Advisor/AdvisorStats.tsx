import { Trans } from "@lingui/macro";
import { useHistory, useParams } from "react-router-dom";
import { formatTokenAmount } from "lib/numbers";
import { AdvisorStats as AdvisorStatsType } from "domain/advisors/types";

import "./AdvisorStats.css";

type Props = {
  stats: AdvisorStatsType;
};

export function AdvisorStats({ stats }: Props) {
  const history = useHistory();
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();

  const handleCardClick = () => {
    history.push(`/advisor/${advisorAddress || 'default'}/stats`);
  };

  const formatEth = (value: bigint) => {
    return formatTokenAmount(value, 18, undefined, { displayDecimals: 2 });
  };

  return (
    <div className="AdvisorStats clickable" onClick={handleCardClick}>
      <div className="stats-header">
        <h2 className="stats-title">
          <Trans>Performance Statistics</Trans>
        </h2>
        <div className="commission-rate">
          <Trans>30% Commission Rate</Trans>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card volume">
          <span className="stat-icon">📈</span>
          <div className="stat-label">
            <Trans>Total Volume</Trans>
          </div>
          <div className="stat-value">{formatEth(stats.totalVolume)}</div>
          <div className="stat-change positive">+12.5%</div>
        </div>

        <div className="stat-card commissions">
          <span className="stat-icon">💰</span>
          <div className="stat-label">
            <Trans>Total Commissions</Trans>
          </div>
          <div className="stat-value">{formatEth(stats.totalCommissions)}</div>
          <div className="stat-change positive">+8.3%</div>
        </div>

        <div className="stat-card accounts">
          <span className="stat-icon">👥</span>
          <div className="stat-label">
            <Trans>Linked Accounts</Trans>
          </div>
          <div className="stat-value">{stats.totalLinkedAccounts}</div>
          <div className="stat-change positive">+2 this month</div>
        </div>

        <div className="stat-card monthly">
          <span className="stat-icon">📅</span>
          <div className="stat-label">
            <Trans>Monthly Volume</Trans>
          </div>
          <div className="stat-value">{formatEth(stats.monthlyVolume)}</div>
          <div className="stat-change positive">+15.2%</div>
        </div>
      </div>

      <div className="performance-summary">
        <div className="summary-title">
          <Trans>Performance Summary</Trans>
        </div>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-label">
              <Trans>Active Accounts</Trans>
            </div>
            <div className="summary-value">{stats.activeLinkedAccounts}</div>
          </div>
          <div className="summary-stat">
            <div className="summary-label">
              <Trans>Monthly Commissions</Trans>
            </div>
            <div className="summary-value">{formatEth(stats.monthlyCommissions)}</div>
          </div>
          <div className="summary-stat">
            <div className="summary-label">
              <Trans>Success Rate</Trans>
            </div>
            <div className="summary-value">94.2%</div>
          </div>
          <div className="summary-stat">
            <div className="summary-label">
              <Trans>Avg. Commission</Trans>
            </div>
            <div className="summary-value">{formatEth(stats.totalCommissions / BigInt(Math.max(stats.totalLinkedAccounts, 1)))}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 