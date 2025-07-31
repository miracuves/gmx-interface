import { Trans } from "@lingui/macro";
import { useHistory, useParams } from "react-router-dom";
import { shortenAddress } from "lib/legacy";
import { UserAdvisorLink } from "domain/advisors/types";

import "./LinkedAccounts.css";

type Props = {
  linkedAccounts: UserAdvisorLink[];
};

export function LinkedAccounts({ linkedAccounts }: Props) {
  const history = useHistory();
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();

  const handleCardClick = () => {
    history.push(`/advisor/${advisorAddress || 'default'}/accounts`);
  };

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (linkedAccounts.length === 0) {
    return (
      <div className="LinkedAccounts clickable" onClick={handleCardClick}>
        <div className="linked-accounts-header">
          <h3 className="linked-accounts-title">
            <Trans>Linked Accounts</Trans>
          </h3>
          <div className="accounts-count">0</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">
            <Trans>No Linked Accounts</Trans>
          </div>
          <div className="empty-description">
            <Trans>
              Share your affiliate link to start linking accounts. 
              Linked accounts will appear here with their trading statistics.
            </Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="LinkedAccounts clickable" onClick={handleCardClick}>
      <div className="linked-accounts-header">
        <h3 className="linked-accounts-title">
          <Trans>Linked Accounts</Trans>
        </h3>
        <div className="accounts-count">{linkedAccounts.length}</div>
      </div>

      <div className="accounts-list">
        {linkedAccounts.map((account) => (
          <div
            key={account.userId}
            className={`account-item ${account.isActive ? "active" : "inactive"}`}
          >
            <div className="account-header">
              <div className="account-address">
                {shortenAddress(account.userId, 6)}
              </div>
              <div className={`account-status ${account.isActive ? "active" : "inactive"}`}>
                {account.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
              </div>
            </div>

            <div className="account-details">
              <div className="account-detail">
                <div className="detail-label">
                  <Trans>Volume</Trans>
                </div>
                <div className="detail-value">
                  {formatEth(account.totalVolume)}
                </div>
              </div>

              <div className="account-detail">
                <div className="detail-label">
                  <Trans>Commissions</Trans>
                </div>
                <div className="detail-value">
                  {formatEth(account.totalCommissions)}
                </div>
              </div>
            </div>

            <div className="account-meta">
              <div className="linked-date">
                <Trans>Linked {formatDate(account.linkedAt)}</Trans>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 