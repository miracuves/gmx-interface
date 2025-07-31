import winston from 'winston';
import { Config } from '../config/Config';

export class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: Config.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'gmx-backend' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File transport
        new winston.transports.File({
          filename: Config.logging.file,
          maxsize: parseInt(Config.logging.maxSize) || 10485760, // 10MB default
          maxFiles: parseInt(Config.logging.maxFiles) || 5
        })
      ]
    });

    // Add error file transport
    this.logger.add(new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: parseInt(Config.logging.maxSize) || 10485760, // 10MB default
      maxFiles: parseInt(Config.logging.maxFiles) || 5
    }));
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  silly(message: string, meta?: any): void {
    this.logger.silly(message, meta);
  }
} 