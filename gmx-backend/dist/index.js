"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const ws_1 = require("ws");
const Config_1 = require("./config/Config");
const DatabaseService_1 = require("./services/database/DatabaseService");
const RedisService_1 = require("./services/redis/RedisService");
const Logger_1 = require("./utils/Logger");
const ErrorHandler_1 = require("./middleware/ErrorHandler");
const userRoutes_1 = require("./routes/userRoutes");
const tradingRoutes_1 = require("./routes/tradingRoutes");
const stakingRoutes_1 = require("./routes/stakingRoutes");
const referralRoutes_1 = require("./routes/referralRoutes");
const advisorRoutes_1 = require("./routes/advisorRoutes");
const competitionRoutes_1 = require("./routes/competitionRoutes");
const analyticsRoutes_1 = require("./routes/analyticsRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const TradingWebSocket_1 = require("./websocket/TradingWebSocket");
const NotificationWebSocket_1 = require("./websocket/NotificationWebSocket");
dotenv_1.default.config();
class GMXBackend {
    constructor() {
        this.logger = new Logger_1.Logger();
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }
    setupMiddleware() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: Config_1.Config.cors.origins,
            credentials: true
        }));
        this.app.use((0, morgan_1.default)('combined', {
            stream: { write: (message) => this.logger.info(message.trim()) }
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(require('express-rate-limit')({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: 'Too many requests from this IP, please try again later.'
        }));
    }
    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV
            });
        });
        this.app.use('/api/v1/users', userRoutes_1.userRoutes);
        this.app.use('/api/v1/trading', tradingRoutes_1.tradingRoutes);
        this.app.use('/api/v1/staking', stakingRoutes_1.stakingRoutes);
        this.app.use('/api/v1/referrals', referralRoutes_1.referralRoutes);
        this.app.use('/api/v1/advisors', advisorRoutes_1.advisorRoutes);
        this.app.use('/api/v1/competitions', competitionRoutes_1.competitionRoutes);
        this.app.use('/api/v1/analytics', analyticsRoutes_1.analyticsRoutes);
        this.app.use('/api/v1/admin', adminRoutes_1.adminRoutes);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        });
        this.app.use(ErrorHandler_1.ErrorHandler.handle);
    }
    setupWebSocket() {
        this.server = (0, http_1.createServer)(this.app);
        this.wss = new ws_1.WebSocketServer({ server: this.server });
        new TradingWebSocket_1.TradingWebSocket(this.wss, this.logger);
        new NotificationWebSocket_1.NotificationWebSocket(this.wss, this.logger);
        this.logger.info('WebSocket server initialized');
    }
    async initializeServices() {
        try {
            this.db = new DatabaseService_1.DatabaseService();
            await this.db.connect();
            this.logger.info('Database connected successfully');
            this.redis = new RedisService_1.RedisService();
            await this.redis.connect();
            this.logger.info('Redis connected successfully');
            await this.initializeBlockchainServices();
        }
        catch (error) {
            this.logger.error('Failed to initialize services:', error);
            process.exit(1);
        }
    }
    async initializeBlockchainServices() {
        try {
            const { Web3Service } = await Promise.resolve().then(() => __importStar(require('./services/blockchain/Web3Service')));
            const web3Service = new Web3Service();
            await web3Service.initialize();
            this.logger.info('Blockchain services initialized');
            const { GMXContractService } = await Promise.resolve().then(() => __importStar(require('./services/blockchain/GMXContractService')));
            const gmxService = new GMXContractService(web3Service);
            await gmxService.initialize();
            this.logger.info('GMX contract services initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize blockchain services:', error);
        }
    }
    async start() {
        try {
            await this.initializeServices();
            const port = Config_1.Config.server.port;
            this.server.listen(port, () => {
                this.logger.info(`🚀 GMX Backend Server running on port ${port}`);
                this.logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
                this.logger.info(`🔗 Health check: http://localhost:${port}/health`);
                this.logger.info(`📡 WebSocket: ws://localhost:${port}`);
            });
        }
        catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async stop() {
        try {
            this.server.close();
            await this.db?.disconnect();
            await this.redis?.disconnect();
            this.logger.info('Server stopped gracefully');
        }
        catch (error) {
            this.logger.error('Error stopping server:', error);
        }
    }
}
const server = new GMXBackend();
server.start();
process.on('SIGTERM', () => {
    server.stop();
});
process.on('SIGINT', () => {
    server.stop();
});
exports.default = GMXBackend;
//# sourceMappingURL=index.js.map