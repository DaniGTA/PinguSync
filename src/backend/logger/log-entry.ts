export default class LogEntry {
    public level: string;
    public message: string;
    public meta: any;
    constructor(level: string, msg: string, meta?: any) {
        this.level = level;
        this.message = msg;
        this.meta = meta;
    }
}
