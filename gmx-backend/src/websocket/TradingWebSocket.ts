import { WebSocket, WebSocketServer } from 'ws';
import { Logger } from '../utils/Logger';

export class TradingWebSocket {
  private logger: Logger;
  private clients: Map<string, WebSocket> = new Map();

  constructor(private wss: WebSocketServer, logger: Logger) {
    this.logger = logger;
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const userId = this.extractUserId(req);
      if (userId) {
        this.clients.set(userId, ws);
        
        this.logger.info('WebSocket client connected', { userId });
        
        ws.on('message', (message: string) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            this.handleMessage(userId, parsedMessage);
          } catch (error) {
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

        // Send initial connection confirmation
        this.sendToUser(userId, {
          type: 'CONNECTION_ESTABLISHED',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  private async handleMessage(userId: string, message: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error handling WebSocket message', { error, userId, message });
    }
  }

  private async subscribeToPositions(userId: string): Promise<void> {
    try {
      // This would fetch positions from the database/trading service
      const positions = []; // await this.tradingService.getPositions(userId);
      
      this.sendToUser(userId, {
        type: 'POSITIONS_UPDATE',
        data: positions,
        timestamp: new Date().toISOString()
      });

      // Set up real-time position updates
      this.setupPositionUpdates(userId);
      
    } catch (error) {
      this.logger.error('Error subscribing to positions', { error, userId });
    }
  }

  private async subscribeToOrders(userId: string): Promise<void> {
    try {
      // This would fetch orders from the database/trading service
      const orders = []; // await this.tradingService.getOrders(userId);
      
      this.sendToUser(userId, {
        type: 'ORDERS_UPDATE',
        data: orders,
        timestamp: new Date().toISOString()
      });

      // Set up real-time order updates
      this.setupOrderUpdates(userId);
      
    } catch (error) {
      this.logger.error('Error subscribing to orders', { error, userId });
    }
  }

  private async subscribeToMarketData(userId: string, marketId: string): Promise<void> {
    try {
      // This would fetch market data from the trading service
      const marketData = {
        marketId,
        price: 0,
        volume: 0,
        change24h: 0
      }; // await this.tradingService.getMarketData(marketId);
      
      this.sendToUser(userId, {
        type: 'MARKET_DATA_UPDATE',
        data: marketData,
        timestamp: new Date().toISOString()
      });

      // Set up real-time market data updates
      this.setupMarketDataUpdates(userId, marketId);
      
    } catch (error) {
      this.logger.error('Error subscribing to market data', { error, userId, marketId });
    }
  }

  private async subscribeToTrades(userId: string): Promise<void> {
    try {
      // This would fetch recent trades from the database
      const trades = []; // await this.tradingService.getRecentTrades(userId);
      
      this.sendToUser(userId, {
        type: 'TRADES_UPDATE',
        data: trades,
        timestamp: new Date().toISOString()
      });

      // Set up real-time trade updates
      this.setupTradeUpdates(userId);
      
    } catch (error) {
      this.logger.error('Error subscribing to trades', { error, userId });
    }
  }

  private setupPositionUpdates(userId: string): void {
    // This would set up a subscription to position changes
    // For now, we'll just log that it's set up
    this.logger.info('Position updates set up', { userId });
  }

  private setupOrderUpdates(userId: string): void {
    // This would set up a subscription to order changes
    this.logger.info('Order updates set up', { userId });
  }

  private setupMarketDataUpdates(userId: string, marketId: string): void {
    // This would set up a subscription to market data changes
    this.logger.info('Market data updates set up', { userId, marketId });
  }

  private setupTradeUpdates(userId: string): void {
    // This would set up a subscription to trade updates
    this.logger.info('Trade updates set up', { userId });
  }

  private sendToUser(userId: string, data: any): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        this.logger.error('Error sending message to user', { error, userId });
        this.clients.delete(userId);
      }
    }
  }

  public broadcastToAll(data: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(data));
        } catch (error) {
          this.logger.error('Error broadcasting message', { error });
        }
      }
    });
  }

  public sendToUsers(userIds: string[], data: any): void {
    userIds.forEach(userId => {
      this.sendToUser(userId, data);
    });
  }

  public notifyTradeExecution(userId: string, tradeData: any): void {
    this.sendToUser(userId, {
      type: 'TRADE_EXECUTED',
      data: tradeData,
      timestamp: new Date().toISOString()
    });
  }

  public notifyPositionUpdate(userId: string, positionData: any): void {
    this.sendToUser(userId, {
      type: 'POSITION_UPDATED',
      data: positionData,
      timestamp: new Date().toISOString()
    });
  }

  public notifyOrderUpdate(userId: string, orderData: any): void {
    this.sendToUser(userId, {
      type: 'ORDER_UPDATED',
      data: orderData,
      timestamp: new Date().toISOString()
    });
  }

  public notifyLiquidationAlert(userId: string, positionData: any): void {
    this.sendToUser(userId, {
      type: 'LIQUIDATION_ALERT',
      data: positionData,
      timestamp: new Date().toISOString()
    });
  }

  private extractUserId(req: any): string | null {
    // This would extract user ID from the request
    // For now, we'll use a placeholder
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (token) {
      // In a real implementation, you would verify the token and extract user ID
      return 'user-' + Math.random().toString(36).substr(2, 9);
    }
    
    return null;
  }
} 