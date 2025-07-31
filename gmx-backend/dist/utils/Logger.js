"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const Config_1 = require("../config/Config");
class Logger {
    constructor() {
        this.logger = winston_1.default.createLogger({
            level: Config_1.Config.logging.level,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'gmx-backend' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                }),
                new winston_1.default.transports.File({
                    filename: Config_1.Config.logging.file,
                    maxsize: Config_1.Config.logging.maxSize,
                    maxFiles: Config_1.Config.logging.maxFiles
                })
            ]
        });
        this.logger.add(new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: Config_1.Config.logging.maxSize,
            maxFiles: Config_1.Config.logging.maxFiles
        }));
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    verbose(message, meta) {
        this.logger.verbose(message, meta);
    }
    silly(message, meta) {
        this.logger.silly(message, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map