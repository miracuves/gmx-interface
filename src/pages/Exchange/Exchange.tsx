import React from "react";
import "./Exchange.css";

// Stub functions for legacy V1 compatibility
export function getPositionQuery(tokens: any[], nativeTokenAddress: string) {
  return {
    collateralTokens: [],
    indexTokens: [],
    isLong: []
  };
}

export function getPositions(
  chainId: number,
  positionQuery: any,
  positionData: any,
  infoTokens: any,
  isPnlInLeverage: boolean,
  showPnlAfterFees: boolean,
  account: string,
  pendingPositions?: any,
  updatedPositions?: any
) {
  return {
    positions: [],
    positionsMap: {}
  };
}

export default function ExchangePage() {
  const handleOpenExchange = () => {
    window.open("https://dubaionchain.ae", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="Exchange">
      <div className="Exchange-container">
        <div className="Exchange-header">
          <h1>Exchange</h1>
          <p>Trade on Dubai On Chain Exchange</p>
        </div>
        <div className="Exchange-content">
          <div className="Exchange-description">
            <p>Click the button below to open Dubai On Chain Exchange in a new tab.</p>
          </div>
          <div className="Exchange-button-container">
            <button 
              className="Exchange-button"
              onClick={handleOpenExchange}
            >
              Open Dubai On Chain Exchange
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
