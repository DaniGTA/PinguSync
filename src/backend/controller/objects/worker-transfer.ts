export class WorkerTransfer {
    channel: string;
    data?: any;
    constructor(channel: string, data?: any) {
        this.channel = channel;
        this.data = data;
    }
}