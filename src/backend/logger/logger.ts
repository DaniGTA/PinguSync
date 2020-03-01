import winston from 'winston';
let logger = winston.createLogger();
const logFormat = winston.format.printf((info) => {
  return new Date().toISOString() + `-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`;
});
let errorsFormat;
try {
  errorsFormat = winston.format.errors({ stack: true });
  logger = winston.createLogger({
    format: winston.format.combine(winston.format.combine(winston.format.colorize(), logFormat, errorsFormat)),
    level: 'info',
    transports: [
      new winston.transports.Console({ level: 'info' }),
    ],
  });
} catch (err) {
  logger.debug(err);
}

export default logger;
