/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export class WorkerTransfer {
    public channel: string
    public data?: any
    constructor(channel: string, data?: any) {
        this.channel = channel
        this.data = data
    }
}
