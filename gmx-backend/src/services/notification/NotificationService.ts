import { Logger } from '../../utils/Logger';

export class NotificationService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  async sendAdvisorRegistrationNotification(advisor: any): Promise<void> {
    this.logger.info('Advisor registration notification sent', { advisorId: advisor.id });
  }

  async sendClientLinkedNotification(clientId: string, advisor: any): Promise<void> {
    this.logger.info('Client linked notification sent', { clientId, advisorId: advisor.id });
  }

  async sendAdvisorClientLinkedNotification(advisorId: string, clientId: string): Promise<void> {
    this.logger.info('Advisor client linked notification sent', { advisorId, clientId });
  }

  async sendClientUnlinkedNotification(clientId: string, advisorId: string): Promise<void> {
    this.logger.info('Client unlinked notification sent', { clientId, advisorId });
  }
} 