import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Logger } from '../utils/Logger';

export class ValidationMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  validateUserRegistration = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('walletAddress').isLength({ min: 42, max: 42 }).withMessage('Valid wallet address is required'),
    body('referralCode').optional().isLength({ min: 1 }).withMessage('Referral code must not be empty'),
    this.handleValidationErrors
  ];

  validateAuthentication = [
    body('walletAddress').isLength({ min: 42, max: 42 }).withMessage('Valid wallet address is required'),
    body('signature').isLength({ min: 1 }).withMessage('Signature is required'),
    body('message').isLength({ min: 1 }).withMessage('Message is required'),
    this.handleValidationErrors
  ];

  validateProfileUpdate = [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('referralCode').optional().isLength({ min: 1 }).withMessage('Referral code must not be empty'),
    this.handleValidationErrors
  ];

  validateSubAccount = [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    this.handleValidationErrors
  ];

  validateAdvisorRegistration = [
    body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    this.handleValidationErrors
  ];

  validateClientLinking = [
    body('advisorCode').isLength({ min: 1 }).withMessage('Advisor code is required'),
    this.handleValidationErrors
  ];

  validateClientUnlinking = [
    body('advisorId').isUUID().withMessage('Valid advisor ID is required'),
    this.handleValidationErrors
  ];

  validateGroupTrade = [
    body('marketId').isLength({ min: 1 }).withMessage('Market ID is required'),
    body('orderType').isIn(['market', 'limit', 'stop', 'take_profit']).withMessage('Valid order type is required'),
    body('side').isIn(['long', 'short']).withMessage('Valid side is required'),
    body('sizeUsd').isNumeric().withMessage('Valid size is required'),
    body('leverage').isFloat({ min: 1, max: 100 }).withMessage('Leverage must be between 1 and 100'),
    body('price').optional().isNumeric().withMessage('Valid price is required'),
    body('stopLoss').optional().isNumeric().withMessage('Valid stop loss is required'),
    body('takeProfit').optional().isNumeric().withMessage('Valid take profit is required'),
    body('commissionRate').isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
    this.handleValidationErrors
  ];

  validateAdvisorProfileUpdate = [
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
    this.handleValidationErrors
  ];

  validateTradingOrder = [
    body('marketId').isLength({ min: 1 }).withMessage('Market ID is required'),
    body('orderType').isIn(['market', 'limit', 'stop', 'take_profit']).withMessage('Valid order type is required'),
    body('side').isIn(['long', 'short']).withMessage('Valid side is required'),
    body('sizeUsd').isNumeric().withMessage('Valid size is required'),
    body('leverage').isFloat({ min: 1, max: 100 }).withMessage('Leverage must be between 1 and 100'),
    body('price').optional().isNumeric().withMessage('Valid price is required'),
    body('stopLoss').optional().isNumeric().withMessage('Valid stop loss is required'),
    body('takeProfit').optional().isNumeric().withMessage('Valid take profit is required'),
    this.handleValidationErrors
  ];

  validateStakingAction = [
    body('amount').isNumeric().withMessage('Valid amount is required'),
    body('tokenType').isIn(['GMX', 'GLP']).withMessage('Valid token type is required'),
    this.handleValidationErrors
  ];

  validateReferralCode = [
    body('referralCode').isLength({ min: 1 }).withMessage('Referral code is required'),
    this.handleValidationErrors
  ];

  validateCompetitionEntry = [
    body('competitionId').isUUID().withMessage('Valid competition ID is required'),
    this.handleValidationErrors
  ];

  validateAdminAction = [
    body('action').isIn(['suspend', 'restore', 'delete']).withMessage('Valid action is required'),
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
    this.handleValidationErrors
  ];

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    
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
} 