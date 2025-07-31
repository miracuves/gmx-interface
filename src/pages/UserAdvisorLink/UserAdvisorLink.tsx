import { Trans } from "@lingui/macro";
import { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import useWallet from "lib/wallets/useWallet";
import { shortenAddress } from "lib/legacy";

import Loader from "components/Common/Loader";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageTitle/PageTitle";
import Button from "components/Button/Button";

import "./UserAdvisorLink.css";

export function UserAdvisorLink() {
  const { advisorAddress } = useParams<{ advisorAddress: string }>();
  const { account } = useWallet();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);

  const handleLinkToAdvisor = async () => {
    if (!account || !advisorAddress) return;

    setLoading(true);
    try {
      // TODO: Implement actual linking logic
      console.log('Linking user', account, 'to advisor', advisorAddress);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLinked(true);
      setTimeout(() => {
        history.push('/trade');
      }, 2000);
    } catch (error) {
      console.error('Failed to link to advisor:', error);
      alert('Failed to link to advisor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    history.push('/trade');
  };

  if (!advisorAddress) {
    return (
      <div className="UserAdvisorLink">
        <div className="container">
          <div className="error-message">
            <Trans>Invalid advisor address</Trans>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="UserAdvisorLink">
      <SEO title="Link to Advisor" />
      <div className="container">
        <PageTitle title={<Trans>Link to Advisor</Trans>} />
        
        <div className="UserAdvisorLink-content">
          <div className="advisor-card">
            <div className="advisor-header">
              <h2><Trans>Advisor Invitation</Trans></h2>
            </div>
            
            <div className="advisor-info">
              <div className="info-row">
                <span className="label"><Trans>Advisor Address:</Trans></span>
                <span className="value">{shortenAddress(advisorAddress, 6)}</span>
              </div>
              
              <div className="info-row">
                <span className="label"><Trans>Your Address:</Trans></span>
                <span className="value">{account ? shortenAddress(account, 6) : <Trans>Not connected</Trans>}</span>
              </div>
            </div>
            
            <div className="advisor-description">
              <h3><Trans>What this means:</Trans></h3>
              <ul>
                <li><Trans>This advisor will be able to trade on your account</Trans></li>
                <li><Trans>You can still trade on your account at any time</Trans></li>
                <li><Trans>The advisor will earn 30% of the spread on trades</Trans></li>
                <li><Trans>You can unlink the advisor anytime from your settings</Trans></li>
                <li><Trans>The advisor cannot withdraw or transfer your funds</Trans></li>
              </ul>
            </div>
            
            {linked ? (
              <div className="success-message">
                <h3><Trans>Successfully Linked!</Trans></h3>
                <p><Trans>You are now linked to this advisor. Redirecting to trading...</Trans></p>
              </div>
            ) : (
              <div className="action-buttons">
                <Button
                  onClick={handleLinkToAdvisor}
                  disabled={loading || !account}
                  className="link-button"
                  variant="primary"
                >
                  {loading ? <Trans>Linking...</Trans> : <Trans>Link to Advisor</Trans>}
                </Button>
                
                <Button
                  onClick={handleDecline}
                  disabled={loading}
                  variant="secondary"
                  className="decline-button"
                >
                  <Trans>Decline</Trans>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 