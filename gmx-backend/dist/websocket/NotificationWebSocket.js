"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationWebSocket = void 0;
const ws_1 = require("ws");
class NotificationWebSocket {
    constructor(wss, logger) {
        this.wss = wss;
        this.clients = new Map();
        this.logger = logger;
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            const userId = this.extractUserId(req);
            if (userId) {
                this.clients.set(userId, ws);
                this.logger.info('Notification WebSocket client connected', { userId });
                ws.on('message', (message) => {
                    try {
                        const parsedMessage = JSON.parse(message.toString());
                        this.handleMessage(userId, parsedMessage);
                    }
                    catch (error) {
                        this.logger.error('Error parsing notification WebSocket message', { error, userId });
                    }
                });
                ws.on('close', () => {
                    this.clients.delete(userId);
                    this.logger.info('Notification WebSocket client disconnected', { userId });
                });
                ws.on('error', (error) => {
                    this.logger.error('Notification WebSocket error', { error, userId });
                    this.clients.delete(userId);
                });
                this.sendToUser(userId, {
                    type: 'NOTIFICATION_CONNECTION_ESTABLISHED',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    async handleMessage(userId, message) {
        try {
            switch (message.type) {
                case 'SUBSCRIBE_NOTIFICATIONS':
                    await this.subscribeToNotifications(userId);
                    break;
                case 'MARK_AS_READ':
                    await this.markNotificationAsRead(userId, message.notificationId);
                    break;
                case 'PING':
                    this.sendToUser(userId, { type: 'PONG', timestamp: new Date().toISOString() });
                    break;
                default:
                    this.logger.warn('Unknown notification WebSocket message type', { type: message.type, userId });
            }
        }
        catch (error) {
            this.logger.error('Error handling notification WebSocket message', { error, userId, message });
        }
    }
    async subscribeToNotifications(userId) {
        try {
            const notifications = [];
            this.sendToUser(userId, {
                type: 'NOTIFICATIONS_UPDATE',
                data: notifications,
                timestamp: new Date().toISOString()
            });
            this.setupNotificationUpdates(userId);
        }
        catch (error) {
            this.logger.error('Error subscribing to notifications', { error, userId });
        }
    }
    async markNotificationAsRead(userId, notificationId) {
        try {
            this.logger.info('Notification marked as read', { userId, notificationId });
        }
        catch (error) {
            this.logger.error('Error marking notification as read', { error, userId, notificationId });
        }
    }
    setupNotificationUpdates(userId) {
        this.logger.info('Notification updates set up', { userId });
    }
    sendToUser(userId, data) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(data));
            }
            catch (error) {
                this.logger.error('Error sending notification to user', { error, userId });
                this.clients.delete(userId);
            }
        }
    }
    sendTradeNotification(userId, tradeData) {
        this.sendToUser(userId, {
            type: 'TRADE_NOTIFICATION',
            data: {
                title: 'Trade Executed',
                message: `Your ${tradeData.side} order for ${tradeData.sizeUsd} USD has been executed`,
                tradeData,
                priority: 'medium'
            },
            timestamp: new Date().toISOString()
        });
    }
    sendLiquidationAlert(userId, positionData) {
        this.sendToUser(userId, {
            type: 'LIQUIDATION_ALERT',
            data: {
                title: 'Liquidation Warning',
                message: 'Your position is at risk of liquidation',
                positionData,
                priority: 'high'
            },
            timestamp: new Date().toISOString()
        });
    }
    sendRewardNotification(userId, rewardData) {
        this.sendToUser(userId, {
            type: 'REWARD_NOTIFICATION',
            data: {
                title: 'Rewards Available',
                message: `You have ${rewardData.amount} rewards available to claim`,
                rewardData,
                priority: 'medium'
            },
            timestamp: new Date().toISOString()
        });
    }
    sendAdvisorNotification(userId, advisorData) {
        this.sendToUser(userId, {
            type: 'ADVISOR_NOTIFICATION',
            data: {
                title: 'Advisor Update',
                message: 'Your advisor has executed a group trade',
                advisorData,
                priority: 'medium'
            },
            timestamp: new Date().toISOString()
        });
    }
    sendCompetitionNotification(userId, competitionData) {
        this.sendToUser(userId, {
            type: 'COMPETITION_NOTIFICATION',
            data: {
                title: 'Competition Update',
                message: 'New competition is starting soon',
                competitionData,
                priority: 'low'
            },
            timestamp: new Date().toISOString()
        });
    }
    sendSystemNotification(userId, systemData) {
        this.sendToUser(userId, {
            type: 'SYSTEM_NOTIFICATION',
            data: {
                title: 'System Update',
                message: systemData.message,
                systemData,
                priority: 'low'
            },
            timestamp: new Date().toISOString()
        });
    }
    broadcastNotification(data) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify({
                        type: 'BROADCAST_NOTIFICATION',
                        data,
                        timestamp: new Date().toISOString()
                    }));
                }
                catch (error) {
                    this.logger.error('Error broadcasting notification', { error });
                }
            }
        });
    }
    extractUserId(req) {
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token');
        if (token) {
            return 'user-' + Math.random().toString(36).substr(2, 9);
        }
        return null;
    }
}
exports.NotificationWebSocket = NotificationWebSocket;
//# sourceMappingURL=NotificationWebSocket.js.map