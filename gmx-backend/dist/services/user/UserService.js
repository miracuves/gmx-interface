"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const Logger_1 = require("../../utils/Logger");
const ValidationError_1 = require("../../utils/ValidationError");
class UserService {
    constructor(db, jwt, web3) {
        this.db = db;
        this.jwt = jwt;
        this.web3 = web3;
        this.logger = new Logger_1.Logger();
    }
    async registerUser(userData) {
        try {
            if (!this.web3.isValidAddress(userData.walletAddress)) {
                throw new ValidationError_1.ValidationError('Invalid wallet address');
            }
            const existingUser = await this.db.users.findByWallet(userData.walletAddress);
            if (existingUser) {
                throw new ValidationError_1.ValidationError('User already exists');
            }
            const user = await this.db.users.create({
                email: userData.email,
                walletAddress: userData.walletAddress.toLowerCase(),
                referralCode: userData.referralCode,
                role: 'user',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            if (userData.referralCode) {
                await this.linkReferral(user.id, userData.referralCode);
            }
            this.logger.info(`User registered: ${user.walletAddress}`);
            return user;
        }
        catch (error) {
            this.logger.error('Error registering user:', error);
            throw error;
        }
    }
    async authenticateUser(walletAddress, signature, message) {
        try {
            const isValidSignature = await this.web3.verifySignature(walletAddress, signature, message);
            if (!isValidSignature) {
                throw new ValidationError_1.ValidationError('Invalid signature');
            }
            let user = await this.db.users.findByWallet(walletAddress.toLowerCase());
            if (!user) {
                user = await this.registerUser({
                    walletAddress,
                    email: '',
                    referralCode: undefined
                });
            }
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
        }
        catch (error) {
            this.logger.error('Error authenticating user:', error);
            throw error;
        }
    }
    async getUserProfile(userId) {
        try {
            const user = await this.db.users.findById(userId);
            if (!user) {
                throw new ValidationError_1.ValidationError('User not found');
            }
            const tradingStats = await this.db.trades.getUserStats(userId);
            const stakingInfo = await this.db.staking.getUserStaking(userId);
            const referralInfo = await this.db.referrals.getUserReferrals(userId);
            return {
                ...user,
                tradingStats,
                stakingInfo,
                referralInfo
            };
        }
        catch (error) {
            this.logger.error('Error getting user profile:', error);
            throw error;
        }
    }
    async updateUserProfile(userId, updates) {
        try {
            const user = await this.db.users.findById(userId);
            if (!user) {
                throw new ValidationError_1.ValidationError('User not found');
            }
            if (updates.email && !this.isValidEmail(updates.email)) {
                throw new ValidationError_1.ValidationError('Invalid email address');
            }
            const updatedUser = await this.db.users.update(userId, {
                ...updates,
                updatedAt: new Date()
            });
            this.logger.info(`User profile updated: ${userId}`);
            return updatedUser;
        }
        catch (error) {
            this.logger.error('Error updating user profile:', error);
            throw error;
        }
    }
    async createSubAccount(userId, accountData) {
        try {
            const user = await this.db.users.findById(userId);
            if (!user) {
                throw new ValidationError_1.ValidationError('User not found');
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
        }
        catch (error) {
            this.logger.error('Error creating sub account:', error);
            throw error;
        }
    }
    async getAccountHistory(userId) {
        try {
            const history = await this.db.accountHistory.findByUser(userId);
            return history;
        }
        catch (error) {
            this.logger.error('Error getting account history:', error);
            throw error;
        }
    }
    async linkReferral(userId, referralCode) {
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
        }
        catch (error) {
            this.logger.error('Error linking referral:', error);
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map