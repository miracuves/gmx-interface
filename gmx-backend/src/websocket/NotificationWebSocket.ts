import { WebSocket, WebSocketServer } from 'ws';
import { Logger } from '../utils/Logger';

export class NotificationWebSocket {
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
        
        this.logger.info('Notification WebSocket client connected', { userId });
        
        ws.on('message', (message: string) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            this.handleMessage(userId, parsedMessage);
          } catch (error) {
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

        // Send initial connection confirmation
        this.sendToUser(userId, {
          type: 'NOTIFICATION_CONNECTION_ESTABLISHED',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  private async handleMessage(userId: string, message: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error handling notification WebSocket message', { error, userId, message });
    }
  }

  private async subscribeToNotifications(userId: string): Promise<void> {
    try {
      // This would fetch notifications from the database
      const notifications = []; // await this.notificationService.getUserNotifications(userId);
      
      this.sendToUser(userId, {
        type: 'NOTIFICATIONS_UPDATE',
        data: notifications,
        timestamp: new Date().toISOString()
      });

      // Set up real-time notification updates
      this.setupNotificationUpdates(userId);
      
    } catch (error) {
      this.logger.error('Error subscribing to notifications', { error, userId });
    }
  }

  private async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      // This would mark the notification as read in the database
      // await this.notificationService.markAsRead(userId, notificationId);
      
      this.logger.info('Notification marked as read', { userId, notificationId });
      
    } catch (error) {
      this.logger.error('Error marking notification as read', { error, userId, notificationId });
    }
  }

  private setupNotificationUpdates(userId: string): void {
    // This would set up a subscription to notification changes
    this.logger.info('Notification updates set up', { userId });
  }

  private sendToUser(userId: string, data: any): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        this.logger.error('Error sending notification to user', { error, userId });
        this.clients.delete(userId);
      }
    }
  }

  public sendTradeNotification(userId: string, tradeData: any): void {
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

  public sendLiquidationAlert(userId: string, positionData: any): void {
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

  public sendRewardNotification(userId: string, rewardData: any): void {
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

  public sendAdvisorNotification(userId: string, advisorData: any): void {
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

  public sendCompetitionNotification(userId: string, competitionData: any): void {
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

  public sendSystemNotification(userId: string, systemData: any): void {
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

  public broadcastNotification(data: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({
            type: 'BROADCAST_NOTIFICATION',
            data,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          this.logger.error('Error broadcasting notification', { error });
        }
      }
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