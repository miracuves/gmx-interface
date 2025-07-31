declare class GMXBackend {
    private app;
    private server;
    private wss;
    private logger;
    private db;
    private redis;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    private setupWebSocket;
    private initializeServices;
    private initializeBlockchainServices;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export default GMXBackend;
//# sourceMappingURL=index.d.ts.map