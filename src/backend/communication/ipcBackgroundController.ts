import { ipcMain } from 'electron';
import ICommunication from './ICommunication';

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
                console.log("worker send: " + channel);
                success = true;
            } catch (err) {
                this.webcontents.send(channel);
                console.log(err);
            }
        }
    }

    public async on(channel: string, f: (data: any) => void) {
        ipcMain.on(channel, (event: Electron.IpcMainEvent, data: any) => {
            console.log('recieved: ' + channel)
            try {
                f(JSON.parse(data));
            } catch (err) {
                f(data);
            }
        })
    }
}
