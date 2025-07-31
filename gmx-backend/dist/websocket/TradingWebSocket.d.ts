import { WebSocketServer } from 'ws';
import { Logger } from '../utils/Logger';
export declare class TradingWebSocket {
    private wss;
    private logger;
    private clients;
    constructor(wss: WebSocketServer, logger: Logger);
    private setupWebSocket;
    private handleMessage;
    private subscribeToPositions;
    private subscribeToOrders;
    private subscribeToMarketData;
    private subscribeToTrades;
    private setupPositionUpdates;
    private setupOrderUpdates;
    private setupMarketDataUpdates;
    private setupTradeUpdates;
    private sendToUser;
    broadcastToAll(data: any): void;
    sendToUsers(userIds: string[], data: any): void;
    notifyTradeExecution(userId: string, tradeData: any): void;
    notifyPositionUpdate(userId: string, positionData: any): void;
    notifyOrderUpdate(userId: string, orderData: any): void;
    notifyLiquidationAlert(userId: string, positionData: any): void;
    private extractUserId;
}
//# sourceMappingURL=TradingWebSocket.d.ts.map