import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { Config } from './config/Config';
import { DatabaseService } from './services/database/DatabaseService';
import { RedisService } from './services/redis/RedisService';
import { Logger } from './utils/Logger';
import { ErrorHandler } from './middleware/ErrorHandler';
// import { AuthMiddleware } from './middleware/AuthMiddleware';

// Import routes
import { userRoutes } from './routes/userRoutes';
import { tradingRoutes } from './routes/tradingRoutes';
import { stakingRoutes } from './routes/stakingRoutes';
import { referralRoutes } from './routes/referralRoutes';
import { advisorRoutes } from './routes/advisorRoutes';
import { competitionRoutes } from './routes/competitionRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';
import { adminRoutes } from './routes/adminRoutes';

// Import WebSocket handlers
import { TradingWebSocket } from './websocket/TradingWebSocket';
import { NotificationWebSocket } from './websocket/NotificationWebSocket';

// Load environment variables
dotenv.config();

class GMXBackend {
  private app: express.Application;
  private server: any;
  private wss!: WebSocketServer;
  private logger: Logger;
  private db!: DatabaseService;
  private redis!: RedisService;

  constructor() {
    this.logger = new Logger();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: Config.cors.origins,
      credentials: true
    }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: { write: (message: string) => this.logger.info(message.trim()) }
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use(require('express-rate-limit')({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/trading', tradingRoutes);
    this.app.use('/api/v1/staking', stakingRoutes);
    this.app.use('/api/v1/referrals', referralRoutes);
    this.app.use('/api/v1/advisors', advisorRoutes);
    this.app.use('/api/v1/competitions', competitionRoutes);
    this.app.use('/api/v1/analytics', analyticsRoutes);
    this.app.use('/api/v1/admin', adminRoutes);

    // 404 handler
    this.app.use('*', (_req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    });

    // Error handling middleware
    this.app.use(ErrorHandler.handle);
  }

  private setupWebSocket(): void {
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    // Initialize WebSocket handlers
    new TradingWebSocket(this.wss, this.logger);
    new NotificationWebSocket(this.wss, this.logger);

    this.logger.info('WebSocket server initialized');
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database
      this.db = new DatabaseService();
      await this.db.connect();
      this.logger.info('Database connected successfully');

      // Initialize Redis
      this.redis = new RedisService();
      await this.redis.connect();
      this.logger.info('Redis connected successfully');

      // Initialize blockchain services
      await this.initializeBlockchainServices();

    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  private async initializeBlockchainServices(): Promise<void> {
    try {
      // Initialize Web3 connections
      const { Web3Service } = await import('./services/blockchain/Web3Service');
      const web3Service = new Web3Service();
      await web3Service.initialize();
      this.logger.info('Blockchain services initialized');

      // Initialize GMX contract services
      const { GMXContractService } = await import('./services/blockchain/GMXContractService');
      const gmxService = new GMXContractService(web3Service);
      await gmxService.initialize();
      this.logger.info('GMX contract services initialized');

    } catch (error) {
      this.logger.error('Failed to initialize blockchain services:', error);
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initializeServices();

      const port = Config.server.port;
      this.server.listen(port, () => {
        this.logger.info(`🚀 GMX Backend Server running on port ${port}`);
        this.logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
        this.logger.info(`🔗 Health check: http://localhost:${port}/health`);
        this.logger.info(`📡 WebSocket: ws://localhost:${port}`);
      });

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      this.server.close();
      await this.db?.disconnect();
      await this.redis?.disconnect();
      this.logger.info('Server stopped gracefully');
    } catch (error) {
      this.logger.error('Error stopping server:', error);
    }
  }
}

// Start the server
const server = new GMXBackend();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  server.stop();
});

process.on('SIGINT', () => {
  server.stop();
});

export default GMXBackend; 