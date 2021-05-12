import { ipcRenderer, IpcRenderer } from 'electron'

export default class WorkerController {
    public static getIpcRenderer(): IpcRenderer {
        return ipcRenderer
    }

    public static send(channel: string, data?: any): void {
        console.log('info', 'frontend send: ' + channel)
        try {
            ipcRenderer.send(channel, data)
        } catch (err) {
            console.error(data)
            console.error(err)
            throw new Error(err)
        }
    }

    public static on(channel: string, f: (data: any) => void): void {
        if (ipcRenderer.listenerCount(channel) !== 0) {
            console.error('Multi listeners: ' + ipcRenderer.listenerCount(channel))
        }
        ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, data: any) => {
            console.log('info', 'frontend recieved data on: ' + channel)
            f(data)
        })
    }

    public static removeListener(channel: string, f: (data: any) => void): void {
        ipcRenderer.removeListener('channel', f)
    }

    /**
     * @param channel will be use for recieving data and send data.
     * @param sendData data that will be send with the send request.
     */
    public static async getOnce<T>(channel: string, sendData?: any): Promise<T> {
        if (ipcRenderer.listenerCount(channel) !== 0) {
            console.error('Multi listeners on channel: ' + channel + ' :' + ipcRenderer.listenerCount(channel))
        }
        const promise = this.once<T>(channel)
        this.send(channel, sendData)
        return await promise
    }

    public static once<T>(channel: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            try {
                console.log('info', 'frontend list once: ' + channel)
                ipcRenderer.once(channel, (event: Electron.IpcRendererEvent, data: T) => {
                    console.log('info', 'frontend recieved: ' + channel)
                    console.debug('recieved data: ')
                    console.debug(data)
                    console.debug('recieved event: ')
                    console.debug(event)
                    resolve((data as any) as T)
                })
            } catch (err) {
                console.log('warn', 'frontend recieved error on channel: ' + channel)
                console.error(err)

                reject(err)
            }
        })
    }
}
