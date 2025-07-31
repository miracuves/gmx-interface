import { WebSocketServer } from 'ws';
import { Logger } from '../utils/Logger';
export declare class NotificationWebSocket {
    private wss;
    private logger;
    private clients;
    constructor(wss: WebSocketServer, logger: Logger);
    private setupWebSocket;
    private handleMessage;
    private subscribeToNotifications;
    private markNotificationAsRead;
    private setupNotificationUpdates;
    private sendToUser;
    sendTradeNotification(userId: string, tradeData: any): void;
    sendLiquidationAlert(userId: string, positionData: any): void;
    sendRewardNotification(userId: string, rewardData: any): void;
    sendAdvisorNotification(userId: string, advisorData: any): void;
    sendCompetitionNotification(userId: string, competitionData: any): void;
    sendSystemNotification(userId: string, systemData: any): void;
    broadcastNotification(data: any): void;
    private extractUserId;
}
//# sourceMappingURL=NotificationWebSocket.d.ts.map