import winston, { format } from 'winston';
import { FileTransportInstance, ConsoleTransportInstance } from 'winston/lib/winston/transports';
import isDev from 'electron-is-dev';

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

  const transports: Array<FileTransportInstance | ConsoleTransportInstance> = [
    new winston.transports.Console({ level: 'info' }),
  ];

  if (isDev === false) {
    transports.push(new winston.transports.File({ filename: 'logs/log.log' })
    );
  }

  logger = winston.createLogger({
    format: combine(
      errors({ stack: true }), // <-- use errors format
      colorize(),
      timestamp(),
      format.splat(),
      format.simple()
    ),
    level: 'info',
    transports: transports,
  });
} catch (err) {
  logger.debug(err);
}

export default logger;
