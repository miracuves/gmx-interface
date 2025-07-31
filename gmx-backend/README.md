# GMX Backend API

A comprehensive backend system for the GMX decentralized perpetual trading platform, providing centralized administration, analytics, and enhanced user experience.

## 🚀 Features

### Core Services
- **User Management** - Registration, authentication, profile management
- **Trading Engine** - Order management, position tracking, risk management
- **Staking & Rewards** - GMX/GLP staking, reward distribution
- **Referral System** - Multi-level referral tracking and commission management
- **Advisor System** - Professional trading advisors with group trading capabilities
- **Competition System** - Trading competitions and leaderboards
- **Analytics & Reporting** - Comprehensive platform analytics
- **Real-time Notifications** - WebSocket-based real-time updates
- **Admin Dashboard** - Centralized platform management

### Security Features
- JWT-based authentication with wallet signature verification
- Role-based access control (User, Advisor, Admin)
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS configuration

### Real-time Capabilities
- WebSocket connections for live trading updates
- Real-time position monitoring
- Live market data streaming
- Instant notification delivery

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for session management and caching
- **Authentication**: JWT with wallet signature verification
- **Real-time**: WebSocket for live updates
- **Blockchain**: Web3.js for blockchain integration
- **Logging**: Winston for structured logging
- **Validation**: Express-validator for request validation

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd gmx-backend
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp env.example .env

# Edit the environment variables
nano .env
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb gmx

# Run migrations (when implemented)
npm run migrate
```

### 4. Start Development Server

```bash
# Start in development mode
npm run dev

# Or build and start production
npm run build
npm start
```

## 📁 Project Structure

```
gmx-backend/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Data models and interfaces
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── websocket/       # WebSocket handlers
│   └── index.ts         # Application entry point
├── logs/                # Application logs
├── tests/               # Test files
├── docs/                # Documentation
└── package.json         # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://localhost:5432/gmx

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Blockchain
ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
AVALANCHE_RPC=https://api.avax.network/ext/bc/C/rpc
```

## 📚 API Documentation

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### User Management

```bash
# Register user
POST /api/v1/users/register
{
  "email": "user@example.com",
  "walletAddress": "0x...",
  "referralCode": "ABC123"
}

# Authenticate user
POST /api/v1/users/authenticate
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message to authenticate"
}

# Get user profile
GET /api/v1/users/profile
```

### Advisor System

```bash
# Register as advisor
POST /api/v1/advisors/register
{
  "commissionRate": 30.0,
  "description": "Professional crypto trader"
}

# Link client to advisor
POST /api/v1/advisors/link-client
{
  "advisorCode": "ABC12345"
}

# Execute group trade
POST /api/v1/advisors/group-trade
{
  "marketId": "BTC-USD",
  "orderType": "market",
  "side": "long",
  "sizeUsd": "1000",
  "leverage": 10
}
```

### Trading

```bash
# Place order
POST /api/v1/trading/orders
{
  "marketId": "BTC-USD",
  "orderType": "market",
  "side": "long",
  "sizeUsd": "1000",
  "leverage": 10
}
```

## 🔐 Security

### Authentication Flow

1. User signs a message with their wallet
2. Backend verifies the signature
3. JWT token is generated and returned
4. Token is used for subsequent requests

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable via environment variables

### CORS

- Configured for specific origins
- Credentials supported
- Configurable via environment variables

## 📊 Monitoring

### Logging

- Structured logging with Winston
- Log levels: error, warn, info, debug
- File and console output
- Log rotation configured

### Health Check

```bash
GET /health
```

Returns server status and uptime information.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t gmx-backend .

# Run container
docker run -p 3001:3001 gmx-backend
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure load balancer
5. Set up monitoring and alerting

## 🔧 Development

### Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Migrations

```bash
# Create migration
npm run migrate:create

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## 📈 Performance

### Optimization

- Connection pooling for database
- Redis caching for frequently accessed data
- Compression middleware
- Rate limiting to prevent abuse
- Efficient query optimization

### Scaling

- Horizontal scaling with load balancer
- Database read replicas
- Redis cluster for high availability
- Microservices architecture ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔄 Roadmap

- [ ] Database migrations
- [ ] Complete trading service implementation
- [ ] Blockchain integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Mobile API support
- [ ] GraphQL API
- [ ] API documentation with Swagger
- [ ] Performance monitoring
- [ ] Automated testing
- [ ] CI/CD pipeline

---

**Note**: This is a development version. For production use, ensure all security measures are properly configured and tested. 