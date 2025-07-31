"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const Logger_1 = require("../utils/Logger");
class AuthMiddleware {
    constructor(jwt) {
        this.jwt = jwt;
        this.authenticate = (req, res, next) => {
            try {
                const token = this.extractToken(req);
                if (!token) {
                    this.logger.warn('No token provided', { ip: req.ip, userAgent: req.get('User-Agent') });
                    res.status(401).json({
                        success: false,
                        error: 'No token provided'
                    });
                    return;
                }
                const decoded = this.jwt.verifyToken(token);
                req.user = decoded;
                this.logger.info('User authenticated', {
                    userId: decoded.userId,
                    walletAddress: decoded.walletAddress,
                    ip: req.ip
                });
                next();
            }
            catch (error) {
                this.logger.error('Authentication failed', {
                    error: error.message,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
        };
        this.requireRole = (role) => {
            return (req, res, next) => {
                try {
                    const user = req.user;
                    if (!user) {
                        res.status(401).json({
                            success: false,
                            error: 'Authentication required'
                        });
                        return;
                    }
                    if (user.role !== role) {
                        this.logger.warn('Insufficient permissions', {
                            userId: user.userId,
                            requiredRole: role,
                            userRole: user.role
                        });
                        res.status(403).json({
                            success: false,
                            error: 'Insufficient permissions'
                        });
                        return;
                    }
                    next();
                }
                catch (error) {
                    this.logger.error('Role verification failed', { error: error.message });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            };
        };
        this.requireAnyRole = (roles) => {
            return (req, res, next) => {
                try {
                    const user = req.user;
                    if (!user) {
                        res.status(401).json({
                            success: false,
                            error: 'Authentication required'
                        });
                        return;
                    }
                    if (!roles.includes(user.role)) {
                        this.logger.warn('Insufficient permissions', {
                            userId: user.userId,
                            requiredRoles: roles,
                            userRole: user.role
                        });
                        res.status(403).json({
                            success: false,
                            error: 'Insufficient permissions'
                        });
                        return;
                    }
                    next();
                }
                catch (error) {
                    this.logger.error('Role verification failed', { error: error.message });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            };
        };
        this.optionalAuth = (req, res, next) => {
            try {
                const token = this.extractToken(req);
                if (token) {
                    const decoded = this.jwt.verifyToken(token);
                    req.user = decoded;
                    this.logger.info('Optional authentication successful', {
                        userId: decoded.userId,
                        walletAddress: decoded.walletAddress
                    });
                }
                next();
            }
            catch (error) {
                this.logger.debug('Optional authentication failed', { error: error.message });
                next();
            }
        };
        this.logger = new Logger_1.Logger();
    }
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        const queryToken = req.query.token;
        if (queryToken) {
            return queryToken;
        }
        const cookieToken = req.cookies?.token;
        if (cookieToken) {
            return cookieToken;
        }
        return null;
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map