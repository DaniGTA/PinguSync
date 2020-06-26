import { ipcMain } from 'electron';
import logger from '../logger/logger';
import ICommunication from './icommunication';

export default class IPCBackgroundController implements ICommunication {
    private webcontents: Electron.webContents;

    constructor(webcontents: Electron.webContents) {
        this.webcontents = webcontents;
    }

    public send(channel: string, data?: any): void {
        let success = false;
        while (!success) {
            try {
                this.webcontents.send(channel, data);
                logger.log('info', 'worker send: ' + channel);
                success = true;
            } catch (err) {
                logger.error( err);
            }
        }
    }

    public async on(channel: string, f: ((data: any) => void) | ((data: any) => Promise<void>)): Promise<void> {
        ipcMain.on(channel, async (event: Electron.IpcMainEvent, data: any) => {
            logger.log('info', 'recieved: ' + channel);
            try {
                await f(JSON.parse(data));
            } catch (err) {
                try {
                    await f(data);
                } catch (err) {
                    logger.error(err);
                }
            }
        });
    }
}
