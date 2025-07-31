"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const UserService_1 = require("../services/user/UserService");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const Logger_1 = require("../utils/Logger");
const router = (0, express_1.Router)();
exports.userRoutes = router;
const logger = new Logger_1.Logger();
const userService = new UserService_1.UserService({}, {}, {});
const authMiddleware = new AuthMiddleware_1.AuthMiddleware({});
const validationMiddleware = new ValidationMiddleware_1.ValidationMiddleware();
router.post('/register', validationMiddleware.validateUserRegistration, async (req, res) => {
    try {
        const { email, walletAddress, referralCode } = req.body;
        const user = await userService.registerUser({
            email,
            walletAddress,
            referralCode
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                walletAddress: user.walletAddress,
                role: user.role
            }
        });
    }
    catch (error) {
        logger.error('User registration error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});
router.post('/authenticate', validationMiddleware.validateAuthentication, async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;
        const authResult = await userService.authenticateUser(walletAddress, signature, message);
        res.status(200).json({
            success: true,
            message: 'Authentication successful',
            token: authResult.token,
            user: authResult.user
        });
    }
    catch (error) {
        logger.error('User authentication error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Authentication failed'
        });
    }
});
router.get('/profile', authMiddleware.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await userService.getUserProfile(userId);
        res.status(200).json({
            success: true,
            profile
        });
    }
    catch (error) {
        logger.error('Get user profile error:', error);
        res.status(404).json({
            success: false,
            error: error.message || 'Profile not found'
        });
    }
});
router.put('/profile', authMiddleware.authenticate, validationMiddleware.validateProfileUpdate, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const updatedUser = await userService.updateUserProfile(userId, updates);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        logger.error('Update user profile error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Profile update failed'
        });
    }
});
router.post('/sub-accounts', authMiddleware.authenticate, validationMiddleware.validateSubAccount, async (req, res) => {
    try {
        const userId = req.user.id;
        const accountData = req.body;
        const subAccount = await userService.createSubAccount(userId, accountData);
        res.status(201).json({
            success: true,
            message: 'Sub account created successfully',
            subAccount
        });
    }
    catch (error) {
        logger.error('Create sub account error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Sub account creation failed'
        });
    }
});
router.get('/history', authMiddleware.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const history = await userService.getAccountHistory(userId);
        res.status(200).json({
            success: true,
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: history.length
            }
        });
    }
    catch (error) {
        logger.error('Get account history error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get account history'
        });
    }
});
router.get('/wallet/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const user = await userService.getUserByWallet(walletAddress);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                role: user.role
            }
        });
    }
    catch (error) {
        logger.error('Get user by wallet error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get user'
        });
    }
});
router.post('/refresh-token', authMiddleware.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const newToken = await userService.refreshToken(userId);
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken
        });
    }
    catch (error) {
        logger.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Token refresh failed'
        });
    }
});
router.post('/logout', authMiddleware.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        await userService.logout(userId);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger.error('Logout error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Logout failed'
        });
    }
});
//# sourceMappingURL=userRoutes.js.map