export declare class Config {
    static get server(): {
        port: number;
        host: string;
        environment: string;
    };
    static get database(): {
        url: string;
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        pool: {
            min: number;
            max: number;
            idle: number;
            acquire: number;
        };
    };
    static get redis(): {
        url: string;
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    static get blockchain(): {
        arbitrum: {
            rpc: string;
            chainId: number;
            contracts: {
                vault: string;
                router: string;
                reader: string;
                rewardRouter: string;
            };
        };
        avalanche: {
            rpc: string;
            chainId: number;
            contracts: {
                vault: string;
                router: string;
                reader: string;
                rewardRouter: string;
            };
        };
    };
    static get jwt(): {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    static get cors(): {
        origins: string[];
    };
    static get email(): {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
    };
    static get logging(): {
        level: string;
        file: string;
        maxSize: string;
        maxFiles: string;
    };
    static get rateLimit(): {
        windowMs: number;
        max: number;
        message: string;
    };
    static get websocket(): {
        heartbeatInterval: number;
        maxPayload: number;
        perMessageDeflate: boolean;
    };
    static get advisor(): {
        defaultCommissionRate: number;
        maxCommissionRate: number;
        minCommissionRate: number;
    };
    static get competition(): {
        maxPrizePool: number;
        minParticipants: number;
        maxDuration: number;
    };
    static get trading(): {
        maxLeverage: number;
        minOrderSize: number;
        maxOrderSize: number;
        slippageTolerance: number;
    };
}
//# sourceMappingURL=Config.d.ts.map