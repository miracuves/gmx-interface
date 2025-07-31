import { Trans } from "@lingui/macro";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { shortenAddress } from "lib/legacy";
import { formatTokenAmount } from "lib/numbers";
import { useAdvisorStats } from "domain/advisors/hooks";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";

import "./AdvisorStatsDetail.css";

export function AdvisorStatsDetail() {
  const { advisorAddress } = useParams<{ advisorAddress?: string }>();
  const history = useHistory();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');
  
  const { stats, loading, error } = useAdvisorStats(advisorAddress);

  const formatEth = (value: bigint) => {
    return formatTokenAmount(value, 18, undefined, { displayDecimals: 2 });
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="AdvisorStatsDetail">
        <div className="container">
          <div className="error-message">
            <Trans>Error loading advisor statistics: {error}</Trans>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="AdvisorStatsDetail">
        <div className="container">
          <div className="error-message">
            <Trans>No statistics found</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AdvisorStatsDetail">
      <SEO title="Advisor Statistics Details" />
      <div className="container">
        <div className="header-section">
          <button 
            className="back-button"
            onClick={() => history.push(`/advisor/${advisorAddress}`)}
          >
            ← <Trans>Back to Dashboard</Trans>
          </button>
          <PageTitle title={<Trans>Performance Statistics</Trans>} />
        </div>

        <div className="stats-content">
          <div className="overview-section">
            <div className="overview-card">
              <h3 className="card-title">
                <Trans>Performance Overview</Trans>
              </h3>
              <div className="overview-grid">
                <div className="overview-item">
                  <div className="overview-value large">
                    {formatEth(stats.totalVolume)}
                  </div>
                  <div className="overview-label">
                    <Trans>Total Volume</Trans>
                  </div>
                  <div className="overview-change positive">
                    +12.5% from last month
                  </div>
                </div>

                <div className="overview-item">
                  <div className="overview-value large">
                    {formatEth(stats.totalCommissions)}
                  </div>
                  <div className="overview-label">
                    <Trans>Total Commissions</Trans>
                  </div>
                  <div className="overview-change positive">
                    +8.3% from last month
                  </div>
                </div>

                <div className="overview-item">
                  <div className="overview-value large">
                    {stats.totalLinkedAccounts}
                  </div>
                  <div className="overview-label">
                    <Trans>Linked Accounts</Trans>
                  </div>
                  <div className="overview-change positive">
                    +2 this month
                  </div>
                </div>

                <div className="overview-item">
                  <div className="overview-value large">
                    {formatEth(stats.monthlyVolume)}
                  </div>
                  <div className="overview-label">
                    <Trans>Monthly Volume</Trans>
                  </div>
                  <div className="overview-change positive">
                    +15.2% from last month
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="detailed-stats-section">
            <div className="stats-card">
              <h3 className="card-title">
                <Trans>Monthly Performance</Trans>
              </h3>
              <div className="monthly-stats">
                <div className="monthly-item">
                  <div className="monthly-header">
                    <div className="monthly-label">
                      <Trans>January 2024</Trans>
                    </div>
                    <div className="monthly-change positive">+15.2%</div>
                  </div>
                  <div className="monthly-details">
                    <div className="monthly-stat">
                      <span className="stat-label">Volume:</span>
                      <span className="stat-value">{formatEth(stats.monthlyVolume)}</span>
                    </div>
                    <div className="monthly-stat">
                      <span className="stat-label">Commissions:</span>
                      <span className="stat-value">{formatEth(stats.monthlyCommissions)}</span>
                    </div>
                    <div className="monthly-stat">
                      <span className="stat-label">New Accounts:</span>
                      <span className="stat-value">2</span>
                    </div>
                  </div>
                </div>

                <div className="monthly-item">
                  <div className="monthly-header">
                    <div className="monthly-label">
                      <Trans>December 2023</Trans>
                    </div>
                    <div className="monthly-change positive">+8.7%</div>
                  </div>
                  <div className="monthly-details">
                    <div className="monthly-stat">
                      <span className="stat-label">Volume:</span>
                      <span className="stat-value">8.5 ETH</span>
                    </div>
                    <div className="monthly-stat">
                      <span className="stat-label">Commissions:</span>
                      <span className="stat-value">0.25 ETH</span>
                    </div>
                    <div className="monthly-stat">
                      <span className="stat-label">New Accounts:</span>
                      <span className="stat-value">1</span>
                    </div>
                  </div>
                </div>

                <div className="monthly-item">
                  <div className="monthly-header">
                    <div className="monthly-label">
                      <Trans>November 2023</Trans>
                    </div>
                    <div className="monthly-change negative">-2.1%</div>
                  </div>
                  <div className="monthly-details">
                    <div className="monthly-stat">
                      <span className="stat-label">Volume:</span>
                      <span className="stat-value">7.8 ETH</span>
                    </div>
                    <div className="monthly-stat">
                      <span className="stat-label">Commissions:</span>
                      <span className="stat-value">0.23 ETH</span>
                    </div>
                    <div className="monthly-stat">
                      <span className="stat-label">New Accounts:</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3 className="card-title">
                <Trans>Performance Analytics</Trans>
              </h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-header">
                    <div className="analytics-label">
                      <Trans>Success Rate</Trans>
                    </div>
                    <div className="analytics-value">94.2%</div>
                  </div>
                  <div className="analytics-bar">
                    <div className="analytics-progress" style={{ width: '94.2%' }}></div>
                  </div>
                </div>

                <div className="analytics-item">
                  <div className="analytics-header">
                    <div className="analytics-label">
                      <Trans>Average Commission</Trans>
                    </div>
                    <div className="analytics-value">
                      {formatEth(stats.totalCommissions / BigInt(Math.max(stats.totalLinkedAccounts, 1)))}
                    </div>
                  </div>
                  <div className="analytics-bar">
                    <div className="analytics-progress" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="analytics-item">
                  <div className="analytics-header">
                    <div className="analytics-label">
                      <Trans>Active Accounts</Trans>
                    </div>
                    <div className="analytics-value">{stats.activeLinkedAccounts}</div>
                  </div>
                  <div className="analytics-bar">
                    <div className="analytics-progress" style={{ width: `${(stats.activeLinkedAccounts / stats.totalLinkedAccounts) * 100}%` }}></div>
                  </div>
                </div>

                <div className="analytics-item">
                  <div className="analytics-header">
                    <div className="analytics-label">
                      <Trans>Commission Rate</Trans>
                    </div>
                    <div className="analytics-value">30%</div>
                  </div>
                  <div className="analytics-bar">
                    <div className="analytics-progress" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="comparison-section">
            <div className="comparison-card">
              <h3 className="card-title">
                <Trans>Performance Comparison</Trans>
              </h3>
              <div className="comparison-grid">
                <div className="comparison-item">
                  <div className="comparison-label">
                    <Trans>This Month vs Last Month</Trans>
                  </div>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="stat-label">Volume:</span>
                      <span className="stat-value positive">+15.2%</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Commissions:</span>
                      <span className="stat-value positive">+8.3%</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">New Accounts:</span>
                      <span className="stat-value positive">+2</span>
                    </div>
                  </div>
                </div>

                <div className="comparison-item">
                  <div className="comparison-label">
                    <Trans>This Year vs Last Year</Trans>
                  </div>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="stat-label">Volume:</span>
                      <span className="stat-value positive">+45.7%</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Commissions:</span>
                      <span className="stat-value positive">+38.2%</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Total Accounts:</span>
                      <span className="stat-value positive">+12</span>
                    </div>
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