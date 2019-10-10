import winston from 'winston';

let date = new Date().toISOString();
const logFormat = winston.format.printf((info) => {
  return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`;
});

const logger: winston.Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.combine(winston.format.colorize(), logFormat)),
    transports: [
        new winston.transports.Console({ level: 'info' }),
    ],
    
});

export default logger;
