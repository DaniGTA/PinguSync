import { ipcMain } from 'electron';
import logger from '../logger/logger';
import ICommunication from './icommunication';

export default class IPCBackgroundController implements ICommunication {
    private webcontents: Electron.webContents;

    constructor(webcontents: Electron.webContents) {
        this.webcontents = webcontents;
    }

    public send(channel: string, data?: any) {
        let success = false;
        while (!success) {
            try {
                this.webcontents.send(channel, data);
                logger.log('info', 'worker send: ' + channel);
                success = true;
            } catch (err) {
                this.webcontents.send(channel);
                logger.log('info', err);
            }
        }
    }

    public async on(channel: string, f: (data: any) => void) {
        ipcMain.on(channel, (event: Electron.IpcMainEvent, data: any) => {
           logger.log('info', 'recieved: ' + channel);
           try {
                f(JSON.parse(data));
            } catch (err) {
                f(data);
            }
        });
    }
}
