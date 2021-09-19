import { IpcRenderer } from 'electron'
import DataPackage from './data-package'

const electron = window.require('electron')

export default class WorkerController {
    public static getIpcRenderer(): IpcRenderer {
        return electron.ipcRenderer
    }

    public static send<T>(channel: string, data?: T, trackingToken?: string): void {
        console.log('info', `frontend send: ${channel}`)
        try {
            this.getIpcRenderer().send(channel, new DataPackage(data, trackingToken))
        } catch (err) {
            console.error(data)
            console.error(err)
            throw new Error(err as string)
        }
    }

    public static on<T>(channel: string, f: (data: T) => void): void {
        if (this.getIpcRenderer().listenerCount(channel) !== 0) {
            console.error(`Multi listeners: ${this.getIpcRenderer().listenerCount(channel)}`)
        }
        this.getIpcRenderer().on(channel, (event: Electron.IpcRendererEvent, dataPackage: DataPackage<T>) => {
            console.log('info', `frontend recieved data on: ${channel}`)
            f(dataPackage.data as T)
        })
    }

    public static removeListener(channel: string, f: (data: any) => void): void {
        this.getIpcRenderer().removeListener('channel', f)
    }

    /**
     * @param channel will be use for recieving data and send data.
     * @param sendData data that will be send with the send request.
     */
    public static async getOnce<T>(channel: string, sendData?: any): Promise<T> {
        if (this.getIpcRenderer().listenerCount(channel) !== 0) {
            console.error(`Multi listeners on channel: ${channel} :${this.getIpcRenderer().listenerCount(channel)}`)
        }
        const trackingToken = this.getNewTrackingToken()
        const promise = this.once<T>(channel, trackingToken)
        this.send(channel, sendData, trackingToken)
        return promise
    }

    public static once<T>(channel: string, trackingToken?: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            try {
                console.log('info', `frontend list once: ${channel}`)
                this.getIpcRenderer().once(channel, (event: Electron.IpcRendererEvent, dataPackage: DataPackage<T>) => {
                    if (trackingToken !== undefined) {
                        if (trackingToken == dataPackage.trackingToken) {
                            console.log(
                                'info',
                                `frontend recieved: ${channel} (requestedToken: ${trackingToken ??
                                    ''}) (dataToken: ${dataPackage.trackingToken ?? ''})`
                            )
                            console.debug('recieved data: ')
                            console.debug(dataPackage)
                            resolve(dataPackage.data as T)
                        } else {
                            this.once<T>(channel, trackingToken)
                                .then(x => resolve(x))
                                .catch(x => reject(x))
                        }
                    } else {
                        console.log(
                            'info',
                            `frontend recieved: ${channel} (requestedToken: ${trackingToken ??
                                ''}) (dataToken: ${dataPackage.trackingToken ?? ''})`
                        )
                        console.debug('recieved data: ')
                        console.debug(dataPackage)
                        resolve(dataPackage.data as T)
                    }
                })
            } catch (err) {
                console.log('warn', 'frontend recieved error on channel: ' + channel)
                console.error(err)

                reject(err)
            }
        })
    }

    public static getNewTrackingToken(): string {
        return (+new Date()).toString(36).slice(-5)
    }
}
