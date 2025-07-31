export interface JWTPayload {
    userId: string;
    walletAddress: string;
    role: string;
    iat?: number;
    exp?: number;
}
export declare class JWTService {
    private logger;
    private secret;
    private expiresIn;
    private refreshExpiresIn;
    constructor();
    generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    verifyToken(token: string): JWTPayload;
    decodeToken(token: string): JWTPayload | null;
    isTokenExpired(token: string): boolean;
    getTokenExpiration(token: string): Date | null;
    refreshToken(refreshToken: string): string;
    generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    private getExpirationTime;
}
//# sourceMappingURL=JWTService.d.ts.map