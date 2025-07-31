import { Trans } from "@lingui/macro";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { shortenAddress } from "lib/legacy";
import { useAdvisorInfo } from "domain/advisors/hooks";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";

import "./AdvisorOverviewDetail.css";

export function AdvisorOverviewDetail() {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const history = useHistory();
  const [copied, setCopied] = useState(false);
  
  const { advisorInfo, loading, error } = useAdvisorInfo(advisorAddress);

  const handleCopy = async () => {
    if (!advisorInfo) return;
    try {
      await navigator.clipboard.writeText(advisorInfo.affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const formatEth = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(2)} ETH`;
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="AdvisorOverviewDetail">
        <div className="container">
          <div className="error-message">
            <Trans>Error loading advisor details: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  if (!advisorInfo) {
    return (
      <div className="AdvisorOverviewDetail">
        <div className="container">
          <div className="error-message">
            <Trans>Advisor not found</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AdvisorOverviewDetail">
      <SEO title="Advisor Overview Details" />
      <div className="container">
        <div className="header-section">
          <button 
            className="back-button"
            onClick={() => history.push(`/advisor/${advisorAddress}`)}
          >
            ← <Trans>Back to Dashboard</Trans>
          </button>
          <PageTitle title={<Trans>Advisor Overview Details</Trans>} />
        </div>

        <div className="overview-content">
          <div className="main-info-section">
            <div className="advisor-card">
              <div className="card-header">
                <h2 className="card-title">
                  <Trans>Advisor Information</Trans>
                </h2>
                <div className="status-badge active">
                  <Trans>Active</Trans>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">
                    <Trans>Advisor Address</Trans>
                  </div>
                  <div className="info-value">
                    {shortenAddress(advisorInfo.advisorAddress, 6)}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <Trans>Advisor ID</Trans>
                  </div>
                  <div className="info-value">
                    {advisorInfo.advisorId}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <Trans>Registration Date</Trans>
                  </div>
                  <div className="info-value">
                    {new Date(advisorInfo.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <Trans>Status</Trans>
                  </div>
                  <div className="info-value">
                    {advisorInfo.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h3 className="card-title">
                <Trans>Key Statistics</Trans>
              </h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value large">
                    {advisorInfo.totalLinkedAccounts}
                  </div>
                  <div className="stat-label">
                    <Trans>Linked Accounts</Trans>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-value large">
                    {formatEth(advisorInfo.totalVolume)}
                  </div>
                  <div className="stat-label">
                    <Trans>Total Volume</Trans>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-value large">
                    {formatEth(advisorInfo.totalCommissions)}
                  </div>
                  <div className="stat-label">
                    <Trans>Total Commissions</Trans>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="affiliate-section">
            <div className="affiliate-card">
              <h3 className="card-title">
                <Trans>Affiliate Link Management</Trans>
              </h3>
              
              <div className="affiliate-info">
                <div className="info-row">
                  <div className="info-label">
                    <Trans>Your Affiliate Link</Trans>
                  </div>
                  <div className="link-input-group">
                    <input
                      type="text"
                      className="link-input"
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
                </div>

                <div className="link-stats">
                  <div className="stat-item">
                    <div className="stat-value">0</div>
                    <div className="stat-label">
                      <Trans>Clicks Today</Trans>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">0</div>
                    <div className="stat-label">
                      <Trans>Conversions</Trans>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">0%</div>
                    <div className="stat-label">
                      <Trans>Conversion Rate</Trans>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sharing-options">
                <h4 className="section-title">
                  <Trans>Share Your Link</Trans>
                </h4>
                <div className="share-buttons">
                  <button className="share-button twitter">
                    <span>🐦</span>
                    <Trans>Twitter</Trans>
                  </button>
                  <button className="share-button telegram">
                    <span>📱</span>
                    <Trans>Telegram</Trans>
                  </button>
                  <button className="share-button discord">
                    <span>💬</span>
                    <Trans>Discord</Trans>
                  </button>
                  <button className="share-button email">
                    <span>📧</span>
                    <Trans>Email</Trans>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-card">
              <h3 className="card-title">
                <Trans>Account Settings</Trans>
              </h3>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-label">
                    <Trans>Commission Rate</Trans>
                  </div>
                  <div className="setting-value">
                    30%
                  </div>
                  <button className="edit-button">
                    <Trans>Edit</Trans>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <Trans>Auto-approve Clients</Trans>
                  </div>
                  <div className="setting-value">
                    Enabled
                  </div>
                  <button className="edit-button">
                    <Trans>Edit</Trans>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <Trans>Email Notifications</Trans>
                  </div>
                  <div className="setting-value">
                    Enabled
                  </div>
                  <button className="edit-button">
                    <Trans>Edit</Trans>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <Trans>Minimum Trade Size</Trans>
                  </div>
                  <div className="setting-value">
                    0.01 ETH
                  </div>
                  <button className="edit-button">
                    <Trans>Edit</Trans>
                  </button>
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