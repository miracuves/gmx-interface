# GMX Backend Implementation Example

## 🚀 **Quick Start Implementation**

### **1. Project Structure**
```
gmx-backend/
├── src/
│   ├── services/
│   │   ├── user/
│   │   ├── trading/
│   │   ├── staking/
│   │   ├── referral/
│   │   ├── advisor/
│   │   ├── competition/
│   │   └── analytics/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   └── config/
├── docker/
├── tests/
├── docs/
└── package.json
```

### **2. Core Service Implementation**

#### **User Management Service**
```typescript
// src/services/user/UserService.ts
import { User, UserProfile, AuthToken } from '../models/User';
import { DatabaseService } from '../database/DatabaseService';
import { JWTService } from '../utils/JWTService';
import { Web3Service } from '../utils/Web3Service';

export class UserService {
  constructor(
    private db: DatabaseService,
    private jwt: JWTService,
    private web3: Web3Service
  ) {}

  async registerUser(userData: {
    email: string;
    walletAddress: string;
    referralCode?: string;
  }): Promise<User> {
    // Validate wallet address
    if (!this.web3.isValidAddress(userData.walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Check if user already exists
    const existingUser = await this.db.users.findByWallet(userData.walletAddress);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await this.db.users.create({
      email: userData.email,
      walletAddress: userData.walletAddress,
      referralCode: userData.referralCode,
      createdAt: new Date(),
      isActive: true
    });

    // If referral code provided, link to referrer
    if (userData.referralCode) {
      await this.linkReferral(user.id, userData.referralCode);
    }

    return user;
  }

  async authenticateUser(walletAddress: string, signature: string, message: string): Promise<AuthToken> {
    // Verify signature
    const isValidSignature = await this.web3.verifySignature(
      walletAddress,
      signature,
      message
    );

    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    // Get or create user
    let user = await this.db.users.findByWallet(walletAddress);
    if (!user) {
      user = await this.registerUser({ walletAddress, email: '' });
    }

    // Generate JWT token
    const token = this.jwt.generateToken({
      userId: user.id,
      walletAddress: user.walletAddress,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role
      }
    };
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.db.users.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get trading stats
    const tradingStats = await this.db.trades.getUserStats(userId);
    
    // Get staking info
    const stakingInfo = await this.db.staking.getUserStaking(userId);
    
    // Get referral info
    const referralInfo = await this.db.referrals.getUserReferrals(userId);

    return {
      ...user,
      tradingStats,
      stakingInfo,
      referralInfo
    };
  }
}
```

#### **Trading Engine Service**
```typescript
// src/services/trading/TradingService.ts
import { TradingOrder, OrderResult, Position } from '../models/Trading';
import { Web3Service } from '../utils/Web3Service';
import { GMXContractService } from '../utils/GMXContractService';

export class TradingService {
  constructor(
    private web3: Web3Service,
    private gmxContracts: GMXContractService,
    private db: DatabaseService
  ) {}

  async placeOrder(order: TradingOrder): Promise<OrderResult> {
    // Validate order
    const validation = await this.validateOrder(order);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check user balance and risk limits
    const riskCheck = await this.checkRiskLimits(order.userId, order);
    if (!riskCheck.passed) {
      throw new Error(riskCheck.error);
    }

    // Execute on blockchain
    const txHash = await this.gmxContracts.executeOrder(order);
    
    // Store in database
    const dbOrder = await this.db.trades.create({
      userId: order.userId,
      marketId: order.marketId,
      orderType: order.orderType,
      side: order.side,
      sizeUsd: order.sizeUsd,
      price: order.price,
      txHash,
      status: 'pending'
    });

    // Monitor transaction
    this.monitorTransaction(txHash, dbOrder.id);

    return {
      orderId: dbOrder.id,
      txHash,
      status: 'pending'
    };
  }

  async getPositions(userId: string): Promise<Position[]> {
    // Get from database
    const dbPositions = await this.db.positions.findByUser(userId);
    
    // Enrich with real-time data from blockchain
    const enrichedPositions = await Promise.all(
      dbPositions.map(async (position) => {
        const onChainData = await this.gmxContracts.getPosition(
          position.marketId,
          position.userId
        );
        
        return {
          ...position,
          currentPrice: onChainData.currentPrice,
          unrealizedPnl: onChainData.unrealizedPnl,
          liquidationPrice: onChainData.liquidationPrice
        };
      })
    );

    return enrichedPositions;
  }

  async validateOrder(order: TradingOrder): Promise<ValidationResult> {
    // Check market exists and is active
    const market = await this.db.markets.findById(order.marketId);
    if (!market || !market.isActive) {
      return { isValid: false, error: 'Market not available' };
    }

    // Check order size limits
    if (order.sizeUsd < market.minOrderSize || order.sizeUsd > market.maxOrderSize) {
      return { isValid: false, error: 'Order size outside limits' };
    }

    // Check leverage limits
    if (order.leverage > market.maxLeverage) {
      return { isValid: false, error: 'Leverage too high' };
    }

    return { isValid: true };
  }
}
```

#### **Advisor Management Service**
```typescript
// src/services/advisor/AdvisorService.ts
import { Advisor, Client, GroupTradeData } from '../models/Advisor';

export class AdvisorService {
  constructor(
    private db: DatabaseService,
    private tradingService: TradingService,
    private notificationService: NotificationService
  ) {}

  async registerAdvisor(advisorData: {
    userId: string;
    commissionRate: number;
    description: string;
  }): Promise<Advisor> {
    // Generate unique advisor code
    const advisorCode = this.generateAdvisorCode();
    
    // Create advisor record
    const advisor = await this.db.advisors.create({
      userId: advisorData.userId,
      advisorCode,
      commissionRate: advisorData.commissionRate,
      description: advisorData.description,
      totalEarnings: 0,
      createdAt: new Date()
    });

    // Send notification
    await this.notificationService.sendAdvisorRegistrationNotification(advisor);

    return advisor;
  }

  async linkClientToAdvisor(clientId: string, advisorCode: string): Promise<LinkingResult> {
    // Find advisor
    const advisor = await this.db.advisors.findByCode(advisorCode);
    if (!advisor) {
      throw new Error('Invalid advisor code');
    }

    // Check if client is already linked
    const existingLink = await this.db.advisorClients.findByClient(clientId);
    if (existingLink) {
      throw new Error('Client already linked to an advisor');
    }

    // Create link
    const link = await this.db.advisorClients.create({
      advisorId: advisor.id,
      clientId,
      linkedAt: new Date(),
      isActive: true
    });

    // Send notifications
    await this.notificationService.sendClientLinkedNotification(clientId, advisor);
    await this.notificationService.sendAdvisorClientLinkedNotification(advisor.id, clientId);

    return { success: true, linkId: link.id };
  }

  async executeGroupTrade(groupTradeData: GroupTradeData): Promise<GroupTradeResult> {
    // Validate advisor permissions
    const advisor = await this.db.advisors.findById(groupTradeData.advisorId);
    if (!advisor) {
      throw new Error('Advisor not found');
    }

    // Get linked clients
    const linkedClients = await this.db.advisorClients.findByAdvisor(groupTradeData.advisorId);
    const activeClients = linkedClients.filter(client => client.isActive);

    if (activeClients.length === 0) {
      throw new Error('No active clients found');
    }

    // Execute trades for each client
    const tradeResults = await Promise.all(
      activeClients.map(async (client) => {
        try {
          const order = {
            userId: client.clientId,
            marketId: groupTradeData.marketId,
            orderType: groupTradeData.orderType,
            side: groupTradeData.side,
            sizeUsd: groupTradeData.sizeUsd,
            leverage: groupTradeData.leverage,
            price: groupTradeData.price
          };

          const result = await this.tradingService.placeOrder(order);
          
          // Track commission
          await this.trackAdvisorCommission(result.orderId, advisor.id, groupTradeData.commissionRate);

          return {
            clientId: client.clientId,
            success: true,
            orderId: result.orderId,
            txHash: result.txHash
          };
        } catch (error) {
          return {
            clientId: client.clientId,
            success: false,
            error: error.message
          };
        }
      })
    );

    // Store group trade record
    const groupTrade = await this.db.groupTrades.create({
      advisorId: groupTradeData.advisorId,
      marketId: groupTradeData.marketId,
      orderType: groupTradeData.orderType,
      side: groupTradeData.side,
      sizeUsd: groupTradeData.sizeUsd,
      leverage: groupTradeData.leverage,
      commissionRate: groupTradeData.commissionRate,
      results: tradeResults,
      createdAt: new Date()
    });

    return {
      groupTradeId: groupTrade.id,
      results: tradeResults,
      successCount: tradeResults.filter(r => r.success).length,
      totalCount: tradeResults.length
    };
  }

  async getAdvisorEarnings(advisorId: string, period: TimePeriod): Promise<EarningsReport> {
    const earnings = await this.db.commissions.getAdvisorEarnings(advisorId, period);
    
    const report = {
      advisorId,
      period,
      totalEarnings: earnings.total,
      commissionBreakdown: earnings.breakdown,
      clientCount: earnings.clientCount,
      tradeCount: earnings.tradeCount,
      averageCommission: earnings.average
    };

    return report;
  }
}
```

### **3. API Controllers**

#### **REST API Controller**
```typescript
// src/controllers/UserController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response) {
    try {
      const { email, walletAddress, referralCode } = req.body;
      
      const user = await this.userService.registerUser({
        email,
        walletAddress,
        referralCode
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async authenticate(req: Request, res: Response) {
    try {
      const { walletAddress, signature, message } = req.body;
      
      const authResult = await this.userService.authenticateUser(
        walletAddress,
        signature,
        message
      );

      res.status(200).json({
        success: true,
        token: authResult.token,
        user: authResult.user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id; // From JWT middleware
      
      const profile = await this.userService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        profile
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

### **4. Database Models**

#### **User Model**
```typescript
// src/models/User.ts
export interface User {
  id: string;
  email: string;
  walletAddress: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  tradingStats: TradingStats;
  stakingInfo: StakingInfo;
  referralInfo: ReferralInfo;
}

export interface TradingStats {
  totalTrades: number;
  totalVolume: bigint;
  totalPnL: bigint;
  winRate: number;
  averageLeverage: number;
}

export interface StakingInfo {
  stakedGMX: bigint;
  stakedGLP: bigint;
  pendingRewards: bigint;
  totalEarned: bigint;
}

export interface ReferralInfo {
  referralCode: string;
  referredUsers: number;
  totalCommissions: bigint;
  activeReferrals: number;
}
```

#### **Trading Model**
```typescript
// src/models/Trading.ts
export interface TradingOrder {
  userId: string;
  marketId: string;
  orderType: OrderType;
  side: OrderSide;
  sizeUsd: bigint;
  price: bigint;
  leverage: number;
  stopLoss?: bigint;
  takeProfit?: bigint;
}

export interface Position {
  id: string;
  userId: string;
  marketId: string;
  side: OrderSide;
  sizeUsd: bigint;
  entryPrice: bigint;
  leverage: number;
  currentPrice: bigint;
  unrealizedPnl: bigint;
  liquidationPrice: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderResult {
  orderId: string;
  txHash: string;
  status: OrderStatus;
}
```

### **5. Middleware**

#### **Authentication Middleware**
```typescript
// src/middleware/AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/JWTService';

export class AuthMiddleware {
  constructor(private jwt: JWTService) {}

  authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    try {
      const decoded = this.jwt.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  }

  requireRole(role: UserRole) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.user.role !== role) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      next();
    };
  }
}
```

### **6. WebSocket for Real-time Updates**

```typescript
// src/websocket/TradingWebSocket.ts
import { WebSocket, WebSocketServer } from 'ws';
import { TradingService } from '../services/trading/TradingService';

export class TradingWebSocket {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(private tradingService: TradingService) {
    this.wss = new WebSocketServer({ port: 8080 });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const userId = this.extractUserId(req);
      if (userId) {
        this.clients.set(userId, ws);
        
        ws.on('message', (message: string) => {
          this.handleMessage(userId, JSON.parse(message));
        });

        ws.on('close', () => {
          this.clients.delete(userId);
        });
      }
    });
  }

  private async handleMessage(userId: string, message: any) {
    switch (message.type) {
      case 'SUBSCRIBE_POSITIONS':
        this.subscribeToPositions(userId);
        break;
      case 'SUBSCRIBE_ORDERS':
        this.subscribeToOrders(userId);
        break;
      case 'SUBSCRIBE_MARKET_DATA':
        this.subscribeToMarketData(userId, message.marketId);
        break;
    }
  }

  private async subscribeToPositions(userId: string) {
    // Send initial positions
    const positions = await this.tradingService.getPositions(userId);
    this.sendToUser(userId, {
      type: 'POSITIONS_UPDATE',
      data: positions
    });

    // Set up real-time updates
    this.setupPositionUpdates(userId);
  }

  private sendToUser(userId: string, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  public broadcastToAll(data: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}
```

### **7. Docker Configuration**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/gmx
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=gmx
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  websocket:
    build: .
    command: ["npm", "run", "websocket"]
    ports:
      - "8080:8080"
    depends_on:
      - redis

volumes:
  postgres_data:
```

### **8. Environment Configuration**

```typescript
// src/config/Config.ts
export class Config {
  static get database() {
    return {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/gmx',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10')
      }
    };
  }

  static get redis() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    };
  }

  static get blockchain() {
    return {
      arbitrum: {
        rpc: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
        chainId: 42161
      },
      avalanche: {
        rpc: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114
      }
    };
  }

  static get jwt() {
    return {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }
}
```

This implementation provides a solid foundation for building a comprehensive GMX backend that can handle all aspects of the platform while maintaining security, scalability, and real-time capabilities! 🚀 