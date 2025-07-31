"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const Logger_1 = require("../utils/Logger");
class ValidationMiddleware {
    constructor() {
        this.validateUserRegistration = [
            (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
            (0, express_validator_1.body)('walletAddress').isLength({ min: 42, max: 42 }).withMessage('Valid wallet address is required'),
            (0, express_validator_1.body)('referralCode').optional().isLength({ min: 1 }).withMessage('Referral code must not be empty'),
            this.handleValidationErrors
        ];
        this.validateAuthentication = [
            (0, express_validator_1.body)('walletAddress').isLength({ min: 42, max: 42 }).withMessage('Valid wallet address is required'),
            (0, express_validator_1.body)('signature').isLength({ min: 1 }).withMessage('Signature is required'),
            (0, express_validator_1.body)('message').isLength({ min: 1 }).withMessage('Message is required'),
            this.handleValidationErrors
        ];
        this.validateProfileUpdate = [
            (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
            (0, express_validator_1.body)('referralCode').optional().isLength({ min: 1 }).withMessage('Referral code must not be empty'),
            this.handleValidationErrors
        ];
        this.validateSubAccount = [
            (0, express_validator_1.body)('name').isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
            (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
            this.handleValidationErrors
        ];
        this.validateAdvisorRegistration = [
            (0, express_validator_1.body)('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
            (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
            this.handleValidationErrors
        ];
        this.validateClientLinking = [
            (0, express_validator_1.body)('advisorCode').isLength({ min: 1 }).withMessage('Advisor code is required'),
            this.handleValidationErrors
        ];
        this.validateClientUnlinking = [
            (0, express_validator_1.body)('advisorId').isUUID().withMessage('Valid advisor ID is required'),
            this.handleValidationErrors
        ];
        this.validateGroupTrade = [
            (0, express_validator_1.body)('marketId').isLength({ min: 1 }).withMessage('Market ID is required'),
            (0, express_validator_1.body)('orderType').isIn(['market', 'limit', 'stop', 'take_profit']).withMessage('Valid order type is required'),
            (0, express_validator_1.body)('side').isIn(['long', 'short']).withMessage('Valid side is required'),
            (0, express_validator_1.body)('sizeUsd').isNumeric().withMessage('Valid size is required'),
            (0, express_validator_1.body)('leverage').isFloat({ min: 1, max: 100 }).withMessage('Leverage must be between 1 and 100'),
            (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Valid price is required'),
            (0, express_validator_1.body)('stopLoss').optional().isNumeric().withMessage('Valid stop loss is required'),
            (0, express_validator_1.body)('takeProfit').optional().isNumeric().withMessage('Valid take profit is required'),
            (0, express_validator_1.body)('commissionRate').isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
            this.handleValidationErrors
        ];
        this.validateAdvisorProfileUpdate = [
            (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
            (0, express_validator_1.body)('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
            this.handleValidationErrors
        ];
        this.validateTradingOrder = [
            (0, express_validator_1.body)('marketId').isLength({ min: 1 }).withMessage('Market ID is required'),
            (0, express_validator_1.body)('orderType').isIn(['market', 'limit', 'stop', 'take_profit']).withMessage('Valid order type is required'),
            (0, express_validator_1.body)('side').isIn(['long', 'short']).withMessage('Valid side is required'),
            (0, express_validator_1.body)('sizeUsd').isNumeric().withMessage('Valid size is required'),
            (0, express_validator_1.body)('leverage').isFloat({ min: 1, max: 100 }).withMessage('Leverage must be between 1 and 100'),
            (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Valid price is required'),
            (0, express_validator_1.body)('stopLoss').optional().isNumeric().withMessage('Valid stop loss is required'),
            (0, express_validator_1.body)('takeProfit').optional().isNumeric().withMessage('Valid take profit is required'),
            this.handleValidationErrors
        ];
        this.validateStakingAction = [
            (0, express_validator_1.body)('amount').isNumeric().withMessage('Valid amount is required'),
            (0, express_validator_1.body)('tokenType').isIn(['GMX', 'GLP']).withMessage('Valid token type is required'),
            this.handleValidationErrors
        ];
        this.validateReferralCode = [
            (0, express_validator_1.body)('referralCode').isLength({ min: 1 }).withMessage('Referral code is required'),
            this.handleValidationErrors
        ];
        this.validateCompetitionEntry = [
            (0, express_validator_1.body)('competitionId').isUUID().withMessage('Valid competition ID is required'),
            this.handleValidationErrors
        ];
        this.validateAdminAction = [
            (0, express_validator_1.body)('action').isIn(['suspend', 'restore', 'delete']).withMessage('Valid action is required'),
            (0, express_validator_1.body)('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
            this.handleValidationErrors
        ];
        this.handleValidationErrors = (req, res, next) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg);
                this.logger.warn('Validation failed', {
                    path: req.path,
                    method: req.method,
                    errors: errorMessages,
                    ip: req.ip
                });
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errorMessages
                });
                return;
            }
            next();
        };
        this.logger = new Logger_1.Logger();
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
//# sourceMappingURL=ValidationMiddleware.js.map