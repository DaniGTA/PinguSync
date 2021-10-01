/* eslint-disable @typescript-eslint/no-var-requires */
import winston, { format } from 'winston'
import { FileTransportInstance, ConsoleTransportInstance } from 'winston/lib/winston/transports'

const { combine, timestamp, colorize, errors } = format
let logger = winston.createLogger()
try {
    winston.addColors({
        silly: 'magenta',
        debug: 'blue',
        verbose: 'cyan',
        info: 'green',
        warn: 'yellow',
        error: 'red',
    })

    const transports: Array<FileTransportInstance | ConsoleTransportInstance> = [
        new winston.transports.Console({ level: 'info' }),
    ]
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const isDev = require('electron-is-dev')
        if (isDev === false) {
            transports.push(new winston.transports.File({ filename: 'logs/log.log' }))
        }
    } catch (err) {
        // ignore
    }

    logger = winston.createLogger({
        format: combine(
            winston.format.splat(),
            errors({ stack: true }), // <-- use errors format
            colorize(),
            timestamp(),
            format.splat(),
            format.simple()
        ),
        level: 'info',
        transports: transports,
    })
} catch (err) {
    console.log(err as string)
}

export default logger
