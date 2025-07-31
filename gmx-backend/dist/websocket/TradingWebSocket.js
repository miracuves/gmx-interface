"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingWebSocket = void 0;
const ws_1 = require("ws");
class TradingWebSocket {
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
                this.logger.info('WebSocket client connected', { userId });
                ws.on('message', (message) => {
                    try {
                        const parsedMessage = JSON.parse(message.toString());
                        this.handleMessage(userId, parsedMessage);
                    }
                    catch (error) {
                        this.logger.error('Error parsing WebSocket message', { error, userId });
                    }
                });
                ws.on('close', () => {
                    this.clients.delete(userId);
                    this.logger.info('WebSocket client disconnected', { userId });
                });
                ws.on('error', (error) => {
                    this.logger.error('WebSocket error', { error, userId });
                    this.clients.delete(userId);
                });
                this.sendToUser(userId, {
                    type: 'CONNECTION_ESTABLISHED',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    async handleMessage(userId, message) {
        try {
            switch (message.type) {
                case 'SUBSCRIBE_POSITIONS':
                    await this.subscribeToPositions(userId);
                    break;
                case 'SUBSCRIBE_ORDERS':
                    await this.subscribeToOrders(userId);
                    break;
                case 'SUBSCRIBE_MARKET_DATA':
                    await this.subscribeToMarketData(userId, message.marketId);
                    break;
                case 'SUBSCRIBE_TRADES':
                    await this.subscribeToTrades(userId);
                    break;
                case 'PING':
                    this.sendToUser(userId, { type: 'PONG', timestamp: new Date().toISOString() });
                    break;
                default:
                    this.logger.warn('Unknown WebSocket message type', { type: message.type, userId });
            }
        }
        catch (error) {
            this.logger.error('Error handling WebSocket message', { error, userId, message });
        }
    }
    async subscribeToPositions(userId) {
        try {
            const positions = [];
            this.sendToUser(userId, {
                type: 'POSITIONS_UPDATE',
                data: positions,
                timestamp: new Date().toISOString()
            });
            this.setupPositionUpdates(userId);
        }
        catch (error) {
            this.logger.error('Error subscribing to positions', { error, userId });
        }
    }
    async subscribeToOrders(userId) {
        try {
            const orders = [];
            this.sendToUser(userId, {
                type: 'ORDERS_UPDATE',
                data: orders,
                timestamp: new Date().toISOString()
            });
            this.setupOrderUpdates(userId);
        }
        catch (error) {
            this.logger.error('Error subscribing to orders', { error, userId });
        }
    }
    async subscribeToMarketData(userId, marketId) {
        try {
            const marketData = {
                marketId,
                price: 0,
                volume: 0,
                change24h: 0
            };
            this.sendToUser(userId, {
                type: 'MARKET_DATA_UPDATE',
                data: marketData,
                timestamp: new Date().toISOString()
            });
            this.setupMarketDataUpdates(userId, marketId);
        }
        catch (error) {
            this.logger.error('Error subscribing to market data', { error, userId, marketId });
        }
    }
    async subscribeToTrades(userId) {
        try {
            const trades = [];
            this.sendToUser(userId, {
                type: 'TRADES_UPDATE',
                data: trades,
                timestamp: new Date().toISOString()
            });
            this.setupTradeUpdates(userId);
        }
        catch (error) {
            this.logger.error('Error subscribing to trades', { error, userId });
        }
    }
    setupPositionUpdates(userId) {
        this.logger.info('Position updates set up', { userId });
    }
    setupOrderUpdates(userId) {
        this.logger.info('Order updates set up', { userId });
    }
    setupMarketDataUpdates(userId, marketId) {
        this.logger.info('Market data updates set up', { userId, marketId });
    }
    setupTradeUpdates(userId) {
        this.logger.info('Trade updates set up', { userId });
    }
    sendToUser(userId, data) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(data));
            }
            catch (error) {
                this.logger.error('Error sending message to user', { error, userId });
                this.clients.delete(userId);
            }
        }
    }
    broadcastToAll(data) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(data));
                }
                catch (error) {
                    this.logger.error('Error broadcasting message', { error });
                }
            }
        });
    }
    sendToUsers(userIds, data) {
        userIds.forEach(userId => {
            this.sendToUser(userId, data);
        });
    }
    notifyTradeExecution(userId, tradeData) {
        this.sendToUser(userId, {
            type: 'TRADE_EXECUTED',
            data: tradeData,
            timestamp: new Date().toISOString()
        });
    }
    notifyPositionUpdate(userId, positionData) {
        this.sendToUser(userId, {
            type: 'POSITION_UPDATED',
            data: positionData,
            timestamp: new Date().toISOString()
        });
    }
    notifyOrderUpdate(userId, orderData) {
        this.sendToUser(userId, {
            type: 'ORDER_UPDATED',
            data: orderData,
            timestamp: new Date().toISOString()
        });
    }
    notifyLiquidationAlert(userId, positionData) {
        this.sendToUser(userId, {
            type: 'LIQUIDATION_ALERT',
            data: positionData,
            timestamp: new Date().toISOString()
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
exports.TradingWebSocket = TradingWebSocket;
//# sourceMappingURL=TradingWebSocket.js.map