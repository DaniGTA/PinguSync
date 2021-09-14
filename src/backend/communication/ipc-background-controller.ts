import { ipcMain } from 'electron'
import logger from '../logger/logger'

export default class IPCBackgroundController {
    public static webcontents: Electron.WebContents | null = null

    public static send(channel: string, data?: any): void {
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
                    this.webcontents.send(channel, onlyData)
                } else {
                    logger.error('No webcontents to send data')
                }
                logger.info('worker send: ' + channel)
                success = true
            } catch (err) {
                logger.error(err)
            }
        }
    }

    public static async on(channel: string, f: ((data: any) => void) | ((data: any) => Promise<void>)): Promise<void> {
        ipcMain.on(channel, async (event: Electron.IpcMainEvent, data: any) => {
            logger.info('recieved: ' + channel)
            try {
                if (data) {
                    await f(JSON.parse(data))
                } else {
                    await f(data)
                }
            } catch (err) {
                logger.debug(err)
            }
            try {
                await f(data)
            } catch (err) {
                logger.error(err)
            }
        })
    }
}
