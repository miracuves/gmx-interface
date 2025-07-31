export declare class Web3Service {
    private logger;
    constructor();
    initialize(): Promise<void>;
    isValidAddress(address: string): boolean;
    verifySignature(walletAddress: string, signature: string, message: string): Promise<boolean>;
}
//# sourceMappingURL=Web3Service.d.ts.map