export class WorkerTransfer {
    public channel: string;
    public data?: any;
    constructor(channel: string, data?: any) {
        this.channel = channel;
        this.data = data;
    }
}
