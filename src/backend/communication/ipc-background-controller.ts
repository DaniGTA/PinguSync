import { ipcMain } from 'electron'
import logger from '../logger/logger'
import ICommunication from './icommunication'

export default class IPCBackgroundController implements ICommunication {
    private webcontents: Electron.webContents

    constructor(webcontents: Electron.webContents) {
        this.webcontents = webcontents
    }

    public send(channel: string, data?: any): void {
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
                this.webcontents.send(channel, onlyData)
                logger.log('info', 'worker send: ' + channel)
                success = true
            } catch (err) {
                logger.error(err)
            }
        }
    }

    public async on(channel: string, f: ((data: any) => void) | ((data: any) => Promise<void>)): Promise<void> {
        ipcMain.on(channel, async (event: Electron.IpcMainEvent, data: any) => {
            logger.log('info', 'recieved: ' + channel)
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
