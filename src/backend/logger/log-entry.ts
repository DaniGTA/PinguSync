/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
export default class LogEntry {
    public level: string
    public message: string
    public meta: any
    constructor(level: string, msg: string, meta?: any) {
        this.level = level
        this.message = msg
        this.meta = meta
    }
}
