import { User, UserProfile, AuthToken, UserRegistration } from '../../models/User';
import { DatabaseService } from '../database/DatabaseService';
import { JWTService } from '../../utils/JWTService';
import { Web3Service } from '../blockchain/Web3Service';
import { Logger } from '../../utils/Logger';
import { ValidationError } from '../../utils/ValidationError';

export class UserService {
  private logger: Logger;

  constructor(
    private db: DatabaseService,
    private jwt: JWTService,
    private web3: Web3Service
  ) {
    this.logger = new Logger();
  }

  async registerUser(userData: UserRegistration): Promise<User> {
    try {
      // Validate wallet address
      if (!this.web3.isValidAddress(userData.walletAddress)) {
        throw new ValidationError('Invalid wallet address');
      }

      // Check if user already exists
      const existingUser = await this.db.users.findByWallet(userData.walletAddress);
      if (existingUser) {
        throw new ValidationError('User already exists');
      }

      // Create user
      const user = await this.db.users.create({
        email: userData.email,
        walletAddress: userData.walletAddress.toLowerCase(),
        referralCode: userData.referralCode,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // If referral code provided, link to referrer
      if (userData.referralCode) {
        await this.linkReferral(user.id, userData.referralCode);
      }

      this.logger.info(`User registered: ${user.walletAddress}`);
      return user;

    } catch (error) {
      this.logger.error('Error registering user:', error);
      throw error;
    }
  }

  async authenticateUser(walletAddress: string, signature: string, message: string): Promise<AuthToken> {
    try {
      // Verify signature
      const isValidSignature = await this.web3.verifySignature(
        walletAddress,
        signature,
        message
      );

      if (!isValidSignature) {
        throw new ValidationError('Invalid signature');
      }

      // Get or create user
      let user = await this.db.users.findByWallet(walletAddress.toLowerCase());
      if (!user) {
        user = await this.registerUser({ 
          walletAddress, 
          email: '',
          referralCode: undefined
        });
      }

      // Generate JWT token
      const token = this.jwt.generateToken({
        userId: user.id,
        walletAddress: user.walletAddress,
        role: user.role
      });

      this.logger.info(`User authenticated: ${user.walletAddress}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          role: user.role
        }
      };

    } catch (error) {
      this.logger.error('Error authenticating user:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await this.db.users.findById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      // Get trading stats
      const tradingStats = await this.db.trades.getUserStats(userId);
      
      // Get staking info
      const stakingInfo = await this.db.staking.getUserStaking(userId);
      
      // Get referral info
      const referralInfo = await this.db.referrals.getUserReferrals(userId);

      return {
        ...user,
        tradingStats,
        stakingInfo,
        referralInfo
      };

    } catch (error) {
      this.logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const user = await this.db.users.findById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      // Validate updates
      if (updates.email && !this.isValidEmail(updates.email)) {
        throw new ValidationError('Invalid email address');
      }

      const updatedUser = await this.db.users.update(userId, {
        ...updates,
        updatedAt: new Date()
      });

      this.logger.info(`User profile updated: ${userId}`);
      return updatedUser;

    } catch (error) {
      this.logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  async createSubAccount(userId: string, accountData: any): Promise<any> {
    try {
      const user = await this.db.users.findById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      const subAccount = await this.db.subAccounts.create({
        userId,
        name: accountData.name,
        description: accountData.description,
        isActive: true,
        createdAt: new Date()
      });

      this.logger.info(`Sub account created: ${subAccount.id} for user: ${userId}`);
      return subAccount;

    } catch (error) {
      this.logger.error('Error creating sub account:', error);
      throw error;
    }
  }

  async getAccountHistory(userId: string): Promise<any[]> {
    try {
      const history = await this.db.accountHistory.findByUser(userId);
      return history;

    } catch (error) {
      this.logger.error('Error getting account history:', error);
      throw error;
    }
  }

  private async linkReferral(userId: string, referralCode: string): Promise<void> {
    try {
      const referrer = await this.db.users.findByReferralCode(referralCode);
      if (!referrer) {
        this.logger.warn(`Invalid referral code: ${referralCode}`);
        return;
      }

      await this.db.referrals.create({
        referrerId: referrer.id,
        referredId: userId,
        referralCode,
        createdAt: new Date()
      });

      this.logger.info(`Referral linked: ${referrer.id} -> ${userId}`);

    } catch (error) {
      this.logger.error('Error linking referral:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 