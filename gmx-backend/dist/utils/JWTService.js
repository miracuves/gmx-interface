"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Config_1 = require("../config/Config");
const Logger_1 = require("./Logger");
class JWTService {
    constructor() {
        this.logger = new Logger_1.Logger();
        this.secret = Config_1.Config.jwt.secret;
        this.expiresIn = Config_1.Config.jwt.expiresIn;
        this.refreshExpiresIn = Config_1.Config.jwt.refreshExpiresIn;
    }
    generateToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign(payload, this.secret, {
                expiresIn: this.expiresIn,
                issuer: 'gmx-backend',
                audience: 'gmx-users'
            });
            this.logger.info('JWT token generated', {
                userId: payload.userId,
                walletAddress: payload.walletAddress
            });
            return token;
        }
        catch (error) {
            this.logger.error('Error generating JWT token', { error: error.message });
            throw new Error('Failed to generate token');
        }
    }
    generateRefreshToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign(payload, this.secret, {
                expiresIn: this.refreshExpiresIn,
                issuer: 'gmx-backend',
                audience: 'gmx-users'
            });
            this.logger.info('JWT refresh token generated', {
                userId: payload.userId,
                walletAddress: payload.walletAddress
            });
            return token;
        }
        catch (error) {
            this.logger.error('Error generating JWT refresh token', { error: error.message });
            throw new Error('Failed to generate refresh token');
        }
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.secret, {
                issuer: 'gmx-backend',
                audience: 'gmx-users'
            });
            this.logger.debug('JWT token verified', {
                userId: decoded.userId,
                walletAddress: decoded.walletAddress
            });
            return decoded;
        }
        catch (error) {
            this.logger.error('Error verifying JWT token', { error: error.message });
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            else {
                throw new Error('Token verification failed');
            }
        }
    }
    decodeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return decoded;
        }
        catch (error) {
            this.logger.error('Error decoding JWT token', { error: error.message });
            return null;
        }
    }
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        catch (error) {
            this.logger.error('Error checking token expiration', { error: error.message });
            return true;
        }
    }
    getTokenExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return null;
            }
            return new Date(decoded.exp * 1000);
        }
        catch (error) {
            this.logger.error('Error getting token expiration', { error: error.message });
            return null;
        }
    }
    refreshToken(refreshToken) {
        try {
            const decoded = this.verifyToken(refreshToken);
            const newToken = this.generateToken({
                userId: decoded.userId,
                walletAddress: decoded.walletAddress,
                role: decoded.role
            });
            this.logger.info('JWT token refreshed', {
                userId: decoded.userId,
                walletAddress: decoded.walletAddress
            });
            return newToken;
        }
        catch (error) {
            this.logger.error('Error refreshing JWT token', { error: error.message });
            throw new Error('Failed to refresh token');
        }
    }
    generateTokens(payload) {
        try {
            const accessToken = this.generateToken(payload);
            const refreshToken = this.generateRefreshToken(payload);
            const expiresIn = this.getExpirationTime(this.expiresIn);
            this.logger.info('JWT tokens generated', {
                userId: payload.userId,
                walletAddress: payload.walletAddress
            });
            return {
                accessToken,
                refreshToken,
                expiresIn
            };
        }
        catch (error) {
            this.logger.error('Error generating JWT tokens', { error: error.message });
            throw new Error('Failed to generate tokens');
        }
    }
    getExpirationTime(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 3600;
        }
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            case 'd':
                return value * 86400;
            default:
                return 3600;
        }
    }
}
exports.JWTService = JWTService;
//# sourceMappingURL=JWTService.js.map