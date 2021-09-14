export default interface ICommunication {
    static on(channel: string, f: ((data: any) => void) | ((data: any) => Promise<void>)): Promise<void>
    send(channel: string, data?: any): void
}
