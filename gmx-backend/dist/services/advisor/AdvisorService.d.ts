import { Advisor, Client, GroupTradeData, AdvisorRegistration } from '../../models/Advisor';
import { DatabaseService } from '../database/DatabaseService';
import { TradingService } from '../trading/TradingService';
import { NotificationService } from '../notification/NotificationService';
export declare class AdvisorService {
    private db;
    private tradingService;
    private notificationService;
    private logger;
    constructor(db: DatabaseService, tradingService: TradingService, notificationService: NotificationService);
    registerAdvisor(advisorData: AdvisorRegistration): Promise<Advisor>;
    linkClientToAdvisor(clientId: string, advisorCode: string): Promise<any>;
    unlinkClientFromAdvisor(clientId: string, advisorId: string): Promise<any>;
    executeGroupTrade(groupTradeData: GroupTradeData): Promise<any>;
    getAdvisorEarnings(advisorId: string, period: string): Promise<any>;
    getAdvisorClients(advisorId: string): Promise<Client[]>;
    getGroupTradeHistory(advisorId: string): Promise<any[]>;
    private trackAdvisorCommission;
    private generateAdvisorCode;
}
//# sourceMappingURL=AdvisorService.d.ts.map