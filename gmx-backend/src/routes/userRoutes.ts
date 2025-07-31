import { Router, Request, Response } from 'express';
import { UserService } from '../services/user/UserService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger();

// Initialize services (in a real app, these would be injected)
const userService = new UserService(
  {} as any, // DatabaseService
  {} as any, // JWTService
  {} as any  // Web3Service
);

const authMiddleware = new AuthMiddleware({} as any); // JWTService
const validationMiddleware = new ValidationMiddleware();

// User registration
router.post('/register', 
  validationMiddleware.validateUserRegistration,
  async (req: Request, res: Response) => {
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

    } catch (error: any) {
      logger.error('User registration error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  }
);

// User authentication
router.post('/authenticate',
  validationMiddleware.validateAuthentication,
  async (req: Request, res: Response) => {
    try {
      const { walletAddress, signature, message } = req.body;
      
      const authResult = await userService.authenticateUser(
        walletAddress,
        signature,
        message
      );

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token: authResult.token,
        user: authResult.user
      });

    } catch (error: any) {
      logger.error('User authentication error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed'
      });
    }
  }
);

// Get user profile (protected route)
router.get('/profile',
  authMiddleware.authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      const profile = await userService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        profile
      });

    } catch (error: any) {
      logger.error('Get user profile error:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Profile not found'
      });
    }
  }
);

// Update user profile (protected route)
router.put('/profile',
  authMiddleware.authenticate,
  validationMiddleware.validateProfileUpdate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const updates = req.body;
      
      const updatedUser = await userService.updateUserProfile(userId, updates);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error: any) {
      logger.error('Update user profile error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Profile update failed'
      });
    }
  }
);

// Create sub account (protected route)
router.post('/sub-accounts',
  authMiddleware.authenticate,
  validationMiddleware.validateSubAccount,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const accountData = req.body;
      
      const subAccount = await userService.createSubAccount(userId, accountData);

      res.status(201).json({
        success: true,
        message: 'Sub account created successfully',
        subAccount
      });

    } catch (error: any) {
      logger.error('Create sub account error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Sub account creation failed'
      });
    }
  }
);

// Get account history (protected route)
router.get('/history',
  authMiddleware.authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const history = await userService.getAccountHistory(userId);

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
      logger.error('Get account history error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get account history'
      });
    }
  }
);

// Get user by wallet address (public route for referral validation)
router.get('/wallet/:walletAddress',
  async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      
      // This would be implemented in the service
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

    } catch (error: any) {
      logger.error('Get user by wallet error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get user'
      });
    }
  }
);

// Refresh token (protected route)
router.post('/refresh-token',
  authMiddleware.authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      // This would generate a new token
      const newToken = await userService.refreshToken(userId);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      });

    } catch (error: any) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Token refresh failed'
      });
    }
  }
);

// Logout (protected route)
router.post('/logout',
  authMiddleware.authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      // This would invalidate the token
      await userService.logout(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Logout failed'
      });
    }
  }
);

export { router as userRoutes }; 