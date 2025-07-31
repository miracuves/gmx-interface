import { Trans } from "@lingui/macro";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { shortenAddress } from "lib/legacy";
import { AdvisorInfo } from "domain/advisors/types";

import "./AdvisorOverview.css";

type Props = {
  advisorInfo: AdvisorInfo;
};

export function AdvisorOverview({ advisorInfo }: Props) {
  const [copied, setCopied] = useState(false);
  const history = useHistory();
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(advisorInfo.affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCardClick = () => {
    history.push(`/advisor/${advisorAddress || advisorInfo.advisorAddress}/overview`);
  };

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  return (
    <div className="AdvisorOverview clickable" onClick={handleCardClick}>
      <div className="advisor-header">
        <h2 className="advisor-title">
          <Trans>Advisor Dashboard</Trans>
        </h2>
        <div className="advisor-status">
          <div className="status-indicator"></div>
          <Trans>Active</Trans>
        </div>
      </div>

      <div className="advisor-info-grid">
        <div className="info-row">
          <div className="info-label">
            <Trans>Advisor Address</Trans>
          </div>
          <div className="info-value">
            {shortenAddress(advisorInfo.advisorAddress, 6)}
          </div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <Trans>Linked Accounts</Trans>
          </div>
          <div className="info-value large">
            {advisorInfo.totalLinkedAccounts}
          </div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <Trans>Total Volume</Trans>
          </div>
          <div className="info-value large">
            {formatEth(advisorInfo.totalVolume)}
          </div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <Trans>Total Commissions</Trans>
          </div>
          <div className="info-value large">
            {formatEth(advisorInfo.totalCommissions)}
          </div>
        </div>
      </div>

      <div className="affiliate-section" onClick={(e) => e.stopPropagation()}>
        <div className="affiliate-title">
          <Trans>Your Affiliate Link</Trans>
        </div>
        <div className="affiliate-input-group">
          <input
            type="text"
            className="affiliate-input"
            value={advisorInfo.affiliateLink}
            readOnly
          />
          <button
            className={`copy-button ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <span>✓</span>
                <Trans>Copied!</Trans>
              </>
            ) : (
              <>
                <span>📋</span>
                <Trans>Copy</Trans>
              </>
            )}
          </button>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#7f8c8d", lineHeight: "1.5" }}>
          <Trans>
            Share this link with potential clients. When they sign up using this link, 
            they will be automatically linked to your advisor account.
          </Trans>
        </p>
      </div>
    </div>
  );
} 