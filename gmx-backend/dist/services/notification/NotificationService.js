"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Logger_1 = require("../../utils/Logger");
class NotificationService {
    constructor() {
        this.logger = new Logger_1.Logger();
    }
    async sendAdvisorRegistrationNotification(advisor) {
        this.logger.info('Advisor registration notification sent', { advisorId: advisor.id });
    }
    async sendClientLinkedNotification(clientId, advisor) {
        this.logger.info('Client linked notification sent', { clientId, advisorId: advisor.id });
    }
    async sendAdvisorClientLinkedNotification(advisorId, clientId) {
        this.logger.info('Advisor client linked notification sent', { advisorId, clientId });
    }
    async sendClientUnlinkedNotification(clientId, advisorId) {
        this.logger.info('Client unlinked notification sent', { clientId, advisorId });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map