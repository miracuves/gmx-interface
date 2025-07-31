import { User, UserProfile, AuthToken, UserRegistration } from '../../models/User';
import { DatabaseService } from '../database/DatabaseService';
import { JWTService } from '../../utils/JWTService';
import { Web3Service } from '../blockchain/Web3Service';
export declare class UserService {
    private db;
    private jwt;
    private web3;
    private logger;
    constructor(db: DatabaseService, jwt: JWTService, web3: Web3Service);
    registerUser(userData: UserRegistration): Promise<User>;
    authenticateUser(walletAddress: string, signature: string, message: string): Promise<AuthToken>;
    getUserProfile(userId: string): Promise<UserProfile>;
    updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
    createSubAccount(userId: string, accountData: any): Promise<any>;
    getAccountHistory(userId: string): Promise<any[]>;
    private linkReferral;
    private isValidEmail;
}
//# sourceMappingURL=UserService.d.ts.map