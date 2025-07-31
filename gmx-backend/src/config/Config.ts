export class Config {
  static get server() {
    return {
      port: parseInt(process.env.PORT || '3001'),
      host: process.env.HOST || 'localhost',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  static get database() {
    return {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/gmx',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      name: process.env.DB_NAME || 'gmx',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        idle: parseInt(process.env.DB_POOL_IDLE || '30000'),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000')
      }
    };
  }

  static get redis() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0')
    };
  }

  static get blockchain() {
    return {
      arbitrum: {
        rpc: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
        chainId: 42161,
        contracts: {
          vault: process.env.ARBITRUM_VAULT || '0x489ee077994B6658eAfA855C308275EAd8097C4A',
          router: process.env.ARBITRUM_ROUTER || '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064',
          reader: process.env.ARBITRUM_READER || '0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694',
          rewardRouter: process.env.ARBITRUM_REWARD_ROUTER || '0x5E4766F932ce00aA4a1A82d3Da85adf15C5694A1'
        }
      },
      avalanche: {
        rpc: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114,
        contracts: {
          vault: process.env.AVALANCHE_VAULT || '0x9ab2De34A33fB459b538c43f251eB825645e8595',
          router: process.env.AVALANCHE_ROUTER || '0x5F719c2F1095F7B9fc64a9e7a3e9bd0B56F7f649',
          reader: process.env.AVALANCHE_READER || '0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694',
          rewardRouter: process.env.AVALANCHE_REWARD_ROUTER || '0x5E4766F932ce00aA4a1A82d3Da85adf15C5694A1'
        }
      }
    };
  }

  static get jwt() {
    return {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };
  }

  static get cors() {
    return {
      origins: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3010',
        'https://gmx.io'
      ]
    };
  }

  static get email() {
    return {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'noreply@gmx.io'
    };
  }

  static get logging() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.LOG_FILE || 'logs/app.log',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '5'
    };
  }

  static get rateLimit() {
    return {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    };
  }

  static get websocket() {
    return {
      heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'), // 30 seconds
      maxPayload: parseInt(process.env.WS_MAX_PAYLOAD || '65536'), // 64KB
      perMessageDeflate: process.env.WS_PER_MESSAGE_DEFLATE === 'true'
    };
  }

  static get advisor() {
    return {
      defaultCommissionRate: parseFloat(process.env.ADVISOR_DEFAULT_COMMISSION_RATE || '30.0'),
      maxCommissionRate: parseFloat(process.env.ADVISOR_MAX_COMMISSION_RATE || '50.0'),
      minCommissionRate: parseFloat(process.env.ADVISOR_MIN_COMMISSION_RATE || '5.0')
    };
  }

  static get competition() {
    return {
      maxPrizePool: parseFloat(process.env.COMPETITION_MAX_PRIZE_POOL || '100000'),
      minParticipants: parseInt(process.env.COMPETITION_MIN_PARTICIPANTS || '10'),
      maxDuration: parseInt(process.env.COMPETITION_MAX_DURATION || '604800') // 7 days in seconds
    };
  }

  static get trading() {
    return {
      maxLeverage: parseInt(process.env.TRADING_MAX_LEVERAGE || '50'),
      minOrderSize: parseFloat(process.env.TRADING_MIN_ORDER_SIZE || '10'),
      maxOrderSize: parseFloat(process.env.TRADING_MAX_ORDER_SIZE || '1000000'),
      slippageTolerance: parseFloat(process.env.TRADING_SLIPPAGE_TOLERANCE || '0.5')
    };
  }
} 