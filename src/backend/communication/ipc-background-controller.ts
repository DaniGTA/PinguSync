import { ipcMain } from 'electron'
import logger from '../logger/logger'
import DataPackage from './data-package'

export default class IPCBackgroundController {
    public static webcontents: Electron.WebContents | null = null

    public static send(channel: string, data?: any, trackingToken?: string): void {
        let success = false
        while (!success) {
            try {
                let onlyData = undefined
                if (data !== undefined) {
                    onlyData = JSON.parse(JSON.stringify(data))
                    if (onlyData === undefined && data != undefined) {
                        onlyData = data
                    }
                }
                if (this.webcontents) {
                    this.webcontents.send(channel, new DataPackage(onlyData, trackingToken))
                } else {
                    logger.error('No webcontents to send data')
                }
                logger.info('worker send: ' + channel)
                success = true
            } catch (err) {
                logger.error(err as string)
            }
        }
    }

    public static async on<T>(
        channel: string,
        f: ((data: T, trackingToken?: string) => void) | ((data: T, trackingToken?: string) => Promise<void>)
    ): Promise<void> {
        ipcMain.on(channel, async (event: Electron.IpcMainEvent, data: DataPackage<T>) => {
            logger.info('recieved: ' + channel)
            try {
                if (typeof data.data == 'string') {
                    await f(JSON.parse(data.data as string), data.trackingToken)
                }
            } catch (err) {
                logger.debug(err as string)
            }
            try {
                await f(data.data as T, data.trackingToken)
            } catch (err) {
                logger.error(err as string)
            }
        })
    }
}
