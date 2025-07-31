"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralRoutes = void 0;
const express_1 = require("express");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const Logger_1 = require("../utils/Logger");
const router = (0, express_1.Router)();
exports.referralRoutes = router;
const logger = new Logger_1.Logger();
const authMiddleware = new AuthMiddleware_1.AuthMiddleware({});
const validationMiddleware = new ValidationMiddleware_1.ValidationMiddleware();
router.post('/link', authMiddleware.authenticate, validationMiddleware.validateReferralCode, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Referral routes placeholder - would implement actual referral logic'
        });
    }
    catch (error) {
        logger.error('Referral error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Referral failed'
        });
    }
});
//# sourceMappingURL=referralRoutes.js.map