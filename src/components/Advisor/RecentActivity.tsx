import { Trans } from "@lingui/macro";
import { useHistory, useParams } from "react-router-dom";
import { shortenAddress } from "lib/legacy";
import { AdvisorCommission } from "domain/advisors/types";

import "./RecentActivity.css";

type Props = {
  activity: AdvisorCommission[];
};

export function RecentActivity({ activity }: Props) {
  const history = useHistory();
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();

  const handleCardClick = () => {
    history.push(`/advisor/${advisorAddress || 'default'}/activity`);
  };

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

  if (activity.length === 0) {
    return (
      <div className="RecentActivity clickable" onClick={handleCardClick}>
        <div className="recent-activity-header">
          <h3 className="recent-activity-title">
            <Trans>Recent Activity</Trans>
          </h3>
          <div className="activity-count">0</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">
            <Trans>No Recent Activity</Trans>
          </div>
          <div className="empty-description">
            <Trans>
              Commission activity will appear here as your linked accounts trade. 
              Each trade generates a commission based on your rate.
            </Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="RecentActivity clickable" onClick={handleCardClick}>
      <div className="recent-activity-header">
        <h3 className="recent-activity-title">
          <Trans>Recent Activity</Trans>
        </h3>
        <div className="activity-count">{activity.length}</div>
      </div>

      <div className="activity-list">
        {activity.map((commission) => (
          <div key={commission.tradeId} className="activity-item">
            <div className="activity-header">
              <div className="activity-user">
                {shortenAddress(commission.userId, 6)}
              </div>
              <div className="activity-amount">
                +{formatEth(commission.commissionAmount)}
              </div>
            </div>

            <div className="activity-details">
              <div className="activity-detail">
                <div className="detail-label">
                  <Trans>Trade Volume</Trans>
                </div>
                <div className="detail-value">
                  {formatEth(commission.tradeVolume)}
                </div>
              </div>

              <div className="activity-detail">
                <div className="detail-label">
                  <Trans>Commission Rate</Trans>
                </div>
                <div className="detail-value">
                  {commission.commissionPercentage}%
                </div>
              </div>
            </div>

            <div className="activity-meta">
              <div className="activity-time">
                <Trans>{formatTime(commission.timestamp)}</Trans>
              </div>
              <div className="activity-rate">
                <Trans>{commission.commissionPercentage}% Rate</Trans>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 