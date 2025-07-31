import { Router, Request, Response } from 'express';
import { AdvisorService } from '../services/advisor/AdvisorService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger();

// Initialize services (in a real app, these would be injected)
const advisorService = new AdvisorService(
  {} as any, // DatabaseService
  {} as any, // TradingService
  {} as any  // NotificationService
);

const authMiddleware = new AuthMiddleware({} as any); // JWTService
const validationMiddleware = new ValidationMiddleware();

// Register as advisor (protected route)
router.post('/register',
  authMiddleware.authenticate,
  validationMiddleware.validateAdvisorRegistration,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
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

    } catch (error: any) {
      logger.error('Advisor registration error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Advisor registration failed'
      });
    }
  }
);

// Link client to advisor (protected route)
router.post('/link-client',
  authMiddleware.authenticate,
  validationMiddleware.validateClientLinking,
  async (req: Request, res: Response) => {
    try {
      const clientId = (req as any).user.id;
      const { advisorCode } = req.body;
      
      const result = await advisorService.linkClientToAdvisor(clientId, advisorCode);

      res.status(200).json({
        success: true,
        message: 'Successfully linked to advisor',
        linkId: result.linkId
      });

    } catch (error: any) {
      logger.error('Client linking error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to link to advisor'
      });
    }
  }
);

// Unlink client from advisor (protected route)
router.post('/unlink-client',
  authMiddleware.authenticate,
  validationMiddleware.validateClientUnlinking,
  async (req: Request, res: Response) => {
    try {
      const clientId = (req as any).user.id;
      const { advisorId } = req.body;
      
      const result = await advisorService.unlinkClientFromAdvisor(clientId, advisorId);

      res.status(200).json({
        success: true,
        message: 'Successfully unlinked from advisor'
      });

    } catch (error: any) {
      logger.error('Client unlinking error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to unlink from advisor'
      });
    }
  }
);

// Execute group trade (advisor only)
router.post('/group-trade',
  authMiddleware.authenticate,
  authMiddleware.requireRole('advisor'),
  validationMiddleware.validateGroupTrade,
  async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user.id;
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

    } catch (error: any) {
      logger.error('Group trade execution error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Group trade execution failed'
      });
    }
  }
);

// Get advisor earnings (advisor only)
router.get('/earnings',
  authMiddleware.authenticate,
  authMiddleware.requireRole('advisor'),
  async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user.id;
      const { period = '30d' } = req.query;
      
      const earnings = await advisorService.getAdvisorEarnings(advisorId, period as string);

      res.status(200).json({
        success: true,
        earnings
      });

    } catch (error: any) {
      logger.error('Get advisor earnings error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get earnings'
      });
    }
  }
);

// Get advisor clients (advisor only)
router.get('/clients',
  authMiddleware.authenticate,
  authMiddleware.requireRole('advisor'),
  async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user.id;
      
      const clients = await advisorService.getAdvisorClients(advisorId);

      res.status(200).json({
        success: true,
        clients
      });

    } catch (error: any) {
      logger.error('Get advisor clients error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get clients'
      });
    }
  }
);

// Get group trade history (advisor only)
router.get('/group-trades',
  authMiddleware.authenticate,
  authMiddleware.requireRole('advisor'),
  async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const history = await advisorService.getGroupTradeHistory(advisorId);

      res.status(200).json({
        success: true,
        history,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: history.length
        }
      });

    } catch (error: any) {
      logger.error('Get group trade history error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get group trade history'
      });
    }
  }
);

// Get advisor profile (public route for advisor lookup)
router.get('/:advisorCode',
  async (req: Request, res: Response) => {
    try {
      const { advisorCode } = req.params;
      
      // This would be implemented in the service
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

    } catch (error: any) {
      logger.error('Get advisor profile error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get advisor profile'
      });
    }
  }
);

// Get advisor stats (advisor only)
router.get('/stats/overview',
  authMiddleware.authenticate,
  authMiddleware.requireRole('advisor'),
  async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user.id;
      
      // This would be implemented in the service
      const stats = await advisorService.getAdvisorStats(advisorId);

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error: any) {
      logger.error('Get advisor stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get advisor stats'
      });
    }
  }
);

// Update advisor profile (advisor only)
router.put('/profile',
  authMiddleware.authenticate,
  authMiddleware.requireRole('advisor'),
  validationMiddleware.validateAdvisorProfileUpdate,
  async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user.id;
      const updates = req.body;
      
      // This would be implemented in the service
      const updatedAdvisor = await advisorService.updateAdvisorProfile(advisorId, updates);

      res.status(200).json({
        success: true,
        message: 'Advisor profile updated successfully',
        advisor: updatedAdvisor
      });

    } catch (error: any) {
      logger.error('Update advisor profile error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update advisor profile'
      });
    }
  }
);

// Get advisor analytics (admin only)
router.get('/analytics/overview',
  authMiddleware.authenticate,
  authMiddleware.requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query;
      
      // This would be implemented in the service
      const analytics = await advisorService.getAdvisorAnalytics(period as string);

      res.status(200).json({
        success: true,
        analytics
      });

    } catch (error: any) {
      logger.error('Get advisor analytics error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get advisor analytics'
      });
    }
  }
);

export { router as advisorRoutes }; 