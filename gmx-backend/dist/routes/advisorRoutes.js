"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advisorRoutes = void 0;
const express_1 = require("express");
const AdvisorService_1 = require("../services/advisor/AdvisorService");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const Logger_1 = require("../utils/Logger");
const router = (0, express_1.Router)();
exports.advisorRoutes = router;
const logger = new Logger_1.Logger();
const advisorService = new AdvisorService_1.AdvisorService({}, {}, {});
const authMiddleware = new AuthMiddleware_1.AuthMiddleware({});
const validationMiddleware = new ValidationMiddleware_1.ValidationMiddleware();
router.post('/register', authMiddleware.authenticate, validationMiddleware.validateAdvisorRegistration, async (req, res) => {
    try {
        const userId = req.user.id;
        const { commissionRate, description } = req.body;
        const advisor = await advisorService.registerAdvisor({
            userId,
            commissionRate,
            description
        });
        res.status(201).json({
            success: true,
            message: 'Advisor registered successfully',
            advisor: {
                id: advisor.id,
                advisorCode: advisor.advisorCode,
                commissionRate: advisor.commissionRate,
                description: advisor.description
            }
        });
    }
    catch (error) {
        logger.error('Advisor registration error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Advisor registration failed'
        });
    }
});
router.post('/link-client', authMiddleware.authenticate, validationMiddleware.validateClientLinking, async (req, res) => {
    try {
        const clientId = req.user.id;
        const { advisorCode } = req.body;
        const result = await advisorService.linkClientToAdvisor(clientId, advisorCode);
        res.status(200).json({
            success: true,
            message: 'Successfully linked to advisor',
            linkId: result.linkId
        });
    }
    catch (error) {
        logger.error('Client linking error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to link to advisor'
        });
    }
});
router.post('/unlink-client', authMiddleware.authenticate, validationMiddleware.validateClientUnlinking, async (req, res) => {
    try {
        const clientId = req.user.id;
        const { advisorId } = req.body;
        const result = await advisorService.unlinkClientFromAdvisor(clientId, advisorId);
        res.status(200).json({
            success: true,
            message: 'Successfully unlinked from advisor'
        });
    }
    catch (error) {
        logger.error('Client unlinking error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to unlink from advisor'
        });
    }
});
router.post('/group-trade', authMiddleware.authenticate, authMiddleware.requireRole('advisor'), validationMiddleware.validateGroupTrade, async (req, res) => {
    try {
        const advisorId = req.user.id;
        const groupTradeData = {
            ...req.body,
            advisorId
        };
        const result = await advisorService.executeGroupTrade(groupTradeData);
        res.status(200).json({
            success: true,
            message: 'Group trade executed successfully',
            result
        });
    }
    catch (error) {
        logger.error('Group trade execution error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Group trade execution failed'
        });
    }
});
router.get('/earnings', authMiddleware.authenticate, authMiddleware.requireRole('advisor'), async (req, res) => {
    try {
        const advisorId = req.user.id;
        const { period = '30d' } = req.query;
        const earnings = await advisorService.getAdvisorEarnings(advisorId, period);
        res.status(200).json({
            success: true,
            earnings
        });
    }
    catch (error) {
        logger.error('Get advisor earnings error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get earnings'
        });
    }
});
router.get('/clients', authMiddleware.authenticate, authMiddleware.requireRole('advisor'), async (req, res) => {
    try {
        const advisorId = req.user.id;
        const clients = await advisorService.getAdvisorClients(advisorId);
        res.status(200).json({
            success: true,
            clients
        });
    }
    catch (error) {
        logger.error('Get advisor clients error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get clients'
        });
    }
});
router.get('/group-trades', authMiddleware.authenticate, authMiddleware.requireRole('advisor'), async (req, res) => {
    try {
        const advisorId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const history = await advisorService.getGroupTradeHistory(advisorId);
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
        logger.error('Get group trade history error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get group trade history'
        });
    }
});
router.get('/:advisorCode', async (req, res) => {
    try {
        const { advisorCode } = req.params;
        const advisor = await advisorService.getAdvisorByCode(advisorCode);
        if (!advisor) {
            return res.status(404).json({
                success: false,
                error: 'Advisor not found'
            });
        }
        res.status(200).json({
            success: true,
            advisor: {
                advisorCode: advisor.advisorCode,
                description: advisor.description,
                commissionRate: advisor.commissionRate,
                totalClients: advisor.totalClients,
                isActive: advisor.isActive
            }
        });
    }
    catch (error) {
        logger.error('Get advisor profile error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get advisor profile'
        });
    }
});
router.get('/stats/overview', authMiddleware.authenticate, authMiddleware.requireRole('advisor'), async (req, res) => {
    try {
        const advisorId = req.user.id;
        const stats = await advisorService.getAdvisorStats(advisorId);
        res.status(200).json({
            success: true,
            stats
        });
    }
    catch (error) {
        logger.error('Get advisor stats error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get advisor stats'
        });
    }
});
router.put('/profile', authMiddleware.authenticate, authMiddleware.requireRole('advisor'), validationMiddleware.validateAdvisorProfileUpdate, async (req, res) => {
    try {
        const advisorId = req.user.id;
        const updates = req.body;
        const updatedAdvisor = await advisorService.updateAdvisorProfile(advisorId, updates);
        res.status(200).json({
            success: true,
            message: 'Advisor profile updated successfully',
            advisor: updatedAdvisor
        });
    }
    catch (error) {
        logger.error('Update advisor profile error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update advisor profile'
        });
    }
});
router.get('/analytics/overview', authMiddleware.authenticate, authMiddleware.requireRole('admin'), async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const analytics = await advisorService.getAdvisorAnalytics(period);
        res.status(200).json({
            success: true,
            analytics
        });
    }
    catch (error) {
        logger.error('Get advisor analytics error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get advisor analytics'
        });
    }
});
//# sourceMappingURL=advisorRoutes.js.map