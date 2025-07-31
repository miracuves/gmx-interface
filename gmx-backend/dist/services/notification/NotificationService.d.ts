export declare class NotificationService {
    private logger;
    constructor();
    sendAdvisorRegistrationNotification(advisor: any): Promise<void>;
    sendClientLinkedNotification(clientId: string, advisor: any): Promise<void>;
    sendAdvisorClientLinkedNotification(advisorId: string, clientId: string): Promise<void>;
    sendClientUnlinkedNotification(clientId: string, advisorId: string): Promise<void>;
}
//# sourceMappingURL=NotificationService.d.ts.map