import winston, { format } from 'winston';
const { combine, timestamp, prettyPrint, colorize, errors } = format;
let logger = winston.createLogger();
const logFormat = winston.format.printf((info) => {
  return new Date().toISOString() + `-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`;
});
try {
  winston.addColors({
    silly: 'magenta',
    debug: 'blue',
    verbose: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  });

  logger = winston.createLogger({
    format: combine(
      errors({ stack: true }), // <-- use errors format
      colorize(),
      timestamp(),
      prettyPrint()),
    level: 'info',
    transports: [
      new winston.transports.Console({ level: 'info' }),
    ],
  });
} catch (err) {
  logger.debug(err);
}

export default logger;
