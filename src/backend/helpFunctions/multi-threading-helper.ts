import { DataStream } from "scramjet";

export default class MultiThreadingHelper {
    static async runFunctionInWorker<T>(func: (...args: any) => Promise<T>, ...args: any): Promise<T> {
        return await new Promise(async (resolve, reject) => {
            DataStream
                .from(async function* () { yield func(...args); })
                .catch((x: Error) => reject(x))
                .stringify(x => resolve(x))
        })
    }
}
