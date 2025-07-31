"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorService = void 0;
const Logger_1 = require("../../utils/Logger");
const ValidationError_1 = require("../../utils/ValidationError");
const Config_1 = require("../../config/Config");
class AdvisorService {
    constructor(db, tradingService, notificationService) {
        this.db = db;
        this.tradingService = tradingService;
        this.notificationService = notificationService;
        this.logger = new Logger_1.Logger();
    }
    async registerAdvisor(advisorData) {
        try {
            const user = await this.db.users.findById(advisorData.userId);
            if (!user) {
                throw new ValidationError_1.ValidationError('User not found');
            }
            const existingAdvisor = await this.db.advisors.findByUserId(advisorData.userId);
            if (existingAdvisor) {
                throw new ValidationError_1.ValidationError('User is already an advisor');
            }
            const advisorCode = this.generateAdvisorCode();
            const advisor = await this.db.advisors.create({
                userId: advisorData.userId,
                advisorCode,
                commissionRate: advisorData.commissionRate || Config_1.Config.advisor.defaultCommissionRate,
                description: advisorData.description,
                totalEarnings: BigInt(0),
                totalVolume: BigInt(0),
                totalClients: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await this.db.users.update(advisorData.userId, {
                role: 'advisor',
                updatedAt: new Date()
            });
            await this.notificationService.sendAdvisorRegistrationNotification(advisor);
            this.logger.info(`Advisor registered: ${advisor.advisorCode} for user: ${advisorData.userId}`);
            return advisor;
        }
        catch (error) {
            this.logger.error('Error registering advisor:', error);
            throw error;
        }
    }
    async linkClientToAdvisor(clientId, advisorCode) {
        try {
            const advisor = await this.db.advisors.findByCode(advisorCode);
            if (!advisor) {
                throw new ValidationError_1.ValidationError('Invalid advisor code');
            }
            const client = await this.db.users.findById(clientId);
            if (!client) {
                throw new ValidationError_1.ValidationError('Client not found');
            }
            const existingLink = await this.db.advisorClients.findByClient(clientId);
            if (existingLink) {
                throw new ValidationError_1.ValidationError('Client already linked to an advisor');
            }
            const link = await this.db.advisorClients.create({
                advisorId: advisor.id,
                clientId,
                linkedAt: new Date(),
                isActive: true,
                commissionRate: advisor.commissionRate
            });
            await this.db.advisors.update(advisor.id, {
                totalClients: advisor.totalClients + 1,
                updatedAt: new Date()
            });
            await this.notificationService.sendClientLinkedNotification(clientId, advisor);
            await this.notificationService.sendAdvisorClientLinkedNotification(advisor.id, clientId);
            this.logger.info(`Client linked to advisor: ${clientId} -> ${advisor.id}`);
            return { success: true, linkId: link.id };
        }
        catch (error) {
            this.logger.error('Error linking client to advisor:', error);
            throw error;
        }
    }
    async unlinkClientFromAdvisor(clientId, advisorId) {
        try {
            const link = await this.db.advisorClients.findByClientAndAdvisor(clientId, advisorId);
            if (!link) {
                throw new ValidationError_1.ValidationError('Client not linked to this advisor');
            }
            await this.db.advisorClients.update(link.id, {
                isActive: false,
                unlinkedAt: new Date()
            });
            const advisor = await this.db.advisors.findById(advisorId);
            if (advisor) {
                await this.db.advisors.update(advisorId, {
                    totalClients: Math.max(0, advisor.totalClients - 1),
                    updatedAt: new Date()
                });
            }
            await this.notificationService.sendClientUnlinkedNotification(clientId, advisorId);
            this.logger.info(`Client unlinked from advisor: ${clientId} -> ${advisorId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error('Error unlinking client from advisor:', error);
            throw error;
        }
    }
    async executeGroupTrade(groupTradeData) {
        try {
            const advisor = await this.db.advisors.findById(groupTradeData.advisorId);
            if (!advisor) {
                throw new ValidationError_1.ValidationError('Advisor not found');
            }
            const linkedClients = await this.db.advisorClients.findByAdvisor(groupTradeData.advisorId);
            const activeClients = linkedClients.filter(client => client.isActive);
            if (activeClients.length === 0) {
                throw new ValidationError_1.ValidationError('No active clients found');
            }
            const tradeResults = await Promise.all(activeClients.map(async (client) => {
                try {
                    const order = {
                        userId: client.clientId,
                        marketId: groupTradeData.marketId,
                        orderType: groupTradeData.orderType,
                        side: groupTradeData.side,
                        sizeUsd: groupTradeData.sizeUsd,
                        leverage: groupTradeData.leverage,
                        price: groupTradeData.price,
                        stopLoss: groupTradeData.stopLoss,
                        takeProfit: groupTradeData.takeProfit
                    };
                    const result = await this.tradingService.placeOrder(order);
                    await this.trackAdvisorCommission(result.orderId, advisor.id, client.commissionRate);
                    return {
                        clientId: client.clientId,
                        success: true,
                        orderId: result.orderId,
                        txHash: result.txHash
                    };
                }
                catch (error) {
                    return {
                        clientId: client.clientId,
                        success: false,
                        error: error.message
                    };
                }
            }));
            const groupTrade = await this.db.groupTrades.create({
                advisorId: groupTradeData.advisorId,
                marketId: groupTradeData.marketId,
                orderType: groupTradeData.orderType,
                side: groupTradeData.side,
                sizeUsd: groupTradeData.sizeUsd,
                leverage: groupTradeData.leverage,
                commissionRate: groupTradeData.commissionRate,
                results: tradeResults,
                createdAt: new Date()
            });
            this.logger.info(`Group trade executed: ${groupTrade.id} by advisor: ${groupTradeData.advisorId}`);
            return {
                groupTradeId: groupTrade.id,
                results: tradeResults,
                successCount: tradeResults.filter(r => r.success).length,
                totalCount: tradeResults.length
            };
        }
        catch (error) {
            this.logger.error('Error executing group trade:', error);
            throw error;
        }
    }
    async getAdvisorEarnings(advisorId, period) {
        try {
            const earnings = await this.db.commissions.getAdvisorEarnings(advisorId, period);
            const report = {
                advisorId,
                period,
                totalEarnings: earnings.total,
                commissionBreakdown: earnings.breakdown,
                clientCount: earnings.clientCount,
                tradeCount: earnings.tradeCount,
                averageCommission: earnings.average
            };
            return report;
        }
        catch (error) {
            this.logger.error('Error getting advisor earnings:', error);
            throw error;
        }
    }
    async getAdvisorClients(advisorId) {
        try {
            const clients = await this.db.advisorClients.findByAdvisor(advisorId);
            const enrichedClients = await Promise.all(clients.map(async (client) => {
                const user = await this.db.users.findById(client.clientId);
                const tradingStats = await this.db.trades.getUserStats(client.clientId);
                return {
                    ...client,
                    user: {
                        id: user?.id,
                        walletAddress: user?.walletAddress,
                        email: user?.email
                    },
                    tradingStats
                };
            }));
            return enrichedClients;
        }
        catch (error) {
            this.logger.error('Error getting advisor clients:', error);
            throw error;
        }
    }
    async getGroupTradeHistory(advisorId) {
        try {
            const history = await this.db.groupTrades.findByAdvisor(advisorId);
            return history;
        }
        catch (error) {
            this.logger.error('Error getting group trade history:', error);
            throw error;
        }
    }
    async trackAdvisorCommission(orderId, advisorId, commissionRate) {
        try {
            const order = await this.db.trades.findById(orderId);
            if (!order) {
                return;
            }
            const commissionAmount = (BigInt(order.sizeUsd) * BigInt(commissionRate)) / BigInt(10000);
            await this.db.commissions.create({
                advisorId,
                orderId,
                commissionAmount,
                commissionRate,
                tradeVolume: order.sizeUsd,
                status: 'pending',
                createdAt: new Date()
            });
            this.logger.info(`Advisor commission tracked: ${advisorId} -> ${orderId}`);
        }
        catch (error) {
            this.logger.error('Error tracking advisor commission:', error);
        }
    }
    generateAdvisorCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.AdvisorService = AdvisorService;
//# sourceMappingURL=AdvisorService.js.map