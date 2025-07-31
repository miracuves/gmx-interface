export declare class GMXContractService {
    private web3Service;
    private logger;
    constructor(web3Service: any);
    initialize(): Promise<void>;
    executeOrder(order: any): Promise<string>;
    getPosition(marketId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=GMXContractService.d.ts.map